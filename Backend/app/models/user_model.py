# app/models/user_model.py

from datetime import datetime, timezone


def user_document():
    """Template for user document structure in MongoDB"""
    return {
        "user_id": None,
        "name": None,
        "email": None,
        "password": None,   # hashed password
        "created_at": datetime.now(timezone.utc)
    }
