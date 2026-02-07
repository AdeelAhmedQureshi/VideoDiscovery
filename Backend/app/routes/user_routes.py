# app/routes/user_routes.py

from fastapi import APIRouter, HTTPException, Response, Cookie, Depends
from typing import Optional
from bson import ObjectId
from ..schemas.user_schema import (
    UserSignup, UserLogin, UserResponse, ForgotPassword, ResetPassword,
    UpdateName, UpdateEmail, UpdatePassword, DeleteAccount
)
from ..services.auth_service import AuthService
from ..utils.jwt_handler import get_current_user
from ..utils.password_hasher import verify_password, hash_password
from ..database import users_collection, videos_collection, feedback_collection, recommendations_collection, refresh_tokens_collection
from ..config import settings
router = APIRouter()


def build_user_id_filter(user_id: str) -> dict:
    """Build a filter that matches either user_id or _id."""
    filters = [{"user_id": user_id}]
    try:
        filters.append({"_id": ObjectId(user_id)})
    except Exception:
        pass

    if len(filters) == 1:
        return filters[0]

    return {"$or": filters}


async def get_user_by_id(user_id: str, projection: Optional[dict] = None) -> Optional[dict]:
    """Fetch a user by user_id or _id and backfill user_id if missing."""
    user = await users_collection().find_one(build_user_id_filter(user_id), projection)

    if user and not user.get("user_id"):
        await users_collection().update_one(
            {"_id": user["_id"]},
            {"$set": {"user_id": str(user["_id"])}}
        )
        user["user_id"] = str(user["_id"])

    return user


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Set HttpOnly cookies for tokens"""
    # Set access token cookie (short-lived)
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # Prevents JavaScript access (XSS protection)
        secure=not settings.DEBUG,  # HTTPS only in production
        samesite="lax",  # CSRF protection
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60  # in seconds
    )

    # Set refresh token cookie (long-lived)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,  # Prevents JavaScript access (XSS protection)
        secure=not settings.DEBUG,  # HTTPS only in production
        samesite="lax",  # CSRF protection
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # in seconds
    )


def clear_auth_cookies(response: Response):
    """Clear authentication cookies"""
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")


@router.post("/signup", response_model=dict)
async def signup(user: UserSignup, response: Response):
    """
    User signup endpoint

    Request body:
    {
        "name": "Your Name",
        "email": "your.email@example.com",
        "password": "your_password"
    }

    Returns access_token and refresh_token in response body and HttpOnly cookies
    """
    data, error = await AuthService.signup(user.name, user.email, user.password)

    if error:
        raise HTTPException(status_code=400, detail=error)

    # Set HttpOnly cookies for secure token storage
    set_auth_cookies(response, data["access_token"], data["refresh_token"])

    return {"success": True, "data": data}


@router.post("/login", response_model=dict)
async def login(user: UserLogin, response: Response):
    """
    User login endpoint

    Request body:
    {
        "email": "your.email@example.com",
        "password": "your_password"
    }

    Returns access_token and refresh_token in response body and HttpOnly cookies
    """
    data, error = await AuthService.login(user.email, user.password)

    if error:
        raise HTTPException(status_code=401, detail=error)

    # Set HttpOnly cookies for secure token storage
    set_auth_cookies(response, data["access_token"], data["refresh_token"])

    return {"success": True, "data": data}


@router.post("/forgot-password", response_model=dict)
async def forgot_password(request: ForgotPassword):
    """
    Initiate password reset process

    Request body:
    {
        "email": "your.email@example.com"
    }
    """
    success, error = await AuthService.forgot_password(request.email)

    if error:
        raise HTTPException(status_code=500, detail=error)

    return {
        "success": True,
        "message": "If the email exists, a password reset link has been sent"
    }


@router.post("/reset-password", response_model=dict)
async def reset_password(request: ResetPassword):
    """
    Reset password using token

    Request body:
    {
        "token": "reset_token_from_email",
        "new_password": "your_new_password"
    }
    """
    success, error = await AuthService.reset_password(request.token, request.new_password)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "success": True,
        "message": "Password has been reset successfully"
    }


@router.post("/refresh", response_model=dict)
async def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    refresh_token_body: Optional[str] = None
):
    """
    Refresh access token using refresh token

    Accepts refresh token from:
    1. HttpOnly cookie (preferred for browsers)
    2. Request body (for API clients)

    Request body (optional):
    {
        "refresh_token": "your_refresh_token"
    }
    """
    # Get refresh token from cookie or body
    token = refresh_token or refresh_token_body

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Refresh token not provided"
        )

    data, error = await AuthService.refresh_access_token(token)

    if error:
        clear_auth_cookies(response)
        raise HTTPException(status_code=401, detail=error)

    # Update access token cookie
    response.set_cookie(
        key="access_token",
        value=data["access_token"],
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    return {"success": True, "data": data}


@router.post("/logout", response_model=dict)
async def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(None),
    refresh_token_body: Optional[str] = None
):
    """
    Logout user by revoking refresh token

    Accepts refresh token from:
    1. HttpOnly cookie (preferred for browsers)
    2. Request body (for API clients)

    Request body (optional):
    {
        "refresh_token": "your_refresh_token"
    }
    """
    # Get refresh token from cookie or body
    token = refresh_token or refresh_token_body

    if token:
        success, error = await AuthService.logout(token)
        if error:
            print(f"[logout] Error: {error}")

    # Always clear cookies on logout
    clear_auth_cookies(response)

    return {
        "success": True,
        "message": "Logged out successfully"
    }


@router.post("/logout-all", response_model=dict)
async def logout_all_sessions(
    response: Response,
    user_id: str
):
    """
    Logout user from all devices by revoking all refresh tokens

    Request body:
    {
        "user_id": "user_id_here"
    }

    Note: In production, get user_id from authenticated session
    """
    success, error = await AuthService.logout_all_sessions(user_id)

    if error:
        raise HTTPException(status_code=500, detail=error)

    # Clear cookies for current session
    clear_auth_cookies(response)

    return {
        "success": True,
        "message": "Logged out from all devices successfully"
    }


# ============================================
# USER ACCOUNT MANAGEMENT ENDPOINTS
# ============================================

@router.get("/me", response_model=dict)
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current user profile information

    Requires: Authentication (Bearer token or HttpOnly cookie)

    Returns user profile data
    """
    try:
        user = await get_user_by_id(
            current_user["user_id"],
            {"password": 0}  # Exclude password from response
        )

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Convert ObjectId to string if present
        if "_id" in user:
            user["_id"] = str(user["_id"])

        return {
            "success": True,
            "data": {
                "user_id": user["user_id"],
                "name": user["name"],
                "email": user["email"],
                "created_at": user.get("created_at")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching user profile: {str(e)}")


@router.put("/update-name", response_model=dict)
async def update_user_name(
    update_data: UpdateName,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user's name

    Requires: Authentication (Bearer token or HttpOnly cookie)

    Request body:
    {
        "name": "New Name"
    }
    """
    try:
        # Update user name in database
        result = await users_collection().update_one(
            build_user_id_filter(current_user["user_id"]),
            {"$set": {"name": update_data.name}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "success": True,
            "message": "Name updated successfully",
            "data": {
                "name": update_data.name
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating name: {str(e)}")


@router.put("/update-email", response_model=dict)
async def update_user_email(
    update_data: UpdateEmail,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user's email address

    Requires: Authentication (Bearer token or HttpOnly cookie)
    Requires: Password confirmation for security

    Request body:
    {
        "email": "newemail@example.com",
        "password": "current_password"
    }
    """
    try:
        # Get current user from database
        user = await get_user_by_id(current_user["user_id"])

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify password
        if not verify_password(update_data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Incorrect password")

        # Check if email is already in use by another user
        existing_user = await users_collection().find_one({
            "email": update_data.email,
            "_id": {"$ne": user["_id"]}
        })

        if existing_user:
            raise HTTPException(status_code=400, detail="Email already in use")

        # Update email in database
        result = await users_collection().update_one(
            build_user_id_filter(current_user["user_id"]),
            {"$set": {"email": update_data.email}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "success": True,
            "message": "Email updated successfully. Please login again with your new email.",
            "data": {
                "email": update_data.email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating email: {str(e)}")


@router.put("/update-password", response_model=dict)
async def update_user_password(
    update_data: UpdatePassword,
    response: Response,
    current_user: dict = Depends(get_current_user)
):
    """
    Update user's password

    Requires: Authentication (Bearer token or HttpOnly cookie)
    Requires: Current password verification

    Request body:
    {
        "current_password": "current_password",
        "new_password": "new_password"
    }

    Note: This will logout the user from all devices for security
    """
    try:
        # Get current user from database
        user = await get_user_by_id(current_user["user_id"])

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify current password
        if not verify_password(update_data.current_password, user["password"]):
            raise HTTPException(
                status_code=401, detail="Current password is incorrect")

        # Check if new password is same as current
        if verify_password(update_data.new_password, user["password"]):
            raise HTTPException(
                status_code=400, detail="New password must be different from current password")

        # Hash new password
        new_hashed_password = hash_password(update_data.new_password)

        # Update password in database
        result = await users_collection().update_one(
            build_user_id_filter(current_user["user_id"]),
            {"$set": {"password": new_hashed_password}}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        # Logout from all devices for security (invalidate all refresh tokens)
        user_id = user.get("user_id") or str(user["_id"])
        await refresh_tokens_collection().delete_many({"user_id": user_id})

        # Clear cookies for current session
        clear_auth_cookies(response)

        return {
            "success": True,
            "message": "Password updated successfully. Please login again with your new password."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating password: {str(e)}")


@router.delete("/delete-account", response_model=dict)
async def delete_user_account(
    delete_data: DeleteAccount,
    response: Response,
    current_user: dict = Depends(get_current_user)
):
    """
    Permanently delete user account and all associated data

    Requires: Authentication (Bearer token or HttpOnly cookie)
    Requires: Password confirmation
    Requires: Typing "DELETE" to confirm

    Request body:
    {
        "password": "your_password",
        "confirmation": "DELETE"
    }

    WARNING: This action is irreversible and will delete:
    - User account
    - All uploaded videos
    - All feedback
    - All recommendations
    - All refresh tokens
    """
    try:
        # Get current user from database
        user = await get_user_by_id(current_user["user_id"])

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Verify password
        if not verify_password(delete_data.password, user["password"]):
            raise HTTPException(status_code=401, detail="Incorrect password")

        user_id = user.get("user_id") or str(user["_id"])

        # Delete all user data in a safe manner
        # 1. Delete all videos uploaded by user
        await videos_collection().delete_many({"user_id": user_id})

        # 2. Delete all feedback by user
        await feedback_collection().delete_many({"user_id": user_id})

        # 3. Delete all recommendations for user
        await recommendations_collection().delete_many({"user_id": user_id})

        # 4. Delete all refresh tokens
        await refresh_tokens_collection().delete_many({"user_id": user_id})

        # 5. Finally, delete the user account
        result = await users_collection().delete_one(build_user_id_filter(user_id))

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        # Clear authentication cookies
        clear_auth_cookies(response)

        return {
            "success": True,
            "message": "Account deleted successfully. All your data has been permanently removed."
        }
    except HTTPException:
        raise
    except Exception as e:
        # If something goes wrong, at least try to preserve data integrity
        raise HTTPException(
            status_code=500, detail=f"Error deleting account: {str(e)}")


@router.get("/account-stats", response_model=dict)
async def get_account_statistics(current_user: dict = Depends(get_current_user)):
    """
    Get statistics about user's account and data

    Requires: Authentication (Bearer token or HttpOnly cookie)

    Returns counts of videos, feedback, and recommendations
    """
    try:
        user_id = current_user["user_id"]

        # Count user's data
        video_count = await videos_collection().count_documents({"user_id": user_id})
        feedback_count = await feedback_collection().count_documents({"user_id": user_id})
        recommendation_count = await recommendations_collection().count_documents({"user_id": user_id})

        # Get user info
        user = await get_user_by_id(
            user_id,
            {"password": 0}
        )

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "success": True,
            "data": {
                "user_id": user.get("user_id") or str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "created_at": user.get("created_at"),
                "statistics": {
                    "total_videos": video_count,
                    "total_feedback": feedback_count,
                    "total_recommendations": recommendation_count
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching account statistics: {str(e)}")
