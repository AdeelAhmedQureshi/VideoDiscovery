# app/models/__init__.py

from .user_model import user_document
from .video_model import video_document
from .recommendation_model import recommendation_document
from .feedback_model import feedback_document

__all__ = [
    "user_document",
    "video_document",
    "recommendation_document",
    "feedback_document"
]
