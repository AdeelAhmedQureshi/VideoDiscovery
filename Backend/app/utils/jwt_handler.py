# app/utils/jwt_handler.py

import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from ..config import settings


# HTTP bearer scheme for extracting Authorization header
bearer_scheme = HTTPBearer(auto_error=False)


def create_token(user_id: str) -> str:
    """Create a JWT token for a user"""
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token. Raises HTTPException for invalid tokens."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def get_current_user(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)) -> dict:
    """FastAPI dependency to get the current user payload from an Authorization header.

    Usage:
        current_user = Depends(get_current_user)

    Returns the decoded JWT payload (dict) on success; raises 401 on failure.
    """
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Missing or invalid authorization")

    token = credentials.credentials
    return decode_token(token)
