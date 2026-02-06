# app/schemas/user_schema.py

from pydantic import BaseModel, EmailStr, field_validator
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


class UpdateName(BaseModel):
    name: str

    @field_validator('name')
    @classmethod
    def name_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()


class UpdateEmail(BaseModel):
    email: EmailStr
    password: str  # Require password confirmation for security


class UpdatePassword(BaseModel):
    current_password: str
    new_password: str

    @field_validator('new_password')
    @classmethod
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        return v


class DeleteAccount(BaseModel):
    password: str  # Require password confirmation for security
    confirmation: str  # Additional safety measure

    @field_validator('confirmation')
    @classmethod
    def confirm_deletion(cls, v):
        if v.upper() != "DELETE":
            raise ValueError(
                'Please type "DELETE" to confirm account deletion')
        return v
