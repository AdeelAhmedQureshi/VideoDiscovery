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
from typing import List, Dict, Optional
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
    limit: int = 100,
    focus: str | None = None,
    include_all: bool = True,
    current_user: dict = Depends(get_current_user)
):
    """
    Get YouTube video recommendations for an analyzed video.

    Returns all ranked videos (flat list) sorted by real semantic similarity.
    Also includes query_tabs for transparency (which query found which videos).

    Quality threshold logic:
      - If include_all=True: Returns ALL recommendations regardless of similarity score
      - If include_all=False: Applies quality threshold filtering
        - If ALL results are below threshold → empty list + not_found_reason
        - If some are below → results returned with not_found_reason warning
        - If all above → results returned, not_found_reason is null

    Query params:
        refresh: If true, delete cached recs and re-fetch from YouTube.
        limit: Maximum number of recommendations to return (default: 100, set to 999 for all)
        include_all: If true, return all recommendations including low-score ones (default: True)

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
            # Update recommendation_stats from cached documents (platform breakdown)
            try:
                yt_count = sum(1 for d in cached if (d.get("platform") or "").lower() == "youtube")
                dm_count = sum(1 for d in cached if (d.get("platform") or "").lower() == "dailymotion")
                stats = {
                    "youtube_candidates": int(yt_count),
                    "dailymotion_candidates": int(dm_count),
                    "total_candidates": int(yt_count + dm_count),
                    "last_fetched_at": datetime.now(timezone.utc)
                }
                await videos_collection().update_one({"_id": video_id}, {"$set": {"recommendation_stats": stats}})
            except Exception as e:
                print(f"[Recommendations] Failed to update recommendation_stats from cache for {video_id}: {e}")
            # If ALL below threshold and include_all=False, return empty list
            if not include_all and not_found_reason and all(
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

    # No cache — fetch from YouTube using top 3 AI-generated queries + optional focus
    ai_metadata = video.get("ai_metadata", {})
    search_queries = ai_metadata.get("search_queries", [])[:3]  # Top 3 queries only

    # If no queries yet, video might still be processing
    if not search_queries and video.get("status") == "processing":
        return {
            "uploaded_video": _format_video_summary(video),
            "top_recommendations": [],
            "query_tabs": [],
            "not_found_reason": None,
            "message": "Video is still being analyzed. Recommendations will be available soon.",
        }

    # Build effective queries, optionally biasing by scene/actions
    scene = ai_metadata.get("scene") or (ai_metadata.get("multimodal_context", {}) or {}).get("visual", {}).get("scene")
    actions = ai_metadata.get("actions", []) or (ai_metadata.get("multimodal_context", {}) or {}).get("activity", {}).get("actions", [])

    effective_queries = [q for q in search_queries if q]

    if focus:
        f = focus.lower()
        if f in ("scene", "both") and scene:
            # Add scene-focused queries
            effective_queries.append(f"{scene}")
            effective_queries.append(f"{scene} scene")
            effective_queries.append(f"{scene} video")
        if f in ("action", "both") and actions:
            for act in actions:
                if act:
                    effective_queries.append(f"{act} video")
                    effective_queries.append(f"{act} {scene or ''}".strip())

    # Deduplicate while preserving order
    seen_q = set()
    effective_queries = [q for q in effective_queries if not (q in seen_q or seen_q.add(q))]

    if not effective_queries:
        # No meaningful queries
        return {
            "uploaded_video": _format_video_summary(video),
            "top_recommendations": [],
            "query_tabs": [],
            "not_found_reason": "No search queries could be generated for this video.",
        }

    print(f"[Recommendations] Fetching YouTube + Dailymotion results for video {video_id} with {len(effective_queries)} queries (limit={limit}, focus={focus})")

    # Determine per-query fetch size (over-fetch to allow deduping and selection)
    # Fetch enough results per query to meet the limit requirement
    per_query_fetch = max(10, min(limit, 25))

    async def fetch_for_query(query):
        yt_results, dm_results = await asyncio.gather(
            search_youtube(query, max_results=per_query_fetch),
            search_dailymotion(query, max_results=per_query_fetch),
        )
        # Attach query for traceability
        combined = []
        for r in (yt_results or []):
            r["search_query_used"] = query
            combined.append(r)
        for r in (dm_results or []):
            r["search_query_used"] = query
            combined.append(r)
        return {"query": query, "recommendations": combined}

    tasks = [fetch_for_query(q) for q in effective_queries]
    all_results = await asyncio.gather(*tasks)

    # Build query_tabs and flatten
    query_tabs = []
    all_flat_results = []
    for entry in all_results:
        query = entry["query"]
        results = entry.get("recommendations", [])
        if not results:
            query_tabs.append({"query": query, "recommendations": []})
            continue
        query_tabs.append({"query": query, "recommendations": results})
        all_flat_results.extend(results)

    # Do NOT persist all per-query candidates. Persist only the final deduplicated top-5.

    # Deduplicate by youtube_video_id/url/id while preserving order
    seen = set()
    deduped = []
    for r in all_flat_results:
        key = r.get("youtube_video_id") or r.get("id") or r.get("url") or r.get("video_link") or None
        if key is None:
            # keep items without keys but avoid exact duplicates
            if r not in deduped:
                deduped.append(r)
            continue
        if key not in seen:
            seen.add(key)
            deduped.append(r)

    # Heuristic match score: prefer results that mention scene or actions in title/description/tags
    def compute_match_score(item: Dict) -> int:
        score = 0
        # combine searchable text fields into one lowercase string
        title = str(item.get("title", ""))
        description = str(item.get("description", ""))
        tags = ",".join(item.get("tags", []) or [])
        text_fields = " ".join([title, description, tags]).lower()
        if scene and scene.lower() in text_fields:
            score += 3
        for act in actions or []:
            if act and act.lower() in text_fields:
                score += 1
        return score

    def view_count_val(item: Dict) -> int:
        try:
            return int(item.get("view_count") or 0)
        except Exception:
            return 0

    # Sort by match score (desc), then by view_count (desc)
    deduped.sort(key=lambda x: (compute_match_score(x), view_count_val(x)), reverse=True)

    # Select top-N based on requested limit
    top_recommendations = deduped[:max(1, min(limit, len(deduped)))]

    # Persist only the selected top-5 recommendations for caching
    if top_recommendations:
        rec_docs = []
        for rank, result in enumerate(top_recommendations):
            rec_docs.append({
                "_id": generate_id("rec"),
                "recommendation_id": generate_id("rec"),
                "uploaded_video_id": video_id,
                "user_id": user_id,
                "youtube_video_id": result.get("youtube_video_id"),
                "title": result.get("title"),
                "thumbnail_url": result.get("thumbnail"),
                "channel_title": result.get("channel", ""),
                "views": result.get("views", ""),
                "view_count": result.get("view_count", 0),
                "uploaded_at_text": result.get("uploadedAt", ""),
                "published_at": result.get("published_at", ""),
                "duration": result.get("duration", ""),
                "video_link": result.get("url", ""),
                "similarity": result.get("similarity", 0),
                "above_threshold": result.get("above_threshold", False),
                "search_query_used": result.get("search_query_used", ""),
                "platform": result.get("platform", "youtube"),
                "rank": rank + 1,
                "fetched_at": datetime.now(timezone.utc),
            })
        try:
            await recommendations_collection().insert_many(rec_docs)
            print(f"[Recommendations] Stored top {len(rec_docs)} recommendations for video {video_id}")
        except Exception as e:
            # Log and continue; avoid failing the request due to DB write issues
            print(f"[Recommendations] Failed to persist top recommendations: {e}")

    # Persist recommendation candidate stats (counts per platform) so History page can show totals
    try:
        yt_count = sum(1 for r in all_flat_results if (r.get("platform") or "").lower() == "youtube")
        dm_count = sum(1 for r in all_flat_results if (r.get("platform") or "").lower() == "dailymotion")
        stats = {
            "youtube_candidates": int(yt_count),
            "dailymotion_candidates": int(dm_count),
            "total_candidates": int(yt_count + dm_count),
            "last_fetched_at": datetime.now(timezone.utc)
        }
        await videos_collection().update_one({"_id": video_id}, {"$set": {"recommendation_stats": stats}})
        print(f"[Recommendations] Updated recommendation_stats for {video_id}: {stats}")
    except Exception as e:
        print(f"[Recommendations] Failed to persist recommendation_stats for {video_id}: {e}")

    # ── Quality threshold check ──
    not_found_reason = _compute_not_found_reason(top_recommendations)

    if not include_all and not_found_reason and all(
        r.get("similarity", 0) < MIN_SIMILARITY_THRESHOLD for r in top_recommendations
    ):
        # ALL below threshold → show Not Found (only if include_all=False)
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
    """Format cached recommendation documents as a flat ranked list. Returns all cached recommendations."""
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
        "recommendation_stats": video.get("recommendation_stats") if isinstance(video, dict) else None,
    }
