# app/schemas/recommendation_schema.py

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime


class RecommendationCreate(BaseModel):
    """Schema for creating a recommendation"""
    uploaded_video_id: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_link: str


class RecommendationResponse(BaseModel):
    """Schema for recommendation response"""
    recommendation_id: str
    uploaded_video_id: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_link: str
    fetched_at: datetime


class RecommendationInDB(BaseModel):
    """Schema for recommendation stored in database"""
    recommendation_id: str
    uploaded_video_id: str
    title: str
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None
    video_link: str
    fetched_at: datetime


class RecommendationList(BaseModel):
    """Schema for list of recommendations"""
    recommendations: list[RecommendationResponse]
    total_count: int
