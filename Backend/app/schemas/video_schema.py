# video_schema.py
from pydantic import BaseModel, Field
from typing import Optional, List


class VideoUploadResponse(BaseModel):
    video_id: str
    file_url: str
    status: str = Field(default="queued")


class VideoStatus(BaseModel):
    video_id: str
    status: str
    intelligent_query: Optional[str] = None
    recommendations_count: int = 0
