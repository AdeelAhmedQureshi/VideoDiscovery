# app/routes/user_routes.py

from fastapi import APIRouter, HTTPException
from ..schemas.user_schema import UserSignup, UserLogin, UserResponse
from ..services.auth_service import AuthService

router = APIRouter()


@router.post("/signup", response_model=dict)
async def signup(user: UserSignup):
    """
    User signup endpoint

    Request body:
    {
        "name": "Your Name",
        "email": "your.email@example.com",
        "password": "your_password"
    }
    """
    data, error = await AuthService.signup(user.name, user.email, user.password)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {"success": True, "data": data}


@router.post("/login", response_model=dict)
async def login(user: UserLogin):
    """
    User login endpoint

    Request body:
    {
        "email": "your.email@example.com",
        "password": "your_password"
    }
    """
    data, error = await AuthService.login(user.email, user.password)

    if error:
        raise HTTPException(status_code=401, detail=error)

    return {"success": True, "data": data}
