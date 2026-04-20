from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form, BackgroundTasks
from ..database import videos_collection, recommendations_collection, feedback_collection
from ..utils.helper_functions import generate_id
from ..utils.jwt_handler import get_current_user
from ..config import settings
from ..services.cloudinary_service import CloudinaryService
from ..config import settings
from ..models.video_model import video_document
from datetime import datetime, timezone
import hashlib
import os
import sys
from pathlib import Path

# Add Backend directory to path for ai_engine imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from ai_engine.service import analyze_video

TEMP_VIDEO_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp_videos")
os.makedirs(TEMP_VIDEO_DIR, exist_ok=True)

router = APIRouter()


@router.get("/{video_id}/progress")
async def get_video_progress(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Lightweight polling endpoint for real-time processing progress.
    Returns progress percentage, stage name, and status.
    """
    video = await videos_collection().find_one(
        {"_id": video_id},
        {"processing_progress": 1, "processing_stage": 1, "status": 1, "user_id": 1}
    )

    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    if video.get("user_id") != current_user.get("user_id"):
        raise HTTPException(status_code=403, detail="Unauthorized")

    return {
        "status": video.get("status", "processing"),
        "progress": video.get("processing_progress", 0),
        "stage": video.get("processing_stage", "Starting..."),
    }



@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    intelligent_query: str = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a video to Cloudinary with duplicate detection.

    Args:
        file: Video file to upload
        intelligent_query: User's query/description for the video
        current_user: Authenticated user information

    Returns:
        Dictionary with video_id, file_url, and status
    """
    # Validate file format
    if not file.filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv", ".webm")):
        raise HTTPException(
            status_code=400, detail="Unsupported file format. Supported formats: MP4, AVI, MOV, MKV, WEBM")

    user_id = current_user.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=401, detail="Invalid user authentication")

    try:
        # Read file content for hash calculation and validate size
        file_content = await file.read()

        # Enforce maximum upload size (bytes -> MB)
        try:
            max_mb = int(settings.MAX_UPLOAD_SIZE_MB)
        except Exception:
            max_mb = 300
        size_mb = len(file_content) / (1024 * 1024)
        if size_mb > max_mb:
            raise HTTPException(
                status_code=400,
                detail=f"Video file size {size_mb:.2f} MB exceeds maximum allowed size of {max_mb} MB."
            )

        # Calculate video hash for duplicate detection
        video_hash = hashlib.sha256(file_content).hexdigest()

        # Check if video with same hash already exists for this user
        existing_video = await videos_collection().find_one({
            "user_id": user_id,
            "video_hash": video_hash
        })

        if existing_video:
            return {
                "video_id": existing_video["_id"],
                "file_url": existing_video.get("file_url", ""),
                "status": "duplicate",
                "original_status": existing_video.get("status", "unknown"),
                "message": "This video was already uploaded. Showing previous recommendations."
            }

        # Save locally for AI processing (write from in-memory bytes)
        local_filename = f"{user_id}_{generate_id().replace('-', '')}_{file.filename}"
        local_path = os.path.join(TEMP_VIDEO_DIR, local_filename)
        
        with open(local_path, "wb") as buffer:
            buffer.write(file_content)
        print(f"[Upload] Saved local copy for AI processing: {local_path}")
            
        # Reset file position for Cloudinary upload
        await file.seek(0)

        # Upload video to Cloudinary
        cloudinary_result = await CloudinaryService.upload_video(file, user_id)

        if not cloudinary_result or not cloudinary_result.get("url"):
            raise HTTPException(
                status_code=500,
                detail="Failed to upload video to Cloudinary. Please try again."
            )

        # Validate duration limits (robust check)
        duration = cloudinary_result.get("duration")
        # Try to coerce to float if possible
        try:
            duration_val = float(duration) if duration is not None else None
        except Exception:
            duration_val = None

        # If Cloudinary didn't return duration, attempt to fetch resource info
        if duration_val is None and cloudinary_result.get("public_id"):
            try:
                info = CloudinaryService.get_video_info(cloudinary_result.get("public_id"))
                if info and info.get("duration") is not None:
                    duration_val = float(info.get("duration"))
            except Exception:
                duration_val = None

        # If still unknown, reject upload with clear message
        if duration_val is None:
            # Clean up local file and cloudinary asset (if any)
            try:
                if cloudinary_result.get("public_id"):
                    await CloudinaryService.delete_video(cloudinary_result.get("public_id"))
            except Exception:
                pass
            try:
                os.remove(local_path)
            except Exception:
                pass
            raise HTTPException(status_code=400, detail="Unable to determine video duration. Please try another file or re-encode the video.")

        # Enforce configured bounds
        if duration_val < settings.MIN_UPLOAD_SECONDS or duration_val > settings.MAX_UPLOAD_SECONDS:
            # Delete the uploaded Cloudinary asset to avoid orphaned uploads
            try:
                if cloudinary_result.get("public_id"):
                    await CloudinaryService.delete_video(cloudinary_result.get("public_id"))
            except Exception:
                pass

            # Remove local temp file
            try:
                os.remove(local_path)
            except Exception:
                pass

            # Return informative client error
            raise HTTPException(
                status_code=400,
                detail=(f"Video duration {duration_val}s is outside allowed range "
                        f"({settings.MIN_UPLOAD_SECONDS}s - {settings.MAX_UPLOAD_SECONDS}s).")
            )

        # Generate video ID
        video_id = generate_id("v")

        # Prepare video document
        video_doc = video_document()
        video_doc.update({
            "_id": video_id,
            "video_id": video_id,
            "user_id": user_id,
            "file_url": cloudinary_result["url"],
            "file_name": file.filename,
            "intelligent_query": intelligent_query,
            "video_hash": video_hash,
            "cloudinary_public_id": cloudinary_result.get("public_id"),
            "video_format": cloudinary_result.get("format"),
            "video_duration": cloudinary_result.get("duration"),
            "uploaded_at": datetime.now(timezone.utc)
        })

        # Store in database
        video_doc["status"] = "processing" # Set initial status
        await videos_collection().insert_one(video_doc)

        # Trigger AI Analysis in Background
        print(f"[Upload] Triggering AI analysis for video {video_id}...")
        background_tasks.add_task(analyze_video, local_path, video_id)

        return {
            "video_id": video_id,
            "file_url": cloudinary_result["url"],
            "video_hash": video_hash,
            "status": "uploaded",
            "message": "Video uploaded successfully to Cloudinary"
        }

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Error uploading video: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while uploading the video: {str(e)}"
        )


@router.get("/{video_id}")
async def get_video(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get video details and URL for ML processing or playback.

    Args:
        video_id: ID of the video to retrieve
        current_user: Authenticated user information

    Returns:
        Video details including Cloudinary URL, metadata, and processing info
    """
    try:
        # Fetch video from database
        video = await videos_collection().find_one({"_id": video_id})

        if not video:
            raise HTTPException(
                status_code=404,
                detail=f"Video with ID '{video_id}' not found"
            )

        # Verify the video belongs to the user
        if video.get("user_id") != current_user.get("user_id"):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to access this video"
            )

        # Get optimized video URL from Cloudinary if public_id exists
        cloudinary_public_id = video.get("cloudinary_public_id")
        optimized_url = None
        thumbnail_url = None

        if cloudinary_public_id:
            # Get optimized video URL for streaming
            optimized_url = CloudinaryService.get_video_url(
                cloudinary_public_id)

            # Get video thumbnail
            thumbnail_url = CloudinaryService.get_thumbnail_url(
                cloudinary_public_id)

        # Prepare response
        return {
            "video_id": video.get("video_id"),
            "user_id": video.get("user_id"),
            "file_name": video.get("file_name"),
            "file_url": video.get("file_url"),  # Original Cloudinary URL
            "optimized_url": optimized_url,  # Optimized for streaming
            "thumbnail_url": thumbnail_url,  # Video thumbnail
            "intelligent_query": video.get("intelligent_query"),
            "video_hash": video.get("video_hash"),
            "video_format": video.get("video_format"),
            "video_duration": video.get("video_duration"),
            "uploaded_at": video.get("uploaded_at"),
            "cloudinary_public_id": cloudinary_public_id,
            "status": video.get("status", "ready_for_processing")
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving video: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while retrieving the video: {str(e)}"
        )


@router.get("/{video_id}/download")
async def download_video(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get direct download URL for video (useful for ML processing).

    Args:
        video_id: ID of the video to download
        current_user: Authenticated user information

    Returns:
        Direct download URL and metadata
    """
    try:
        # Fetch video from database
        video = await videos_collection().find_one({"_id": video_id})

        if not video:
            raise HTTPException(
                status_code=404,
                detail=f"Video with ID '{video_id}' not found"
            )

        # Verify the video belongs to the user
        if video.get("user_id") != current_user.get("user_id"):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to download this video"
            )

        return {
            "video_id": video.get("video_id"),
            "download_url": video.get("file_url"),  # Direct Cloudinary URL
            "file_name": video.get("file_name"),
            "video_format": video.get("video_format"),
            "video_duration": video.get("video_duration"),
            "video_hash": video.get("video_hash"),
            "message": "Use download_url to fetch video content for ML processing"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting download URL: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while getting download URL: {str(e)}"
        )


@router.get("/user/all")
async def get_user_videos(
    current_user: dict = Depends(get_current_user)
):
    """
    Get all videos uploaded by the current user.

    Args:
        current_user: Authenticated user information

    Returns:
        List of all user's videos
    """
    try:
        user_id = current_user.get("user_id")

        # Fetch all videos for this user
        cursor = videos_collection().find({"user_id": user_id})
        videos = await cursor.to_list(length=None)

        # Format response
        video_list = []
        for video in videos:
            video_list.append({
                "video_id": video.get("video_id"),
                "file_name": video.get("file_name"),
                "file_url": video.get("file_url"),
                "intelligent_query": video.get("intelligent_query"),
                "video_format": video.get("video_format"),
                "video_duration": video.get("video_duration"),
                "uploaded_at": video.get("uploaded_at"),
                "thumbnail_url": CloudinaryService.get_thumbnail_url(
                    video.get("cloudinary_public_id")
                ) if video.get("cloudinary_public_id") else None
            })

        return {
            "total_videos": len(video_list),
            "videos": video_list
        }

    except Exception as e:
        print(f"Error fetching user videos: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching videos: {str(e)}"
        )


@router.get("/user/history")
async def get_user_history(
    current_user: dict = Depends(get_current_user)
):
    """
    Get complete history of user's videos with recommendations and feedback.

    Args:
        current_user: Authenticated user information

    Returns:
        List of videos with recommendation count and feedback for each
    """
    try:
        user_id = current_user.get("user_id")

        # Fetch all videos for this user, sorted by upload date (newest first)
        cursor = videos_collection().find({"user_id": user_id}).sort("uploaded_at", -1)
        videos = await cursor.to_list(length=None)

        # Format response with additional data
        history_list = []
        for video in videos:
            video_id = video.get("video_id")

            # Count recommendations for this video
            recommendation_count = await recommendations_collection().count_documents(
                {"uploaded_video_id": video_id}
            )

            # Get feedback for this video
            feedback_doc = await feedback_collection().find_one({
                "video_id": video_id,
                "user_id": user_id
            })

            history_list.append({
                "video_id": video_id,
                "file_name": video.get("file_name"),
                "file_url": video.get("file_url"),
                "intelligent_query": video.get("intelligent_query"),
                "video_format": video.get("video_format"),
                "video_duration": video.get("video_duration"),
                "uploaded_at": video.get("uploaded_at"),
                "thumbnail_url": CloudinaryService.get_thumbnail_url(
                    video.get("cloudinary_public_id")
                ) if video.get("cloudinary_public_id") else None,
                "recommendation_count": recommendation_count,
                "feedback": {
                    "rating": feedback_doc.get("rating") if feedback_doc else None,
                    "comment": feedback_doc.get("comment") if feedback_doc else None,
                    "created_at": feedback_doc.get("created_at") if feedback_doc else None
                } if feedback_doc else None
            })

        return {
            "total_videos": len(history_list),
            "history": history_list
        }

    except Exception as e:
        print(f"Error fetching user history: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching history: {str(e)}"
        )


@router.get("/user/rated-videos")
async def get_rated_videos(
    current_user: dict = Depends(get_current_user),
    min_rating: int = 3
):
    """
    Get all user's videos with ratings >= min_rating.
    These are the videos the user has rated positively (3 stars or higher).
    
    Args:
        current_user: Authenticated user information
        min_rating: Minimum rating threshold (default: 3)
    
    Returns:
        List of videos with ratings >= min_rating, sorted by rating (highest first)
    """
    try:
        user_id = current_user.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid user authentication"
            )
        
        # Get all feedback for this user with rating >= min_rating
        feedback_cursor = feedback_collection().find({
            "user_id": user_id,
            "rating": {"$gte": min_rating}
        }).sort("rating", -1)
        
        feedback_docs = await feedback_cursor.to_list(length=None)
        
        # Extract video IDs from feedback
        video_ids = [fb.get("video_id") for fb in feedback_docs]
        
        if not video_ids:
            return {
                "total_videos": 0,
                "videos": [],
                "message": f"No videos found with rating >= {min_rating}"
            }
        
        # Fetch video details for these video IDs
        videos_cursor = videos_collection().find({
            "_id": {"$in": video_ids},
            "user_id": user_id
        })
        
        videos = await videos_cursor.to_list(length=None)
        
        # Create a map of feedback by video_id for easy lookup
        feedback_map = {fb.get("video_id"): fb for fb in feedback_docs}
        
        # Format response with video details and ratings
        video_list = []
        for video in videos:
            video_id = video.get("video_id")
            feedback = feedback_map.get(video_id)
            
            video_list.append({
                "video_id": video_id,
                "file_name": video.get("file_name"),
                "file_url": video.get("file_url"),
                "intelligent_query": video.get("intelligent_query"),
                "video_format": video.get("video_format"),
                "video_duration": video.get("video_duration"),
                "uploaded_at": video.get("uploaded_at"),
                "thumbnail_url": CloudinaryService.get_thumbnail_url(
                    video.get("cloudinary_public_id")
                ) if video.get("cloudinary_public_id") else None,
                "rating": feedback.get("rating") if feedback else None,
                "comment": feedback.get("comment") if feedback else None,
                "rated_at": feedback.get("created_at") if feedback else None
            })
        
        # Sort by rating (highest first)
        video_list.sort(key=lambda x: x.get("rating", 0), reverse=True)
        
        return {
            "total_videos": len(video_list),
            "min_rating": min_rating,
            "videos": video_list
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching rated videos: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching rated videos: {str(e)}"
        )


@router.get("/user/recommended-videos")
async def get_recommended_videos(
    current_user: dict = Depends(get_current_user),
    min_rating: int = 3
):
    """
    Get all AI-recommended videos for user's uploaded videos with ratings >= min_rating.
    These are videos that the system recommended based on user's uploads,
    filtered to show only those where the user rated the recommendations 3+ stars.
    
    Args:
        current_user: Authenticated user information
        min_rating: Minimum rating threshold (default: 3)
    
    Returns:
        List of recommended videos with ratings >= min_rating, sorted by rating (highest first)
    """
    try:
        user_id = current_user.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid user authentication"
            )
        
        # Get all uploaded videos by this user
        user_videos_cursor = videos_collection().find({"user_id": user_id})
        user_videos = await user_videos_cursor.to_list(length=None)
        user_video_ids = [v.get("_id") for v in user_videos]
        
        if not user_video_ids:
            return {
                "total_videos": 0,
                "videos": [],
                "message": "No uploaded videos found"
            }
        
        # Get feedback for the uploaded videos with rating >= min_rating
        # This represents the user's rating of the recommendations for each video
        feedback_cursor = feedback_collection().find({
            "user_id": user_id,
            "video_id": {"$in": user_video_ids},
            "rating": {"$gte": min_rating}
        }).sort("rating", -1)
        
        feedback_docs = await feedback_cursor.to_list(length=None)
        
        if not feedback_docs:
            return {
                "total_videos": 0,
                "videos": [],
                "message": f"No recommendations found with rating >= {min_rating}"
            }
        
        # Get the uploaded video IDs that have ratings >= min_rating
        rated_video_ids = [fb.get("video_id") for fb in feedback_docs]
        
        # Create a map of feedback by video_id for easy lookup
        feedback_map = {fb.get("video_id"): fb for fb in feedback_docs}
        
        # Get all recommendations for these rated videos
        recommendations_cursor = recommendations_collection().find({
            "uploaded_video_id": {"$in": rated_video_ids}
        })
        
        recommendations = await recommendations_cursor.to_list(length=None)
        
        if not recommendations:
            return {
                "total_videos": 0,
                "videos": [],
                "message": f"No recommendations found for rated videos"
            }
        
        # Format response with recommendation details and ratings from the video
        video_list = []
        for recommendation in recommendations:
            uploaded_video_id = recommendation.get("uploaded_video_id")
            feedback = feedback_map.get(uploaded_video_id)
            
            if feedback:
                video_list.append({
                    "recommendation_id": recommendation.get("_id"),
                    "title": recommendation.get("title"),
                    "url": recommendation.get("video_link") or recommendation.get("url"),
                    "thumbnail": recommendation.get("thumbnail_url") or recommendation.get("thumbnail"),
                    "channel": recommendation.get("channel_title") or recommendation.get("channel"),
                    "views": recommendation.get("views"),
                    "uploadedAt": recommendation.get("uploaded_at_text") or recommendation.get("uploadedAt"),
                    "duration": recommendation.get("duration"),
                    "similarity": recommendation.get("similarity"),
                    "description": recommendation.get("description"),
                    "rating": feedback.get("rating") if feedback else None,
                    "comment": feedback.get("comment") if feedback else None,
                    "rated_at": feedback.get("created_at") if feedback else None,
                    "uploaded_video_id": uploaded_video_id,
                    "uploaded_video_name": recommendation.get("uploaded_video_name")
                })
        
        # Sort by rating (highest first)
        video_list.sort(key=lambda x: x.get("rating", 0), reverse=True)
        
        return {
            "total_videos": len(video_list),
            "min_rating": min_rating,
            "videos": video_list
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching recommended videos: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while fetching recommended videos: {str(e)}"
        )


@router.delete("/{video_id}")
async def delete_video(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a video and all its associated data (recommendations and feedback).

    Args:
        video_id: ID of the video to delete
        current_user: Authenticated user information

    Returns:
        Confirmation of deletion
    """
    try:
        user_id = current_user.get("user_id")

        # Fetch video from database
        video = await videos_collection().find_one({"_id": video_id})

        if not video:
            raise HTTPException(
                status_code=404,
                detail=f"Video with ID '{video_id}' not found"
            )

        # Verify the video belongs to the user
        if video.get("user_id") != user_id:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to delete this video"
            )

        # Delete video from Cloudinary if public_id exists
        cloudinary_public_id = video.get("cloudinary_public_id")
        if cloudinary_public_id:
            try:
                await CloudinaryService.delete_video(cloudinary_public_id)
            except Exception as cloudinary_error:
                print(f"Warning: Failed to delete video from Cloudinary: {cloudinary_error}")
                # Continue with database deletion even if Cloudinary deletion fails

        # Delete all recommendations associated with this video
        recommendations_result = await recommendations_collection().delete_many(
            {"uploaded_video_id": video_id}
        )

        # Delete all feedback associated with this video
        feedback_result = await feedback_collection().delete_many(
            {"video_id": video_id}
        )

        # Delete video document from database
        await videos_collection().delete_one({"_id": video_id})

        return {
            "message": "Video deleted successfully",
            "video_id": video_id,
            "deleted_recommendations": recommendations_result.deleted_count,
            "deleted_feedback": feedback_result.deleted_count
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting video: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while deleting the video: {str(e)}"
        )

