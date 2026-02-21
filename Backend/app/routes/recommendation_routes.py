# app/routes/recommendation_routes.py
"""
Recommendation API routes.
Serves YouTube-fetched video recommendations for analyzed videos.
"""

from fastapi import APIRouter, HTTPException, Depends
from ..database import videos_collection, recommendations_collection
from ..utils.jwt_handler import get_current_user
from ..utils.helper_functions import generate_id
from ..services.youtube_service import search_youtube
from datetime import datetime, timezone

router = APIRouter()


@router.get("/{video_id}")
async def get_recommendations(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get YouTube video recommendations for an analyzed video.

    Flow:
    1. Check if cached recommendations exist in the DB
    2. If yes, return them immediately
    3. If no, read the AI-generated search queries from the video,
       call YouTube API, store results, and return them.

    Returns:
        { uploaded_video: {...}, recommendations: [...] }
    """
    user_id = current_user.get("user_id")

    # Fetch the uploaded video
    video = await videos_collection().find_one({"_id": video_id})

    if not video:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    if video.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to view this video's recommendations")

    # Check for cached recommendations
    cached = await recommendations_collection().find(
        {"uploaded_video_id": video_id}
    ).to_list(length=50)

    if cached:
        recommendations = _format_cached(cached)
        return {
            "uploaded_video": _format_video_summary(video),
            "recommendations": recommendations,
        }

    # No cache — fetch from YouTube using AI-generated queries
    ai_metadata = video.get("ai_metadata", {})
    search_queries = ai_metadata.get("search_queries", [])

    if not search_queries:
        # No search queries yet — video may still be processing
        status = video.get("status", "unknown")
        if status == "processing":
            return {
                "uploaded_video": _format_video_summary(video),
                "recommendations": [],
                "message": "Video is still being analyzed. Recommendations will be available soon.",
            }
        return {
            "uploaded_video": _format_video_summary(video),
            "recommendations": [],
            "message": "No search queries available for this video.",
        }

    # Use the top query (most relevant) to search YouTube
    best_query = search_queries[0] if search_queries else ""
    print(f"[Recommendations] Fetching YouTube results for video {video_id} with query: '{best_query}'")

    youtube_results = await search_youtube(best_query, max_results=5)

    if not youtube_results:
        return {
            "uploaded_video": _format_video_summary(video),
            "recommendations": [],
            "message": "Could not fetch YouTube recommendations at this time.",
        }

    # Store in database for caching
    docs = []
    for result in youtube_results:
        doc = {
            "_id": generate_id("rec"),
            "recommendation_id": generate_id("rec"),
            "uploaded_video_id": video_id,
            "user_id": user_id,
            "youtube_video_id": result["youtube_video_id"],
            "title": result["title"],
            "thumbnail_url": result["thumbnail"],
            "channel_title": result["channel"],
            "views": result["views"],
            "view_count": result["view_count"],
            "uploaded_at_text": result["uploadedAt"],
            "published_at": result.get("published_at", ""),
            "duration": result["duration"],
            "video_link": result["url"],
            "similarity": result["similarity"],
            "search_query_used": best_query,
            "fetched_at": datetime.now(timezone.utc),
        }
        docs.append(doc)

    if docs:
        await recommendations_collection().insert_many(docs)
        print(f"[Recommendations] Stored {len(docs)} recommendations for video {video_id}")

    return {
        "uploaded_video": _format_video_summary(video),
        "recommendations": youtube_results,
    }


def _format_cached(cached_docs: list) -> list:
    """Format cached recommendation documents for API response."""
    results = []
    for i, doc in enumerate(cached_docs):
        results.append({
            "id": i + 1,
            "youtube_video_id": doc.get("youtube_video_id", ""),
            "title": doc.get("title", "Untitled"),
            "thumbnail": doc.get("thumbnail_url", ""),
            "channel": doc.get("channel_title", "Unknown Channel"),
            "views": doc.get("views", ""),
            "view_count": doc.get("view_count", 0),
            "uploadedAt": doc.get("uploaded_at_text", ""),
            "duration": doc.get("duration", ""),
            "url": doc.get("video_link", ""),
            "similarity": doc.get("similarity", 0.8),
        })
    return results


def _format_video_summary(video: dict) -> dict:
    """Format the uploaded video info for the response."""
    return {
        "video_id": video.get("video_id"),
        "file_name": video.get("file_name"),
        "file_url": video.get("file_url"),
        "status": video.get("status", "unknown"),
        "uploaded_at": str(video.get("uploaded_at", "")),
    }
