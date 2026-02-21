# app/schemas/recommendation_schema.py

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RecommendationCreate(BaseModel):
    """Schema for creating a recommendation"""
    uploaded_video_id: str
    youtube_video_id: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    channel_title: Optional[str] = None
    views: Optional[str] = None
    view_count: int = 0
    uploaded_at_text: Optional[str] = None
    published_at: Optional[str] = None
    duration: Optional[str] = None
    video_link: str
    similarity: float = 0.0
    search_query_used: Optional[str] = None


class RecommendationResponse(BaseModel):
    """Schema for a single recommendation in API response"""
    id: int
    youtube_video_id: str
    title: str
    thumbnail: Optional[str] = None
    channel: Optional[str] = None
    views: Optional[str] = None
    view_count: int = 0
    uploadedAt: Optional[str] = None
    duration: Optional[str] = None
    url: str
    similarity: float = 0.0


class UploadedVideoSummary(BaseModel):
    """Summary of the uploaded video"""
    video_id: str
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    status: str = "unknown"
    uploaded_at: Optional[str] = None


class RecommendationList(BaseModel):
    """Schema for the full recommendations API response"""
    uploaded_video: Optional[UploadedVideoSummary] = None
    recommendations: List[RecommendationResponse]
    message: Optional[str] = None
