# app/routes/recommendation_routes.py
"""
Recommendation API routes.
Serves YouTube-fetched video recommendations for analyzed videos.
Returns CLIP-ranked top 5 recommendations (flat list) plus query tabs for transparency.

Implements strict quality threshold:
  - If ALL results score below MIN_SIMILARITY_THRESHOLD, returns empty list + not_found_reason
  - If some results are below threshold, returns a warning in not_found_reason
"""

import asyncio
from fastapi import APIRouter, HTTPException, Depends
from ..database import videos_collection, recommendations_collection
from ..utils.jwt_handler import get_current_user
from ..utils.helper_functions import generate_id
from ..services.youtube_service import search_youtube
from ..services.dailymotion_service import search_dailymotion
from datetime import datetime, timezone

router = APIRouter()

# Must match classifier.py MIN_SIMILARITY_THRESHOLD
MIN_SIMILARITY_THRESHOLD = 0.15


@router.get("/{video_id}")
async def get_recommendations(
    video_id: str,
    refresh: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """
    Get YouTube video recommendations for an analyzed video.

    Returns CLIP-ranked top 5 videos (flat list) sorted by real semantic similarity.
    Also includes query_tabs for transparency (which query found which videos).

    Quality threshold logic:
      - If ALL top 5 are below threshold → empty list + not_found_reason
      - If some are below → results returned with not_found_reason warning
      - If all above → results returned, not_found_reason is null

    Query params:
        refresh: If true, delete cached recs and re-fetch from YouTube.

    Returns:
        {
            uploaded_video: {...},
            top_recommendations: [...],
            query_tabs: [...],
            not_found_reason: str | null
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
        ).sort("similarity", -1).to_list(length=200)

        if cached:
            top_recommendations = _format_cached_flat(cached)
            query_tabs = _group_cached_by_query(cached)
            not_found_reason = _compute_not_found_reason(top_recommendations)
            # If ALL below threshold, return empty list
            if not_found_reason and all(
                r.get("similarity", 0) < MIN_SIMILARITY_THRESHOLD for r in top_recommendations
            ):
                return {
                    "uploaded_video": _format_video_summary(video),
                    "top_recommendations": [],
                    "query_tabs": query_tabs,
                    "not_found_reason": not_found_reason,
                }
            return {
                "uploaded_video": _format_video_summary(video),
                "top_recommendations": top_recommendations,
                "query_tabs": query_tabs,
                "not_found_reason": not_found_reason,
            }

    # No cache — fetch from YouTube using top 3 AI-generated queries
    ai_metadata = video.get("ai_metadata", {})
    search_queries = ai_metadata.get("search_queries", [])[:3]  # Top 3 queries only

    if not search_queries:
        # No search queries yet — video may still be processing
        status = video.get("status", "unknown")
        if status == "processing":
            return {
                "uploaded_video": _format_video_summary(video),
                "top_recommendations": [],
                "query_tabs": [],
                "not_found_reason": None,
                "message": "Video is still being analyzed. Recommendations will be available soon.",
            }
        return {
            "uploaded_video": _format_video_summary(video),
            "top_recommendations": [],
            "query_tabs": [],
            "not_found_reason": "No search queries could be generated for this video. The content may be too generic or unclear.",
        }

    # Fetch 5 YouTube + 3 Dailymotion videos for EACH query concurrently
    print(f"[Recommendations] Fetching YouTube + Dailymotion results for video {video_id} with {len(search_queries)} queries")

    async def fetch_for_query(query):
        """Fetch from both YouTube and Dailymotion for a single query."""
        yt_results, dm_results = await asyncio.gather(
            search_youtube(query, max_results=5),
            search_dailymotion(query, max_results=3),
        )
        return {"query": query, "results": yt_results + dm_results}

    tasks = [fetch_for_query(q) for q in search_queries]
    all_results = await asyncio.gather(*tasks)

    # Build query_tabs and flat list, store in database
    query_tabs = []
    all_docs = []
    all_flat_results = []

    for entry in all_results:
        query = entry["query"]
        results = entry["results"]

        if not results:
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
                "above_threshold": result.get("above_threshold", False),
                "search_query_used": query,
                "platform": result.get("platform", "youtube"),
                "fetched_at": datetime.now(timezone.utc),
            }
            all_docs.append(doc)
            all_flat_results.append(result)

        query_tabs.append({"query": query, "recommendations": results})

    if all_docs:
        await recommendations_collection().insert_many(all_docs)
        print(f"[Recommendations] Stored {len(all_docs)} recommendations for video {video_id}")

    # Sort flat results by similarity (descending) and take top 5
    all_flat_results.sort(key=lambda x: x.get("similarity", 0), reverse=True)
    # Deduplicate by youtube_video_id
    seen = set()
    top_recommendations = []
    for r in all_flat_results:
        vid = r.get("youtube_video_id", "")
        if vid not in seen:
            seen.add(vid)
            top_recommendations.append(r)
        if len(top_recommendations) >= 5:
            break

    # ── Quality threshold check ──
    not_found_reason = _compute_not_found_reason(top_recommendations)

    if not_found_reason and all(
        r.get("similarity", 0) < MIN_SIMILARITY_THRESHOLD for r in top_recommendations
    ):
        # ALL below threshold → show Not Found
        print(f"[Recommendations] ALL {len(top_recommendations)} results below threshold {MIN_SIMILARITY_THRESHOLD} — returning Not Found")
        return {
            "uploaded_video": _format_video_summary(video),
            "top_recommendations": [],
            "query_tabs": query_tabs,
            "not_found_reason": not_found_reason,
        }

    return {
        "uploaded_video": _format_video_summary(video),
        "top_recommendations": top_recommendations,
        "query_tabs": query_tabs,
        "not_found_reason": not_found_reason,
    }


def _compute_not_found_reason(top_recommendations: list) -> str | None:
    """
    Determine the not_found_reason based on quality threshold.
    Returns None if results are good quality.
    """
    if not top_recommendations:
        return "No videos were found on YouTube or Dailymotion matching your uploaded content."

    above_count = sum(
        1 for r in top_recommendations
        if r.get("similarity", 0) >= MIN_SIMILARITY_THRESHOLD
        or r.get("above_threshold", False)
    )
    total = len(top_recommendations)

    if above_count == 0:
        return (
            "We found some videos but none closely matched your uploaded content. "
            "The video may contain very niche or uncommon content. "
            "Try uploading a clip with more distinctive visuals or dialogue."
        )
    elif above_count < total:
        return (
            f"Only {above_count} of {total} results are strong matches. "
            f"The remaining results have lower confidence."
        )

    return None  # All good


def _format_cached_flat(cached_docs: list) -> list:
    """Format cached recommendation documents as a flat ranked list."""
    seen = set()
    results = []
    for doc in cached_docs:
        vid = doc.get("youtube_video_id", "")
        if vid in seen:
            continue
        seen.add(vid)
        results.append({
            "id": len(results) + 1,
            "youtube_video_id": vid,
            "title": doc.get("title", "Untitled"),
            "thumbnail": doc.get("thumbnail_url", ""),
            "channel": doc.get("channel_title", "Unknown Channel"),
            "views": doc.get("views", ""),
            "view_count": doc.get("view_count", 0),
            "uploadedAt": doc.get("uploaded_at_text", ""),
            "duration": doc.get("duration", ""),
            "url": doc.get("video_link", ""),
            "similarity": doc.get("similarity", 0),
            "above_threshold": doc.get("above_threshold", False),
            "search_query_used": doc.get("search_query_used", ""),
            "platform": doc.get("platform", "youtube"),
        })
        if len(results) >= 5:
            break
    return results


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
            "similarity": doc.get("similarity", 0),
            "platform": doc.get("platform", "youtube"),
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
