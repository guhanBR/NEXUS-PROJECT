"""
Application Configuration Module using Pydantic Settings.
Safely loads environment variables without leaking credentials.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # MongoDB Atlas Connection
    MONGODB_URI: Optional[str] = None
    DATABASE_NAME: str = "rebalancex"
    MONGODB_TIMEOUT_MS: int = 5000

    # CORS Allowed Origins
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()

def get_settings() -> Settings:
    return settings
