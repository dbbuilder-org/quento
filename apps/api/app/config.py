"""
Application Configuration

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Quento API"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8081"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://quento:quento@localhost:5432/quento"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # JWT Authentication
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI Configuration
    LITELLM_API_KEY: str = ""
    CHAT_MODEL: str = "gpt-4o"
    ANALYSIS_MODEL: str = "gpt-4o"
    FAST_MODEL: str = "gpt-4o-mini"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    CHAT_RATE_LIMIT_PER_MINUTE: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


settings = get_settings()
