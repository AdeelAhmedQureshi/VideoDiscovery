from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from ..database import videos_collection, recommendations_collection, feedback_collection
from ..utils.helper_functions import generate_id
from ..utils.jwt_handler import get_current_user
from ..services.cloudinary_service import CloudinaryService
from ..models.video_model import video_document
from datetime import datetime, timezone
import hashlib

router = APIRouter()


@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    intelligent_query: str = Form(...),
    background_tasks: BackgroundTasks = None,
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
        # Read file content for hash calculation
        file_content = await file.read()

        # Calculate video hash for duplicate detection
        video_hash = hashlib.sha256(file_content).hexdigest()

        # Check if video with same hash already exists for this user
        existing_video = await videos_collection().find_one({
            "user_id": user_id,
            "video_hash": video_hash
        })

        if existing_video:
            raise HTTPException(
                status_code=409,
                detail=f"This video has already been uploaded. Video ID: {existing_video['_id']}"
            )

        # Reset file position for upload
        await file.seek(0)
        
        # Save locally for AI processing
        local_filename = f"{user_id}_{generate_id().replace('-', '')}_{file.filename}"
        local_path = os.path.join(TEMP_VIDEO_DIR, local_filename)
        
        with open(local_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Reset file position AGAIN for Cloudinary upload
        await file.seek(0)

        # Upload video to Cloudinary
        cloudinary_result = await CloudinaryService.upload_video(file, user_id)

        if not cloudinary_result or not cloudinary_result.get("url"):
            raise HTTPException(
                status_code=500,
                detail="Failed to upload video to Cloudinary. Please try again."
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
        if background_tasks:
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

