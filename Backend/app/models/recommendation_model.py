# app/models/recommendation_model.py

from datetime import datetime, timezone


def recommendation_document():
    """Template for recommendation document structure in MongoDB"""
    return {
        "recommendation_id": None,
        "uploaded_video_id": None,  # foreign key to videos collection
        "user_id": None,            # foreign key to users collection
        "youtube_video_id": None,   # YouTube video ID
        "title": None,
        "description": None,
        "thumbnail_url": None,
        "channel_title": None,
        "views": None,              # formatted string (e.g., "1.2M")
        "view_count": 0,            # raw integer
        "uploaded_at_text": None,    # relative time (e.g., "2 months ago")
        "published_at": None,       # ISO timestamp from YouTube
        "duration": None,           # formatted string (e.g., "5:30")
        "video_link": None,         # full YouTube URL
        "similarity": 0.0,          # relevance score
        "search_query_used": None,  # the query that produced this result
        "fetched_at": datetime.now(timezone.utc)
    }
