# app/routes/user_routes.py

from fastapi import APIRouter, HTTPException, Response, Cookie
from typing import Optional
from ..schemas.user_schema import UserSignup, UserLogin, UserResponse, ForgotPassword, ResetPassword
from ..services.auth_service import AuthService
from ..config import settings
router = APIRouter()


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
