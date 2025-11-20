# app/services/auth_service.py

from ..database import db
from ..utils.password_hasher import hash_password, verify_password
from ..utils.jwt_handler import create_token
from typing import Tuple, Dict, Optional


async def get_users_collection():
    """Get users collection from database"""
    return db.get_collection("users")


class AuthService:
    """Authentication service for user signup and login"""

    @staticmethod
    async def signup(name: str, email: str, password: str) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Register a new user
        Returns: (user_data, error)
        """
        try:
            print(f"[auth] signup start for email={email}")
            users_col = await get_users_collection()

            # Check if user already exists
            existing_user = await users_col.find_one({"email": email})
            print(f"[auth] find_one returned: {bool(existing_user)}")
            if existing_user:
                return None, "User already exists"

            # Hash password
            print("[auth] hashing password (CPU-bound)")
            hashed_password = hash_password(password)
            print("[auth] hashing done")

            # Create user document
            user_data = {
                "name": name,
                "email": email,
                "password": hashed_password
            }

            # Insert user into database
            print("[auth] inserting user into DB")
            result = await users_col.insert_one(user_data)
            user_id = str(result.inserted_id)
            print(f"[auth] inserted user_id={user_id}")

            # Generate JWT token
            token = create_token(user_id)

            return {
                "user_id": user_id,
                "name": name,
                "email": email,
                "token": token
            }, None
        except Exception as e:
            print(f"[auth] signup error: {e}")
            raise

    @staticmethod
    async def login(email: str, password: str) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Authenticate a user
        Returns: (user_data, error)
        """
        users_col = await get_users_collection()

        # Find user by email
        user = await users_col.find_one({"email": email})
        if not user:
            return None, "User does not exist"

        # Verify password
        if not verify_password(password, user["password"]):
            return None, "Invalid password"

        # Generate JWT token
        token = create_token(str(user["_id"]))

        return {
            "user_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "token": token
        }, None
