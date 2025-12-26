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

    # Database (raw URL from environment)
    DATABASE_URL: str = "postgresql+asyncpg://quento:quento@localhost:5432/quento"

    @property
    def async_database_url(self) -> str:
        """Get database URL with asyncpg driver for SQLAlchemy async."""
        url = self.DATABASE_URL
        # Convert postgresql:// to postgresql+asyncpg://
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # JWT Authentication (legacy - keeping for backwards compatibility)
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Clerk Authentication
    CLERK_SECRET_KEY: str = "sk_test_ygPazt9fxEjqbZkcfs5y3vcHsllyvcNg5nlF8MJLSv"
    CLERK_PUBLISHABLE_KEY: str = "pk_test_c3Ryb25nLXBvbGxpd29nLTc2LmNsZXJrLmFjY291bnRzLmRldiQ"

    # AI Configuration - Using gpt-4o-mini for cost efficiency
    LITELLM_API_KEY: str = ""
    LLM_MODEL: str = "gpt-4o-mini"  # Primary model for LiteLLM
    CHAT_MODEL: str = "gpt-4o-mini"  # Chat conversations
    ANALYSIS_MODEL: str = "gpt-4o-mini"  # Website analysis
    FAST_MODEL: str = "gpt-4o-mini"  # Quick responses
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    @property
    def AI_MODEL(self) -> str:
        """Get the AI model for chat (LiteLLM format)."""
        return self.CHAT_MODEL

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
