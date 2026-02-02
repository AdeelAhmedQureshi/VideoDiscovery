# cleanup_videos.py
"""
Script to clean up invalid video documents from MongoDB
Run this to fix the duplicate key error
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def cleanup_videos():
    """Remove video documents with null user_id or video_hash"""
    try:
        print("🧹 Cleaning up invalid video documents...")
        print(f"Connecting to: {settings.MONGO_URL[:50]}...")

        client = AsyncIOMotorClient(settings.MONGO_URL)
        db = client[settings.DATABASE_NAME]
        videos_collection = db.videos

        # Find documents with null user_id or video_hash
        query = {
            "$or": [
                {"user_id": None},
                {"video_hash": None},
                {"user_id": {"$exists": False}},
                {"video_hash": {"$exists": False}}
            ]
        }

        # Count how many will be deleted
        count = await videos_collection.count_documents(query)
        print(f"Found {count} invalid video documents")

        if count > 0:
            # Show some examples
            cursor = videos_collection.find(query).limit(3)
            print("\nExample documents to be deleted:")
            async for doc in cursor:
                print(
                    f"  - ID: {doc.get('_id')}, user_id: {doc.get('user_id')}, video_hash: {doc.get('video_hash')}, file_url: {doc.get('file_url', 'N/A')[:50]}")

            # Ask for confirmation
            response = input(
                f"\n⚠️  Delete {count} invalid document(s)? (yes/no): ").strip().lower()

            if response == 'yes':
                result = await videos_collection.delete_many(query)
                print(f"✅ Deleted {result.deleted_count} documents")
            else:
                print("❌ Cleanup cancelled")
        else:
            print("✅ No invalid documents found!")

        # Now try to drop the problematic index if it exists
        try:
            await videos_collection.drop_index("user_id_1_video_hash_1")
            print("✅ Dropped old unique index")
        except Exception as e:
            print(f"ℹ️  Index drop: {e}")

        client.close()
        print("\n✅ Cleanup complete! Restart your backend to recreate indexes.")

    except Exception as e:
        print(f"❌ Error during cleanup: {e}")


if __name__ == "__main__":
    asyncio.run(cleanup_videos())
