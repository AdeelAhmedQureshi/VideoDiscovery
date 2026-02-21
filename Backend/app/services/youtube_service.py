# app/services/youtube_service.py
"""
YouTube Data API v3 Service for VideoDiscovery.
Fetches real YouTube videos based on AI-generated search queries.
"""

import os
import re
import math
import httpx
from typing import List, Dict, Optional
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YOUTUBE_VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos"


def _format_view_count(count: int) -> str:
    """Format view count to human-readable string (e.g., 1.2M, 450K)."""
    if count >= 1_000_000_000:
        return f"{count / 1_000_000_000:.1f}B"
    elif count >= 1_000_000:
        return f"{count / 1_000_000:.1f}M"
    elif count >= 1_000:
        return f"{count / 1_000:.1f}K"
    return str(count)


def _parse_duration(iso_duration: str) -> str:
    """Convert ISO 8601 duration (PT5M30S) to human-readable (5:30)."""
    if not iso_duration:
        return ""
    match = re.match(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso_duration)
    if not match:
        return ""
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)

    if hours > 0:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    return f"{minutes}:{seconds:02d}"


def _time_ago(published_at: str) -> str:
    """Convert ISO timestamp to relative time string (e.g., '2 months ago')."""
    from datetime import datetime, timezone

    try:
        pub_date = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        diff = now - pub_date
        days = diff.days

        if days < 1:
            hours = diff.seconds // 3600
            return f"{hours} hour{'s' if hours != 1 else ''} ago" if hours > 0 else "Just now"
        elif days < 7:
            return f"{days} day{'s' if days != 1 else ''} ago"
        elif days < 30:
            weeks = days // 7
            return f"{weeks} week{'s' if weeks != 1 else ''} ago"
        elif days < 365:
            months = days // 30
            return f"{months} month{'s' if months != 1 else ''} ago"
        else:
            years = days // 365
            return f"{years} year{'s' if years != 1 else ''} ago"
    except Exception:
        return ""


async def search_youtube(query: str, max_results: int = 5) -> List[Dict]:
    """
    Search YouTube using the Data API v3 and return enriched video data.

    Args:
        query: Search query string (from LLM-generated queries)
        max_results: Number of videos to fetch (default 5, max 10)

    Returns:
        List of video dicts with: title, thumbnail, channel, views,
        uploadedAt, duration, url, youtube_video_id
    """
    if not YOUTUBE_API_KEY:
        print("[YouTube] ERROR: YOUTUBE_API_KEY not set in .env")
        return []

    max_results = min(max_results, 10)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Step 1: Search for videos
            search_params = {
                "part": "snippet",
                "q": query,
                "type": "video",
                "maxResults": max_results,
                "order": "relevance",
                "videoEmbeddable": "true",
                "key": YOUTUBE_API_KEY,
            }

            search_resp = await client.get(YOUTUBE_SEARCH_URL, params=search_params)

            if search_resp.status_code != 200:
                print(f"[YouTube] Search API Error {search_resp.status_code}: {search_resp.text[:200]}")
                return []

            search_data = search_resp.json()
            items = search_data.get("items", [])

            if not items:
                print(f"[YouTube] No results found for query: '{query}'")
                return []

            # Collect video IDs
            video_ids = [item["id"]["videoId"] for item in items]

            # Step 2: Get video statistics and content details
            stats_params = {
                "part": "statistics,contentDetails,snippet",
                "id": ",".join(video_ids),
                "key": YOUTUBE_API_KEY,
            }

            stats_resp = await client.get(YOUTUBE_VIDEOS_URL, params=stats_params)

            if stats_resp.status_code != 200:
                print(f"[YouTube] Videos API Error {stats_resp.status_code}: {stats_resp.text[:200]}")
                # Fallback: return basic data from search results
                return _build_basic_results(items)

            stats_data = stats_resp.json()
            stats_map = {
                item["id"]: item for item in stats_data.get("items", [])
            }

            # Step 3: Build enriched results
            results = []
            for i, item in enumerate(items):
                video_id = item["id"]["videoId"]
                snippet = item["snippet"]
                stats_item = stats_map.get(video_id, {})
                statistics = stats_item.get("statistics", {})
                content_details = stats_item.get("contentDetails", {})

                view_count_raw = int(statistics.get("viewCount", 0))

                results.append({
                    "id": i + 1,
                    "youtube_video_id": video_id,
                    "title": snippet.get("title", "Untitled"),
                    "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url",
                                 snippet.get("thumbnails", {}).get("medium", {}).get("url", "")),
                    "channel": snippet.get("channelTitle", "Unknown Channel"),
                    "views": _format_view_count(view_count_raw),
                    "view_count": view_count_raw,
                    "uploadedAt": _time_ago(snippet.get("publishedAt", "")),
                    "published_at": snippet.get("publishedAt", ""),
                    "duration": _parse_duration(content_details.get("duration", "")),
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "similarity": round(max(0.75, 1.0 - (i * 0.05)), 2),
                })

            print(f"[YouTube] Fetched {len(results)} videos for query: '{query}'")
            return results

    except httpx.TimeoutException:
        print(f"[YouTube] Timeout while searching for: '{query}'")
        return []
    except Exception as e:
        print(f"[YouTube] Unexpected error: {e}")
        return []


def _build_basic_results(items: list) -> List[Dict]:
    """Fallback: build results from search data only (no stats)."""
    results = []
    for i, item in enumerate(items):
        video_id = item["id"]["videoId"]
        snippet = item["snippet"]
        results.append({
            "id": i + 1,
            "youtube_video_id": video_id,
            "title": snippet.get("title", "Untitled"),
            "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
            "channel": snippet.get("channelTitle", "Unknown Channel"),
            "views": "",
            "view_count": 0,
            "uploadedAt": _time_ago(snippet.get("publishedAt", "")),
            "published_at": snippet.get("publishedAt", ""),
            "duration": "",
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "similarity": round(max(0.75, 1.0 - (i * 0.05)), 2),
        })
    return results
