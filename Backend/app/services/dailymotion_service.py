# app/services/dailymotion_service.py
"""
Dailymotion Public API Service for VideoDiscovery.
Fetches videos from Dailymotion as a fallback/supplement to YouTube.
No API key required — uses the free public endpoint.
"""

import httpx
import math
from typing import List, Dict
from datetime import datetime, timezone

DAILYMOTION_API_URL = "https://api.dailymotion.com/videos"


def _format_view_count(count: int) -> str:
    """Format view count to human-readable string."""
    if count >= 1_000_000_000:
        return f"{count / 1_000_000_000:.1f}B"
    elif count >= 1_000_000:
        return f"{count / 1_000_000:.1f}M"
    elif count >= 1_000:
        return f"{count / 1_000:.1f}K"
    return str(count)


def _format_duration(seconds: int) -> str:
    """Convert duration in seconds to human-readable (e.g., 5:30, 1:02:15)."""
    if not seconds:
        return ""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def _time_ago(timestamp: int) -> str:
    """Convert Unix timestamp to relative time string."""
    if not timestamp:
        return ""
    try:
        pub_date = datetime.fromtimestamp(timestamp, tz=timezone.utc)
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


async def search_dailymotion(query: str, max_results: int = 3) -> List[Dict]:
    """
    Search Dailymotion using the free public API (no API key needed).

    Args:
        query: Search query string
        max_results: Number of videos to return (default 3)

    Returns:
        List of video dicts matching the same shape as YouTube results,
        with an additional "platform": "dailymotion" field.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            params = {
                "search": query,
                "fields": "id,title,thumbnail_720_url,thumbnail_480_url,owner.screenname,views_total,duration,created_time,url",
                "limit": max_results,
                "sort": "relevance",
            }

            response = await client.get(DAILYMOTION_API_URL, params=params)

            if response.status_code != 200:
                print(f"[Dailymotion] API Error {response.status_code}: {response.text[:200]}")
                return []

            data = response.json()
            videos = data.get("list", [])

            if not videos:
                print(f"[Dailymotion] No results for query: '{query}'")
                return []

            results = []
            for i, video in enumerate(videos):
                video_id = video.get("id", "")
                view_count_raw = int(video.get("views_total", 0) or 0)
                thumbnail = video.get("thumbnail_720_url") or video.get("thumbnail_480_url", "")

                results.append({
                    "id": i + 1,
                    "youtube_video_id": f"dm_{video_id}",  # Prefixed to avoid collision with YouTube IDs
                    "title": video.get("title", "Untitled"),
                    "thumbnail": thumbnail,
                    "channel": video.get("owner.screenname", "Unknown Channel"),
                    "views": _format_view_count(view_count_raw),
                    "view_count": view_count_raw,
                    "uploadedAt": _time_ago(video.get("created_time", 0)),
                    "published_at": str(video.get("created_time", "")),
                    "duration": _format_duration(video.get("duration", 0)),
                    "url": video.get("url", f"https://www.dailymotion.com/video/{video_id}"),
                    "similarity": 0.0,  # Will be overwritten by CLIP re-ranking
                    "platform": "dailymotion",
                })

            print(f"[Dailymotion] Returning {len(results)} videos for query: '{query}'")
            return results

    except httpx.TimeoutException:
        print(f"[Dailymotion] Timeout while searching for: '{query}'")
        return []
    except Exception as e:
        print(f"[Dailymotion] Unexpected error: {e}")
        return []
