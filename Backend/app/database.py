# app/database.py
from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

# connect to MongoDB Atlas
client = AsyncIOMotorClient(settings.MONGO_URL)

# default database from the URI (videodiscovery)
db = client.get_default_database()

# Helpers to access collections


def videos_collection():
    return db.get_collection("videos")


def recommendations_collection():
    return db.get_collection("recommendations")


def feedback_collection():
    return db.get_collection("feedback")


def users_collection():
    return db.get_collection("users")


def refresh_tokens_collection():
    return db.get_collection("refresh_tokens")


def password_reset_tokens_collection():
    return db.get_collection("password_reset_tokens")
