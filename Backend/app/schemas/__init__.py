# app/schemas/__init__.py

from .user_schema import UserSignup, UserLogin, UserResponse, UserInDB
from .video_schema import (
    VideoUpload,
    VideoUploadResponse,
    VideoResponse,
    VideoStatus,
    VideoInDB
)
from .recommendation_schema import (
    RecommendationCreate,
    RecommendationResponse,
    RecommendationInDB,
    RecommendationList
)
from .feedback_schema import (
    FeedbackCreate,
    FeedbackUpdate,
    FeedbackResponse,
    FeedbackInDB,
    FeedbackList
)

__all__ = [
    # User schemas
    "UserSignup",
    "UserLogin",
    "UserResponse",
    "UserInDB",
    # Video schemas
    "VideoUpload",
    "VideoUploadResponse",
    "VideoResponse",
    "VideoStatus",
    "VideoInDB",
    # Recommendation schemas
    "RecommendationCreate",
    "RecommendationResponse",
    "RecommendationInDB",
    "RecommendationList",
    # Feedback schemas
    "FeedbackCreate",
    "FeedbackUpdate",
    "FeedbackResponse",
    "FeedbackInDB",
    "FeedbackList"
]
