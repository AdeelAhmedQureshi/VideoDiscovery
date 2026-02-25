# feedback_routes.py
from fastapi import APIRouter, HTTPException, Depends
from ..database import feedback_collection
from pydantic import BaseModel
from typing import Optional
from ..utils.helper_functions import generate_id
from ..utils.jwt_handler import get_current_user
from datetime import datetime, timezone

router = APIRouter()


class FeedbackIn(BaseModel):
    video_id: str
    rating: int   # 1-5 star rating
    comment: Optional[str] = None


@router.post("/")
async def submit_feedback(
    payload: FeedbackIn,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit or update feedback for a video.
    If feedback already exists for this user+video, update it.
    """
    user_id = current_user.get("user_id")
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid user authentication")
    
    # Validate rating
    if not (1 <= payload.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if feedback already exists
    existing_feedback = await feedback_collection().find_one({
        "video_id": payload.video_id,
        "user_id": user_id
    })
    
    if existing_feedback:
        # Update existing feedback
        await feedback_collection().update_one(
            {"_id": existing_feedback["_id"]},
            {"$set": {
                "rating": payload.rating,
                "comment": payload.comment,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        return {
            "feedback_id": existing_feedback["_id"],
            "status": "updated",
            "message": "Feedback updated successfully"
        }
    else:
        # Create new feedback
        feedback_id = generate_id(prefix="f")
        doc = {
            "_id": feedback_id,
            "video_id": payload.video_id,
            "user_id": user_id,
            "rating": payload.rating,
            "comment": payload.comment,
            "created_at": datetime.now(timezone.utc)
        }
        await feedback_collection().insert_one(doc)
        return {
            "feedback_id": feedback_id,
            "status": "created",
            "message": "Feedback submitted successfully"
        }
