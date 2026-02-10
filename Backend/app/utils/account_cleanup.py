# app/utils/account_cleanup.py
import asyncio
from datetime import datetime
from ..database import users_collection, videos_collection, feedback_collection, recommendations_collection, refresh_tokens_collection

async def cleanup_deactivated_users_once():
    """
    Permanently delete accounts deactivated past their delete_after date,
    along with associated data (videos, feedback, recommendations, sessions).
    """
    try:
        # Use UTC-naive for consistent comparison with stored Mongo datetimes
        now = datetime.utcnow()
        cursor = users_collection().find({
            "deactivated_at": {"$exists": True},
            "delete_after": {"$lte": now}
        })
        users = await cursor.to_list(length=None)
        for user in users:
            user_id = user.get("user_id") or str(user.get("_id"))
            if not user_id:
                continue
            # Delete associated data
            await videos_collection().delete_many({"user_id": user_id})
            await feedback_collection().delete_many({"user_id": user_id})
            await recommendations_collection().delete_many({"user_id": user_id})
            await refresh_tokens_collection().delete_many({"user_id": user_id})
            # Delete user document
            await users_collection().delete_one({"_id": user["_id"]})
            print(f"[cleanup] Permanently deleted deactivated user {user_id}")
    except Exception as e:
        print(f"[cleanup] Error during deactivated users cleanup: {e}")


async def run_deactivated_cleanup_loop(interval_hours: int = 12):
    """Run cleanup periodically in the background."""
    while True:
        await cleanup_deactivated_users_once()
        await asyncio.sleep(interval_hours * 3600)
