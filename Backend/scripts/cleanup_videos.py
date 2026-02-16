# Backend/scripts/cleanup_videos.py
import asyncio
import os
import shutil
from pathlib import Path
import sys

# Add the Backend directory to sys.path to allow imports from app
# This script is expected to be run from the project root or Backend directory
script_dir = Path(__file__).parent.absolute()
backend_dir = script_dir.parent
sys.path.insert(0, str(backend_dir))

from app.database import videos_collection, recommendations_collection, feedback_collection
from app.services.cloudinary_service import CloudinaryService
from ai_engine.config import TEMP_VIDEO_DIR

async def cleanup_all_videos():
    """
    Comprehensive cleanup:
    1. Delete videos from Cloudinary.
    2. Clear MongoDB collections (videos, recommendations, feedback).
    3. Clear local temporary video directory.
    """
    print("Starting comprehensive cleanup...")

    try:
        # 1. Fetch all videos to delete from Cloudinary
        print("Fetching video records for Cloudinary cleanup...")
        cursor = videos_collection().find({})
        videos = await cursor.to_list(length=None)
        
        print(f"Found {len(videos)} video records.")
        
        deleted_from_cloudinary = 0
        for video in videos:
            public_id = video.get("cloudinary_public_id")
            if public_id:
                print(f"Deleting from Cloudinary: {public_id}")
                success = await CloudinaryService.delete_video(public_id)
                if success:
                    deleted_from_cloudinary += 1
                else:
                    print(f"Failed to delete {public_id} from Cloudinary.")

        print(f"Deleted {deleted_from_cloudinary} videos from Cloudinary.")

        # 2. Clear MongoDB collections
        print("Clearing MongoDB collections...")
        v_res = await videos_collection().delete_many({})
        r_res = await recommendations_collection().delete_many({})
        f_res = await feedback_collection().delete_many({})
        
        print(f"Cleared {v_res.deleted_count} video records.")
        print(f"Cleared {r_res.deleted_count} recommendation records.")
        print(f"Cleared {f_res.deleted_count} feedback records.")

        # 3. Clear local temporary videos
        print(f"Clearing local temp directory: {TEMP_VIDEO_DIR}")
        if os.path.exists(TEMP_VIDEO_DIR):
            files_deleted = 0
            for filename in os.listdir(TEMP_VIDEO_DIR):
                file_path = os.path.join(TEMP_VIDEO_DIR, filename)
                try:
                    # Avoid deleting .gitkeep or similar if they existed, 
                    # but here we just delete everything as per request.
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                        files_deleted += 1
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                        files_deleted += 1
                except Exception as e:
                    print(f'Failed to delete {file_path}. Reason: {e}')
            print(f"Deleted {files_deleted} local files.")
        else:
            print("Local temp directory does not exist.")

        print("Cleanup complete!")

    except Exception as e:
        print(f"An error occurred during cleanup: {e}")

if __name__ == "__main__":
    asyncio.run(cleanup_all_videos())
