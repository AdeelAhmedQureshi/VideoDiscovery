from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str
    DEBUG: bool
    MONGO_URL: str
    DATABASE_NAME: str
    JWT_SECRET: str
    JWT_REFRESH_SECRET: str = "change-this-refresh-secret-in-production"

    # Token expiration settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours (1440 minutes)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7  # Long-lived refresh token

    # Cloudinary configuration
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    CLOUDINARY_URL: str

    # Email configuration for password reset
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAIL_FROM: str | None = None
    FRONTEND_URL: str = "http://localhost:5173"

    COLAB_URL: str | None = None
    YOUTUBE_API_KEY: str | None = None

    MAX_UPLOAD_SIZE_MB: int


settings = Settings()
