# app/models/recommendation_model.py

from datetime import datetime, timezone


def recommendation_document():
    """Template for recommendation document structure in MongoDB"""
    return {
        "recommendation_id": None,
        "uploaded_video_id": None,  # foreign key to videos collection
        "title": None,
        "description": None,
        "thumbnail_url": None,
        "video_link": None,
        "fetched_at": datetime.now(timezone.utc)
    }
