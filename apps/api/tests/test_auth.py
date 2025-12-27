"""
Authentication API Tests

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

import pytest
from httpx import AsyncClient


class TestUserRegistration:
    """Tests for user registration endpoint."""

    @pytest.mark.asyncio
    async def test_register_success(self, client: AsyncClient, valid_user_data: dict):
        """Should successfully register a new user."""
        response = await client.post("/api/v1/auth/register", json=valid_user_data)

        assert response.status_code == 201
        data = response.json()
        assert "data" in data
        assert "user" in data["data"]
        assert "tokens" in data["data"]
        assert data["data"]["user"]["email"] == valid_user_data["email"]
        assert data["data"]["tokens"]["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_register_duplicate_email(
        self, client: AsyncClient, valid_user_data: dict
    ):
        """Should reject registration with duplicate email."""
        # First registration
        await client.post("/api/v1/auth/register", json=valid_user_data)

        # Second registration with same email
        response = await client.post("/api/v1/auth/register", json=valid_user_data)

        assert response.status_code == 409
        assert "already exists" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, client: AsyncClient):
        """Should reject invalid email format."""
        data = {
            "email": "not-an-email",
            "password": "SecurePassword123!",
        }
        response = await client.post("/api/v1/auth/register", json=data)

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_weak_password_no_special(
        self, client: AsyncClient, invalid_password_data: dict
    ):
        """Should reject password without special character."""
        response = await client.post(
            "/api/v1/auth/register", json=invalid_password_data
        )

        assert response.status_code == 422
        assert "special character" in response.text.lower()

    @pytest.mark.asyncio
    async def test_register_weak_password_no_number(self, client: AsyncClient):
        """Should reject password without number."""
        data = {
            "email": "test@example.com",
            "password": "WeakPassword!",  # No number
        }
        response = await client.post("/api/v1/auth/register", json=data)

        assert response.status_code == 422
        assert "number" in response.text.lower()

    @pytest.mark.asyncio
    async def test_register_short_password(self, client: AsyncClient):
        """Should reject password shorter than 8 characters."""
        data = {
            "email": "test@example.com",
            "password": "Sh0rt!",  # Too short
        }
        response = await client.post("/api/v1/auth/register", json=data)

        assert response.status_code == 422


class TestUserLogin:
    """Tests for user login endpoint."""

    @pytest.mark.asyncio
    async def test_login_success(self, client: AsyncClient, valid_user_data: dict):
        """Should successfully login with valid credentials."""
        # Register first
        await client.post("/api/v1/auth/register", json=valid_user_data)

        # Login
        login_data = {
            "email": valid_user_data["email"],
            "password": valid_user_data["password"],
        }
        response = await client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "tokens" in data["data"]
        assert "access_token" in data["data"]["tokens"]

    @pytest.mark.asyncio
    async def test_login_wrong_password(
        self, client: AsyncClient, valid_user_data: dict
    ):
        """Should reject login with wrong password."""
        # Register first
        await client.post("/api/v1/auth/register", json=valid_user_data)

        # Login with wrong password
        login_data = {
            "email": valid_user_data["email"],
            "password": "WrongPassword123!",
        }
        response = await client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Should reject login for non-existent user."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "SomePassword123!",
        }
        response = await client.post("/api/v1/auth/login", json=login_data)

        assert response.status_code == 401


class TestGetCurrentUser:
    """Tests for /me endpoint."""

    @pytest.mark.asyncio
    async def test_get_me_authenticated(self, authenticated_client: AsyncClient):
        """Should return current user when authenticated."""
        response = await authenticated_client.get("/api/v1/auth/me")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "email" in data["data"]
        assert "id" in data["data"]

    @pytest.mark.asyncio
    async def test_get_me_unauthenticated(self, client: AsyncClient):
        """Should reject unauthenticated request."""
        response = await client.get("/api/v1/auth/me")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_me_invalid_token(self, client: AsyncClient):
        """Should reject request with invalid token."""
        client.headers["Authorization"] = "Bearer invalid_token"
        response = await client.get("/api/v1/auth/me")

        assert response.status_code == 401


class TestTokenRefresh:
    """Tests for token refresh endpoint."""

    @pytest.mark.asyncio
    async def test_refresh_token_success(
        self, client: AsyncClient, valid_user_data: dict
    ):
        """Should successfully refresh tokens."""
        # Register and get refresh token
        register_response = await client.post(
            "/api/v1/auth/register", json=valid_user_data
        )
        refresh_token = register_response.json()["data"]["tokens"]["refresh_token"]

        # Refresh tokens
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data["data"]
        assert "refresh_token" in data["data"]

    @pytest.mark.asyncio
    async def test_refresh_token_invalid(self, client: AsyncClient):
        """Should reject invalid refresh token."""
        response = await client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_refresh_token"},
        )

        assert response.status_code == 401


class TestLogout:
    """Tests for logout endpoint."""

    @pytest.mark.asyncio
    async def test_logout_authenticated(self, authenticated_client: AsyncClient):
        """Should successfully logout when authenticated."""
        response = await authenticated_client.post("/api/v1/auth/logout")

        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_logout_unauthenticated(self, client: AsyncClient):
        """Should reject unauthenticated logout."""
        response = await client.post("/api/v1/auth/logout")

        assert response.status_code == 401


class TestPasswordReset:
    """Tests for password reset endpoints."""

    @pytest.mark.asyncio
    async def test_request_password_reset(
        self, client: AsyncClient, valid_user_data: dict
    ):
        """Should accept password reset request."""
        # Register first
        await client.post("/api/v1/auth/register", json=valid_user_data)

        # Request reset
        response = await client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": valid_user_data["email"]},
        )

        assert response.status_code == 200
        # Should always return success (prevent email enumeration)
        assert "message" in response.json()["data"]

    @pytest.mark.asyncio
    async def test_request_password_reset_nonexistent(self, client: AsyncClient):
        """Should return success even for non-existent email."""
        response = await client.post(
            "/api/v1/auth/password-reset/request",
            json={"email": "nonexistent@example.com"},
        )

        # Should still return 200 to prevent enumeration
        assert response.status_code == 200
