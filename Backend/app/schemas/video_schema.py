# app/schemas/video_schema.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class VideoUpload(BaseModel):
    """Schema for video upload request"""
    file_name: str
    intelligent_query: str  # Required on creation


class VideoUpdate(BaseModel):
    """Schema for video update request"""
    intelligent_query: Optional[str] = None  # Optional on update
    file_name: Optional[str] = None


class VideoUploadResponse(BaseModel):
    """Schema for video upload response"""
    video_id: str
    file_url: str
    status: str = Field(default="uploaded")


class VideoResponse(BaseModel):
    """Schema for complete video information"""
    video_id: str
    user_id: str
    file_url: str
    file_name: str
    intelligent_query: str  # Required field
    video_hash: str  # Required - used for duplicate detection
    uploaded_at: datetime


class VideoStatus(BaseModel):
    """Schema for video processing status"""
    video_id: str
    status: str
    intelligent_query: Optional[str] = None
    recommendations_count: int = 0


class VideoInDB(BaseModel):
    """Schema for video stored in database"""
    video_id: str
    user_id: str
    file_url: str
    file_name: str
    intelligent_query: Optional[str] = None
    video_hash: str  # Required - used for duplicate detection
    uploaded_at: datetime
