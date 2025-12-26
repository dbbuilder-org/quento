"""
Security utilities - JWT, password hashing, Clerk authentication

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime, timedelta
from typing import Optional, Any
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import jwt as pyjwt
from jwt import PyJWKClient

from app.config import settings
from app.db.database import get_db
from app.models.user import User

# Password hashing context - using argon2 (no 72-byte limit like bcrypt)
pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")

# Bearer token scheme
bearer_scheme = HTTPBearer(auto_error=False)

# Clerk JWKS client (cached)
_jwks_client: Optional[PyJWKClient] = None


def get_clerk_jwks_client() -> PyJWKClient:
    """Get or create the Clerk JWKS client."""
    global _jwks_client
    if _jwks_client is None:
        # Extract domain from publishable key
        # pk_test_c3Ryb25nLXBvbGxpd29nLTc2LmNsZXJrLmFjY291bnRzLmRldiQ
        # Decodes to: strong-polliwog-76.clerk.accounts.dev
        import base64
        pk = settings.CLERK_PUBLISHABLE_KEY
        if pk.startswith("pk_test_") or pk.startswith("pk_live_"):
            encoded = pk.split("_")[2]
            # Add padding if needed
            padding = 4 - len(encoded) % 4
            if padding != 4:
                encoded += "=" * padding
            try:
                domain = base64.b64decode(encoded).decode("utf-8").rstrip("$")
                jwks_url = f"https://{domain}/.well-known/jwks.json"
            except Exception:
                # Fallback to hardcoded domain
                jwks_url = "https://strong-polliwog-76.clerk.accounts.dev/.well-known/jwks.json"
        else:
            jwks_url = "https://strong-polliwog-76.clerk.accounts.dev/.well-known/jwks.json"

        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash."""
    return pwd_context.hash(password)


def create_access_token(
    subject: str | UUID,
    expires_delta: Optional[timedelta] = None,
    extra_claims: Optional[dict] = None,
) -> str:
    """Create a JWT access token."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "type": "access",
        "iat": datetime.utcnow(),
    }

    if extra_claims:
        to_encode.update(extra_claims)

    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(
    subject: str | UUID,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT refresh token."""
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": str(subject),
        "exp": expire,
        "type": "refresh",
        "iat": datetime.utcnow(),
    }

    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_clerk_token(token: str) -> dict[str, Any]:
    """Decode and validate a Clerk JWT token using JWKS."""
    try:
        jwks_client = get_clerk_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk doesn't always set audience
        )
        return payload
    except pyjwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except pyjwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token (legacy internal tokens)."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_or_create_clerk_user(
    clerk_user_id: str,
    email: Optional[str],
    full_name: Optional[str],
    db: AsyncSession,
) -> User:
    """Get or create a user from Clerk user ID."""
    # First try to find by clerk_id
    result = await db.execute(
        select(User).where(User.clerk_id == clerk_user_id)
    )
    user = result.scalar_one_or_none()

    if user:
        return user

    # Try to find by email (for migration from old auth)
    if email:
        result = await db.execute(
            select(User).where(User.email == email)
        )
        user = result.scalar_one_or_none()
        if user:
            # Link existing user to Clerk
            user.clerk_id = clerk_user_id
            await db.commit()
            await db.refresh(user)
            return user

    # Create new user
    user = User(
        email=email or f"{clerk_user_id}@clerk.user",
        clerk_id=clerk_user_id,
        full_name=full_name,
        hashed_password="",  # No password for Clerk users
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get the current authenticated user from the JWT token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    # Try Clerk token first (RS256)
    try:
        payload = decode_clerk_token(token)
        clerk_user_id = payload.get("sub")
        email = payload.get("email")

        # Extract name from Clerk claims
        full_name = None
        if "first_name" in payload or "last_name" in payload:
            first = payload.get("first_name", "")
            last = payload.get("last_name", "")
            full_name = f"{first} {last}".strip() or None

        user = await get_or_create_clerk_user(clerk_user_id, email, full_name, db)
        return user
    except HTTPException:
        pass  # Not a valid Clerk token, try legacy
    except Exception:
        pass  # Not a Clerk token, try legacy

    # Fallback to legacy internal tokens (HS256)
    try:
        payload = decode_token(token)

        # Check token type
        if payload.get("type") != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user from database
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get the current user if authenticated, otherwise return None."""
    if not credentials:
        return None

    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None


async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Get the current active user. Raises if user is inactive."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user
