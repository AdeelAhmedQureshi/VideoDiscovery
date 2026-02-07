# app/services/auth_service.py

from ..database import db
from ..utils.password_hasher import hash_password, verify_password
from ..utils.jwt_handler import create_access_token, create_refresh_token, decode_refresh_token
from .email_service import EmailService
from typing import Tuple, Dict, Optional
from datetime import datetime, timedelta, timezone
import secrets
from bson import ObjectId


async def get_users_collection():
    """Get users collection from database"""
    return db.get_collection("users")


async def get_password_reset_tokens_collection():
    """Get password reset tokens collection from database"""
    return db.get_collection("password_reset_tokens")


async def get_refresh_tokens_collection():
    """Get refresh tokens collection from database"""
    return db.get_collection("refresh_tokens")


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
            refresh_tokens_col = await get_refresh_tokens_collection()

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
                "password": hashed_password,
                "created_at": datetime.now(timezone.utc)
            }

            # Insert user into database
            print("[auth] inserting user into DB")
            result = await users_col.insert_one(user_data)
            user_id = str(result.inserted_id)
            print(f"[auth] inserted user_id={user_id}")

            # Backfill user_id field for consistency with other collections
            await users_col.update_one(
                {"_id": result.inserted_id},
                {"$set": {"user_id": user_id}}
            )

            # Generate access and refresh tokens
            access_token = create_access_token(user_id, email)
            refresh_token = create_refresh_token(user_id, email)

            # Store refresh token in database for session management
            await refresh_tokens_col.insert_one({
                "user_id": user_id,
                "token": refresh_token,
                "created_at": datetime.now(timezone.utc),
                "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
                "revoked": False
            })

            return {
                "user_id": user_id,
                "name": name,
                "email": email,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer"
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
        refresh_tokens_col = await get_refresh_tokens_collection()

        # Find user by email
        user = await users_col.find_one({"email": email})
        if not user:
            return None, "User does not exist"

        # Verify password
        if not verify_password(password, user["password"]):
            return None, "Invalid password"

        user_id = user.get("user_id") or str(user["_id"])

        # Backfill user_id for older records
        if not user.get("user_id"):
            await users_col.update_one(
                {"_id": user["_id"]},
                {"$set": {"user_id": user_id}}
            )

        # Generate access and refresh tokens
        access_token = create_access_token(user_id, email)
        refresh_token = create_refresh_token(user_id, email)

        # Store refresh token in database for session management
        await refresh_tokens_col.insert_one({
            "user_id": user_id,
            "token": refresh_token,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
            "revoked": False
        })

        return {
            "user_id": user_id,
            "name": user["name"],
            "email": user["email"],
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer"
        }, None

    @staticmethod
    async def forgot_password(email: str) -> Tuple[bool, Optional[str]]:
        """
        Initiate password reset process
        Returns: (success, error)
        """
        try:
            users_col = await get_users_collection()
            reset_tokens_col = await get_password_reset_tokens_collection()

            # Check if user exists
            user = await users_col.find_one({"email": email})
            if not user:
                # Don't reveal that user doesn't exist for security
                return True, None

            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

            # Store reset token
            token_data = {
                "email": email,
                "token": reset_token,
                "expires_at": expires_at,
                "used": False
            }
            await reset_tokens_col.insert_one(token_data)

            # Send reset email
            email_sent = EmailService.send_reset_password_email(
                email, reset_token)

            if not email_sent:
                print(f"[auth] Failed to send reset email to {email}")
                # Continue anyway to not reveal if email exists

            return True, None

        except Exception as e:
            print(f"[auth] forgot_password error: {e}")
            return False, "Failed to process password reset request"

    @staticmethod
    async def reset_password(token: str, new_password: str) -> Tuple[bool, Optional[str]]:
        """
        Reset user password with token
        Returns: (success, error)
        """
        try:
            reset_tokens_col = await get_password_reset_tokens_collection()
            users_col = await get_users_collection()

            # Find valid token
            token_doc = await reset_tokens_col.find_one({
                "token": token,
                "used": False,
                "expires_at": {"$gt": datetime.now(timezone.utc)}
            })

            if not token_doc:
                return False, "Invalid or expired reset token"

            # Hash new password
            hashed_password = hash_password(new_password)

            # Update user password
            result = await users_col.update_one(
                {"email": token_doc["email"]},
                {"$set": {"password": hashed_password}}
            )

            if result.modified_count == 0:
                return False, "Failed to update password"

            # Mark token as used
            await reset_tokens_col.update_one(
                {"token": token},
                {"$set": {"used": True}}
            )

            return True, None

        except Exception as e:
            print(f"[auth] reset_password error: {e}")
            return False, "Failed to reset password"

    @staticmethod
    async def refresh_access_token(refresh_token: str) -> Tuple[Optional[Dict], Optional[str]]:
        """
        Generate new access token using refresh token
        Returns: (token_data, error)
        """
        try:
            # Decode and validate refresh token
            payload = decode_refresh_token(refresh_token)
            user_id = payload.get("user_id")
            email = payload.get("email")

            if not user_id or not email:
                return None, "Invalid token payload"

            # Check if refresh token exists and is not revoked
            refresh_tokens_col = await get_refresh_tokens_collection()
            token_doc = await refresh_tokens_col.find_one({
                "token": refresh_token,
                "revoked": False,
                "expires_at": {"$gt": datetime.now(timezone.utc)}
            })

            if not token_doc:
                return None, "Refresh token is invalid or revoked"

            # Verify user still exists
            users_col = await get_users_collection()
            user = await users_col.find_one({"user_id": user_id})
            if not user:
                try:
                    user = await users_col.find_one({"_id": ObjectId(user_id)})
                except Exception:
                    user = None
            if not user:
                return None, "User not found"

            if not user.get("user_id"):
                await users_col.update_one(
                    {"_id": user["_id"]},
                    {"$set": {"user_id": str(user["_id"])}}
                )

            # Generate new access token
            new_access_token = create_access_token(user_id, email)

            return {
                "access_token": new_access_token,
                "token_type": "bearer"
            }, None

        except Exception as e:
            print(f"[auth] refresh_access_token error: {e}")
            return None, "Failed to refresh token"

    @staticmethod
    async def logout(refresh_token: str) -> Tuple[bool, Optional[str]]:
        """
        Logout user by revoking refresh token
        Returns: (success, error)
        """
        try:
            refresh_tokens_col = await get_refresh_tokens_collection()

            # Revoke the refresh token
            result = await refresh_tokens_col.update_one(
                {"token": refresh_token},
                {"$set": {"revoked": True,
                          "revoked_at": datetime.now(timezone.utc)}}
            )

            if result.modified_count == 0:
                # Token might not exist, but that's ok for logout
                return True, None

            return True, None

        except Exception as e:
            print(f"[auth] logout error: {e}")
            return False, "Failed to logout"

    @staticmethod
    async def logout_all_sessions(user_id: str) -> Tuple[bool, Optional[str]]:
        """
        Logout user from all devices by revoking all refresh tokens
        Returns: (success, error)
        """
        try:
            refresh_tokens_col = await get_refresh_tokens_collection()

            # Revoke all refresh tokens for the user
            result = await refresh_tokens_col.update_many(
                {"user_id": user_id, "revoked": False},
                {"$set": {"revoked": True,
                          "revoked_at": datetime.now(timezone.utc)}}
            )

            print(
                f"[auth] Revoked {result.modified_count} sessions for user {user_id}")
            return True, None

        except Exception as e:
            print(f"[auth] logout_all_sessions error: {e}")
            return False, "Failed to logout from all sessions"
