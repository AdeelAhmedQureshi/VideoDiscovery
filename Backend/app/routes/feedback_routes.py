# feedback_routes.py
from fastapi import APIRouter, HTTPException
from ..database import feedback_collection
from pydantic import BaseModel
from typing import Optional
from ..utils.helper_functions import generate_id
from datetime import datetime, timezone

router = APIRouter()


class FeedbackIn(BaseModel):
    video_id: str
    user_id: Optional[str] = None
    rating: str   # "Strongly Relevant" | "Relevant" | "Irrelevant" | "Strongly Irrelevant"
    comment: Optional[str] = None


@router.post("/")
async def submit_feedback(payload: FeedbackIn):
    feedback_id = generate_id(prefix="f")
    doc = {
        "_id": feedback_id,
        "video_id": payload.video_id,
        "user_id": payload.user_id,
        "rating": payload.rating,
        "comment": payload.comment,
        "created_at": datetime.now(timezone.utc)
    }
    await feedback_collection().insert_one(doc)
    return {"feedback_id": feedback_id, "status": "saved"}
