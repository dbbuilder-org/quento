"""
Authentication API Endpoints

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.auth import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    AuthResponse,
    RefreshTokenRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
)
from app.schemas.common import APIResponse
from app.services.auth_service import AuthService, get_auth_service
from app.core.security import get_current_user, get_current_active_user
from app.core.exceptions import (
    AuthenticationError,
    UserAlreadyExistsError,
    InvalidTokenError,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=APIResponse[AuthResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
    description="Create a new user account and return authentication tokens.",
)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user."""
    service = AuthService(db)
    try:
        auth_response = await service.register(user_data)
        return APIResponse(data=auth_response)
    except UserAlreadyExistsError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )


@router.post(
    "/login",
    response_model=APIResponse[AuthResponse],
    summary="Login user",
    description="Authenticate user with email and password.",
)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db),
):
    """Login user and return tokens."""
    service = AuthService(db)
    try:
        auth_response = await service.login(credentials)
        return APIResponse(data=auth_response)
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post(
    "/refresh",
    response_model=APIResponse[TokenResponse],
    summary="Refresh tokens",
    description="Get new access token using refresh token.",
)
async def refresh_tokens(
    request: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token."""
    service = AuthService(db)
    try:
        tokens = await service.refresh_tokens(request.refresh_token)
        return APIResponse(data=tokens)
    except (InvalidTokenError, AuthenticationError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post(
    "/logout",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Logout user",
    description="Logout current user (client should discard tokens).",
)
async def logout(
    current_user: User = Depends(get_current_active_user),
):
    """
    Logout user.

    Note: JWT tokens are stateless, so the actual invalidation
    should happen client-side by discarding the tokens.
    In production, you might want to add tokens to a blacklist in Redis.
    """
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get(
    "/me",
    response_model=APIResponse[UserResponse],
    summary="Get current user",
    description="Get the currently authenticated user's profile.",
)
async def get_me(
    current_user: User = Depends(get_current_active_user),
):
    """Get current user profile."""
    return APIResponse(data=UserResponse.model_validate(current_user))


@router.post(
    "/password-reset/request",
    response_model=APIResponse[dict],
    summary="Request password reset",
    description="Request a password reset email.",
)
async def request_password_reset(
    request: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    """Request password reset."""
    service = AuthService(db)

    # Generate reset token (in production, this would send an email)
    token = await service.request_password_reset(request.email)

    # Always return success to prevent email enumeration
    return APIResponse(
        data={
            "message": "If an account with that email exists, a password reset link has been sent."
        }
    )


@router.post(
    "/password-reset/confirm",
    response_model=APIResponse[dict],
    summary="Confirm password reset",
    description="Reset password using reset token.",
)
async def confirm_password_reset(
    request: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db),
):
    """Reset password with token."""
    service = AuthService(db)
    try:
        await service.reset_password(request.token, request.password)
        return APIResponse(data={"message": "Password has been reset successfully."})
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
