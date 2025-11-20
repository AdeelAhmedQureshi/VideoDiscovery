from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str
    DEBUG: bool
    MONGO_URL: str
    DATABASE_NAME: str
    JWT_SECRET: str

    CLOUDINARY_CLOUD_NAME: str | None = None
    CLOUDINARY_API_KEY: str | None = None
    CLOUDINARY_API_SECRET: str | None = None

    COLAB_URL: str | None = None
    YOUTUBE_API_KEY: str | None = None

    MAX_UPLOAD_SIZE_MB: int


settings = Settings()
