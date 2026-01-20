# app/schemas/feedback_schema.py

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class FeedbackCreate(BaseModel):
    """Schema for creating feedback"""
    uploaded_video_id: str
    feedback: str = Field(..., min_length=1, max_length=1000)


class FeedbackUpdate(BaseModel):
    """Schema for updating feedback"""
    feedback: str = Field(..., min_length=1, max_length=1000)


class FeedbackResponse(BaseModel):
    """Schema for feedback response"""
    feedback_id: str
    user_id: str
    uploaded_video_id: str
    feedback: str
    created_at: datetime


class FeedbackInDB(BaseModel):
    """Schema for feedback stored in database"""
    feedback_id: str
    user_id: str
    uploaded_video_id: str
    feedback: str
    created_at: datetime


class FeedbackList(BaseModel):
    """Schema for list of feedbacks"""
    feedbacks: list[FeedbackResponse]
    total_count: int
