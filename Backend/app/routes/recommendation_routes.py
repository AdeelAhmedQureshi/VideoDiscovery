# app/routes/recommendation_routes.py
"""
Recommendation API routes.
Serves YouTube-fetched video recommendations for analyzed videos.
Uses all AI-generated search queries — each query becomes a separate tab.
"""

import asyncio
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
    refresh: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """
    Get YouTube video recommendations for an analyzed video.

    Flow:
    1. Check if cached recommendations exist in the DB
    2. If yes and multi-query, group by query and return as tabs
    3. If stale single-query cache or no cache, fetch from YouTube
       for ALL queries concurrently, store results, and return grouped tabs.

    Query params:
        refresh: If true, delete cached recs and re-fetch from YouTube.

    Returns:
        {
            uploaded_video: {...},
            query_tabs: [
                { query: "...", recommendations: [...] },
                ...
            ]
        }
    """
    user_id = current_user.get("user_id")

    # Fetch the uploaded video
    video = await videos_collection().find_one({"_id": video_id})

    if not video:
        raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found")

    if video.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="You don't have permission to view this video's recommendations")

    # If force refresh, delete old cache
    if refresh:
        await recommendations_collection().delete_many({"uploaded_video_id": video_id})
        print(f"[Recommendations] Cleared cache for video {video_id} (force refresh)")
    else:
        # Check for cached recommendations
        cached = await recommendations_collection().find(
            {"uploaded_video_id": video_id}
        ).to_list(length=200) 

        if cached: 
            # Check if cache is stale (old single-query format)
            unique_queries = set(doc.get("search_query_used", "") for doc in cached)
            ai_metadata = video.get("ai_metadata", {})
            available_queries = ai_metadata.get("search_queries", [])

            if len(unique_queries) >= min(len(available_queries), 2):
                # Cache has multiple queries — it's from the new format, serve it
                query_tabs = _group_cached_by_query(cached)
                return {
                    "uploaded_video": _format_video_summary(video),
                    "query_tabs": query_tabs,
                }
            else:
                # Stale cache (single-query) — clear and re-fetch
                await recommendations_collection().delete_many({"uploaded_video_id": video_id})
                print(f"[Recommendations] Cleared stale single-query cache for video {video_id}")

    # No cache — fetch from YouTube using ALL AI-generated queries
    ai_metadata = video.get("ai_metadata", {})
    search_queries = ai_metadata.get("search_queries", [])[:5]  # Max 5 queries

    if not search_queries:
        # No search queries yet — video may still be processing
        status = video.get("status", "unknown")
        if status == "processing":
            return {
                "uploaded_video": _format_video_summary(video),
                "query_tabs": [],
                "message": "Video is still being analyzed. Recommendations will be available soon.",
            }
        return {
            "uploaded_video": _format_video_summary(video),
            "query_tabs": [],
            "message": "No search queries available for this video.",
        }

    # Fetch 5 videos for EACH query concurrently
    print(f"[Recommendations] Fetching YouTube results for video {video_id} with {len(search_queries)} queries")

    async def fetch_for_query(query):
        """Fetch YouTube results for a single query."""
        results = await search_youtube(query, max_results=5)
        return {"query": query, "results": results}

    tasks = [fetch_for_query(q) for q in search_queries]
    all_results = await asyncio.gather(*tasks)

    # Build query_tabs and store in database
    query_tabs = []
    all_docs = []

    for entry in all_results:
        query = entry["query"]
        results = entry["results"]

        if not results:
            # Still include the tab even if empty
            query_tabs.append({"query": query, "recommendations": []})
            continue

        # Store in database for caching
        for result in results:
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
                "search_query_used": query,
                "fetched_at": datetime.now(timezone.utc),
            }
            all_docs.append(doc)

        query_tabs.append({"query": query, "recommendations": results})

    if all_docs:
        await recommendations_collection().       insert_many(all_docs)
        print(f"[Recommendations] Stored {len(all_docs)} recommendations across {len(search_queries)} queries for video {video_id}")

    return {
        "uploaded_video": _format_video_summary(video),
        "query_tabs": query_tabs,
    }


def _group_cached_by_query(cached_docs: list) -> list:
    """Group cached recommendation documents by search_query_used."""
    from collections import OrderedDict

    groups = OrderedDict()
    for doc in cached_docs:
        query = doc.get("search_query_used", "Unknown Query")
        if query not in groups:
            groups[query] = []
        groups[query].append({
            "id": len(groups[query]) + 1,
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

    return [{"query": query, "recommendations": recs} for query, recs in groups.items()]


def _format_video_summary(video: dict) -> dict:
    """Format the uploaded video info for the response."""
    return {
        "video_id": video.get("video_id"),
        "file_name": video.get("file_name"),
        "file_url": video.get("file_url"),
        "status": video.get("status", "unknown"),
        "uploaded_at": str(video.get("uploaded_at", "")),
    }
