# app/services/cloudinary_service.py

import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import UploadFile
from ..config import settings
import tempfile
import os
import hashlib
from typing import Dict, Optional


# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)


class CloudinaryService:
    """Service for handling video uploads and management with Cloudinary"""

    @staticmethod
    async def upload_video(file: UploadFile, user_id: str) -> Dict[str, str]:
        """
        Upload a video file to Cloudinary

        Args:
            file: The video file to upload
            user_id: ID of the user uploading the video

        Returns:
            Dictionary containing video URL, public_id, and other metadata
        """
        try:
            # Read file content
            file_content = await file.read()

            # Calculate video hash for deduplication
            video_hash = hashlib.sha256(file_content).hexdigest()

            # Create a temporary file
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(file_content)
                tmp.flush()
                tmp_path = tmp.name

            try:
                # Upload to Cloudinary
                upload_result = cloudinary.uploader.upload(
                    tmp_path,
                    resource_type="video",
                    folder=f"videodiscovery/users/{user_id}",
                    use_filename=True,
                    unique_filename=True,
                    overwrite=False,
                    # Enable video optimization
                    eager=[
                        {"quality": "auto", "fetch_format": "auto"}
                    ],
                    eager_async=True
                )

                return {
                    "url": upload_result.get("secure_url"),
                    "public_id": upload_result.get("public_id"),
                    "format": upload_result.get("format"),
                    "duration": upload_result.get("duration"),
                    "width": upload_result.get("width"),
                    "height": upload_result.get("height"),
                    "video_hash": video_hash
                }

            finally:
                # Clean up temporary file
                os.unlink(tmp_path)

        except Exception as e:
            print(f"Error uploading video to Cloudinary: {e}")
            raise Exception(f"Failed to upload video: {str(e)}")

    @staticmethod
    def get_video_url(public_id: str, transformations: Optional[Dict] = None) -> str:
        """
        Get optimized video URL with optional transformations

        Args:
            public_id: Cloudinary public ID of the video
            transformations: Optional dictionary of transformations

        Returns:
            Optimized video URL
        """
        try:
            if transformations:
                return cloudinary.CloudinaryVideo(public_id).build_url(**transformations)
            else:
                # Default optimized URL
                return cloudinary.CloudinaryVideo(public_id).build_url(
                    quality="auto",
                    fetch_format="auto"
                )
        except Exception as e:
            print(f"Error generating video URL: {e}")
            return ""

    @staticmethod
    def get_thumbnail_url(public_id: str, width: int = 400, height: int = 300) -> str:
        """
        Get video thumbnail URL

        Args:
            public_id: Cloudinary public ID of the video
            width: Thumbnail width
            height: Thumbnail height

        Returns:
            Thumbnail URL
        """
        try:
            return cloudinary.CloudinaryVideo(public_id).build_url(
                resource_type="video",
                format="jpg",
                transformation=[
                    {"width": width, "height": height, "crop": "fill"},
                    {"quality": "auto"}
                ]
            )
        except Exception as e:
            print(f"Error generating thumbnail URL: {e}")
            return ""

    @staticmethod
    async def delete_video(public_id: str) -> bool:
        """
        Delete a video from Cloudinary

        Args:
            public_id: Cloudinary public ID of the video

        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            result = cloudinary.uploader.destroy(
                public_id,
                resource_type="video"
            )
            return result.get("result") == "ok"
        except Exception as e:
            print(f"Error deleting video from Cloudinary: {e}")
            return False

    @staticmethod
    def get_video_info(public_id: str) -> Optional[Dict]:
        """
        Get video information from Cloudinary

        Args:
            public_id: Cloudinary public ID of the video

        Returns:
            Dictionary containing video information or None
        """
        try:
            result = cloudinary.api.resource(
                public_id,
                resource_type="video"
            )
            return {
                "public_id": result.get("public_id"),
                "format": result.get("format"),
                "duration": result.get("duration"),
                "width": result.get("width"),
                "height": result.get("height"),
                "bytes": result.get("bytes"),
                "url": result.get("secure_url"),
                "created_at": result.get("created_at")
            }
        except Exception as e:
            print(f"Error getting video info from Cloudinary: {e}")
            return None
