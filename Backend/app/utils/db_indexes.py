# app/utils/db_indexes.py

from ..database import db


async def create_database_indexes():
    """
    Create database indexes for optimal performance
    Should be called on application startup
    """
    print("[DB Indexes] Creating indexes for optimal performance...")

    try:
        # Users collection indexes
        users_col = db.get_collection("users")
        await users_col.create_index("email", unique=True)
        print("✓ Created index on users.email")

        # Refresh tokens collection indexes
        refresh_tokens_col = db.get_collection("refresh_tokens")
        await refresh_tokens_col.create_index("token")
        await refresh_tokens_col.create_index("user_id")
        await refresh_tokens_col.create_index(
            "expires_at",
            expireAfterSeconds=0  # TTL index - auto-delete expired tokens
        )
        print("✓ Created indexes on refresh_tokens")

        # Password reset tokens collection indexes
        reset_tokens_col = db.get_collection("password_reset_tokens")
        await reset_tokens_col.create_index("token")
        await reset_tokens_col.create_index("email")
        await reset_tokens_col.create_index(
            "expires_at",
            expireAfterSeconds=0  # TTL index - auto-delete expired tokens
        )
        print("✓ Created indexes on password_reset_tokens")

        # Videos collection indexes
        videos_col = db.get_collection("videos")
        await videos_col.create_index("user_id")
        await videos_col.create_index("video_hash")
        await videos_col.create_index("uploaded_at")
        print("✓ Created indexes on videos")

        # Recommendations collection indexes
        recommendations_col = db.get_collection("recommendations")
        await recommendations_col.create_index("uploaded_video_id")
        await recommendations_col.create_index("fetched_at")
        print("✓ Created indexes on recommendations")

        # Feedback collection indexes
        feedback_col = db.get_collection("feedback")
        await feedback_col.create_index("user_id")
        await feedback_col.create_index("uploaded_video_id")
        await feedback_col.create_index("created_at")
        print("✓ Created indexes on feedback")

        print("[DB Indexes] ✅ All indexes created successfully!")

    except Exception as e:
        print(f"[DB Indexes] ⚠️ Error creating indexes: {e}")
        # Don't fail startup if index creation fails
