"""
Authentication Service

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime, timedelta
from typing import Optional
from uuid import UUID
import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, TokenResponse, AuthResponse, UserResponse
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import (
    AuthenticationError,
    UserAlreadyExistsError,
    InvalidTokenError,
)
from app.config import settings


class AuthService:
    """Authentication service for user management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        result = await self.db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

    async def create_user(self, user_data: UserCreate) -> User:
        """Create a new user."""
        # Check if user already exists
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise UserAlreadyExistsError(f"User with email {user_data.email} already exists")

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            full_name=user_data.full_name,
            company_name=user_data.company_name,
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def authenticate_user(self, credentials: UserLogin) -> User:
        """Authenticate user with email and password."""
        user = await self.get_user_by_email(credentials.email)

        if not user:
            raise AuthenticationError("Invalid email or password")

        if not verify_password(credentials.password, user.hashed_password):
            raise AuthenticationError("Invalid email or password")

        if not user.is_active:
            raise AuthenticationError("User account is deactivated")

        # Update last login
        user.last_login = datetime.utcnow()
        await self.db.commit()

        return user

    def create_tokens(self, user: User) -> TokenResponse:
        """Create access and refresh tokens for user."""
        access_token = create_access_token(
            subject=user.id,
            extra_claims={"email": user.email}
        )
        refresh_token = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def register(self, user_data: UserCreate) -> AuthResponse:
        """Register a new user and return auth response."""
        user = await self.create_user(user_data)
        tokens = self.create_tokens(user)

        return AuthResponse(
            user=UserResponse.model_validate(user),
            tokens=tokens,
        )

    async def login(self, credentials: UserLogin) -> AuthResponse:
        """Login user and return auth response."""
        user = await self.authenticate_user(credentials)
        tokens = self.create_tokens(user)

        return AuthResponse(
            user=UserResponse.model_validate(user),
            tokens=tokens,
        )

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        """Refresh access token using refresh token."""
        payload = decode_token(refresh_token)

        if payload.get("type") != "refresh":
            raise InvalidTokenError("Invalid token type")

        user_id = payload.get("sub")
        if not user_id:
            raise InvalidTokenError("Invalid token payload")

        user = await self.get_user_by_id(UUID(user_id))
        if not user:
            raise InvalidTokenError("User not found")

        if not user.is_active:
            raise AuthenticationError("User account is deactivated")

        return self.create_tokens(user)

    async def request_password_reset(self, email: str) -> Optional[str]:
        """
        Request password reset for email.
        Returns reset token if user exists, None otherwise.
        In production, this would send an email.
        """
        user = await self.get_user_by_email(email)
        if not user:
            # Don't reveal if user exists
            return None

        # Generate reset token
        reset_token = secrets.token_urlsafe(32)

        # Store token hash (in production, store in Redis with TTL)
        user.password_reset_token = get_password_hash(reset_token)
        user.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
        await self.db.commit()

        return reset_token

    async def reset_password(self, token: str, new_password: str) -> bool:
        """Reset password using reset token."""
        # Find user with valid reset token
        result = await self.db.execute(
            select(User).where(
                User.password_reset_token.isnot(None),
                User.password_reset_expires > datetime.utcnow(),
            )
        )
        users = result.scalars().all()

        # Verify token against stored hashes
        valid_user = None
        for user in users:
            if verify_password(token, user.password_reset_token):
                valid_user = user
                break

        if not valid_user:
            raise InvalidTokenError("Invalid or expired reset token")

        # Update password
        valid_user.hashed_password = get_password_hash(new_password)
        valid_user.password_reset_token = None
        valid_user.password_reset_expires = None
        await self.db.commit()

        return True


async def get_auth_service(db: AsyncSession) -> AuthService:
    """Dependency to get auth service."""
    return AuthService(db)
