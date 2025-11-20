from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from ..database import videos_collection
from ..utils.helper_functions import generate_id

router = APIRouter()


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    # TEMP version — no Cloudinary yet
    if not file.filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv", ".webm")):
        raise HTTPException(status_code=400, detail="Unsupported file format.")

    video_id = generate_id("v")

    # Temporary file URL (we replace this with Cloudinary later)
    file_url = f"temp://{file.filename}"

    await videos_collection().insert_one({
        "_id": video_id,
        "file_url": file_url,
        "filename": file.filename,
        "status": "uploaded_temp"
    })

    return {"video_id": video_id, "file_url": file_url, "status": "uploaded_temp"}
