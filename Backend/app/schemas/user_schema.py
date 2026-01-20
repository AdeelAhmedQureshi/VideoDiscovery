# app/schemas/user_schema.py

from pydantic import BaseModel, EmailStr
from typing import Optional


class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str


class UserResponse(BaseModel):
    user_id: str
    name: str
    email: str
    token: str


class UserInDB(BaseModel):
    user_id: str
    name: str
    email: str
