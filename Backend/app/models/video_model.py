# app/models/video_model.py

from datetime import datetime, timezone


def video_document():
    """Template for video document structure in MongoDB"""
    return {
        "video_id": None,
        "user_id": None,  # foreign key to users collection
        "file_url": None,
        "file_name": None,
        "intelligent_query": None,
        "video_hash": None,
        "uploaded_at": datetime.now(timezone.utc)
    }
