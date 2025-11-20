# # cloudinary_service.py
# import cloudinary
# import cloudinary.uploader
# from fastapi import UploadFile
# from ..config import settings
# import tempfile
# import os

# # cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)

# def upload_file_to_cloudinary(file: UploadFile) -> str:
#     """
#     Save UploadFile to temporary file and upload to Cloudinary -> return secure_url.
#     Synchronous for simplicity. In production consider async or streaming upload.
#     """
#     suffix = os.path.splitext(file.filename)[1]
#     with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
#         tmp.write(file.file.read())
#         tmp.flush()
#         tmp_path = tmp.name
#     res = cloudinary.uploader.upload(tmp_path, resource_type="video")
#     os.unlink(tmp_path)
#     return res.get("secure_url")
