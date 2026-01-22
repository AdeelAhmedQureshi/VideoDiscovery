# app/models/feedback_model.py

from datetime import datetime, timezone


def feedback_document():
    """Template for feedback document structure in MongoDB"""
    return {
        "feedback_id": None,
        "user_id": None,  # foreign key to users collection
        "uploaded_video_id": None,  # foreign key to videos collection
        "feedback": None,
        "created_at": datetime.now(timezone.utc)
    }
