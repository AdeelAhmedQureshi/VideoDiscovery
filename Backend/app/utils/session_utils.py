# app/utils/session_utils.py

from datetime import datetime, timezone, timedelta
from ..database import db


async def cleanup_expired_refresh_tokens():
    """
    Clean up expired refresh tokens from database
    Should be run periodically (e.g., daily cron job)
    """
    refresh_tokens_col = db.get_collection("refresh_tokens")

    result = await refresh_tokens_col.delete_many({
        "expires_at": {"$lt": datetime.now(timezone.utc)}
    })

    print(
        f"[session_cleanup] Deleted {result.deleted_count} expired refresh tokens")
    return result.deleted_count


async def cleanup_expired_password_reset_tokens():
    """
    Clean up expired password reset tokens from database
    Should be run periodically (e.g., daily cron job)
    """
    reset_tokens_col = db.get_collection("password_reset_tokens")

    result = await reset_tokens_col.delete_many({
        "expires_at": {"$lt": datetime.now(timezone.utc)}
    })

    print(
        f"[session_cleanup] Deleted {result.deleted_count} expired reset tokens")
    return result.deleted_count


async def get_active_sessions_count(user_id: str) -> int:
    """
    Get count of active sessions for a user
    """
    refresh_tokens_col = db.get_collection("refresh_tokens")

    count = await refresh_tokens_col.count_documents({
        "user_id": user_id,
        "revoked": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    })

    return count


async def get_user_sessions(user_id: str):
    """
    Get all active sessions for a user with details
    """
    refresh_tokens_col = db.get_collection("refresh_tokens")

    sessions = await refresh_tokens_col.find({
        "user_id": user_id,
        "revoked": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    }).to_list(length=100)

    return [
        {
            "session_id": str(session["_id"]),
            "created_at": session["created_at"],
            "expires_at": session["expires_at"]
        }
        for session in sessions
    ]


async def revoke_old_sessions(user_id: str, keep_latest: int = 5):
    """
    Revoke old sessions, keeping only the latest N sessions
    Useful for limiting concurrent sessions per user
    """
    refresh_tokens_col = db.get_collection("refresh_tokens")

    # Find all active sessions
    sessions = await refresh_tokens_col.find({
        "user_id": user_id,
        "revoked": False,
        "expires_at": {"$gt": datetime.now(timezone.utc)}
    }).sort("created_at", -1).to_list(length=None)

    # Keep only latest N sessions
    if len(sessions) > keep_latest:
        sessions_to_revoke = sessions[keep_latest:]
        token_ids = [session["_id"] for session in sessions_to_revoke]

        result = await refresh_tokens_col.update_many(
            {"_id": {"$in": token_ids}},
            {"$set": {"revoked": True,
                      "revoked_at": datetime.now(timezone.utc)}}
        )

        print(
            f"[session_cleanup] Revoked {result.modified_count} old sessions for user {user_id}")
        return result.modified_count

    return 0
