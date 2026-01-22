# app/utils/jwt_handler.py

import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Security, status, Request, Cookie
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from ..config import settings


# HTTP bearer scheme for extracting Authorization header
bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(user_id: str, email: str) -> str:
    """Create a short-lived JWT access token"""
    payload = {
        "user_id": user_id,
        "email": email,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def create_refresh_token(user_id: str, email: str) -> str:
    """Create a long-lived JWT refresh token"""
    payload = {
        "user_id": user_id,
        "email": email,
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, settings.JWT_REFRESH_SECRET, algorithm="HS256")


def create_token(user_id: str) -> str:
    """Create a JWT token for a user (legacy support)"""
    payload = {
        "user_id": user_id,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_access_token(token: str) -> dict:
    """Decode and verify an access token. Raises HTTPException for invalid tokens."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )


def decode_refresh_token(token: str) -> dict:
    """Decode and verify a refresh token. Raises HTTPException for invalid tokens."""
    try:
        payload = jwt.decode(
            token, settings.JWT_REFRESH_SECRET, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired. Please login again."
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token (legacy support). Raises HTTPException for invalid tokens."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
    access_token: Optional[str] = Cookie(None)
) -> dict:
    """FastAPI dependency to get the current user from Bearer token or HttpOnly cookie.

    Usage:
        current_user = Depends(get_current_user)

    Returns the decoded JWT payload (dict) on success; raises 401 on failure.
    Supports both Authorization header and HttpOnly cookie for flexibility.
    """
    token = None

    # Try to get token from Authorization header first (for API clients)
    if credentials and credentials.scheme.lower() == "bearer":
        token = credentials.credentials
    # Fallback to HttpOnly cookie (for browser clients)
    elif access_token:
        token = access_token

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials"
        )

    return decode_access_token(token)
