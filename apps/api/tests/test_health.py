"""
Health Check and Root Endpoint Tests

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

import pytest
from httpx import AsyncClient


class TestRootEndpoint:
    """Tests for root endpoint."""

    @pytest.mark.asyncio
    async def test_root_returns_ok(self, client: AsyncClient):
        """Root endpoint should return API info."""
        response = await client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Quento API"
        assert data["status"] == "healthy"
        assert "version" in data

    @pytest.mark.asyncio
    async def test_root_contains_credits(self, client: AsyncClient):
        """Root endpoint should contain ServiceVision credits."""
        response = await client.get("/")

        data = response.json()
        assert "ServiceVision" in data.get("credits", "")


class TestHealthCheck:
    """Tests for health check endpoint."""

    @pytest.mark.asyncio
    async def test_health_check(self, client: AsyncClient):
        """Health check should return healthy status."""
        response = await client.get("/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    @pytest.mark.asyncio
    async def test_api_v1_health(self, client: AsyncClient):
        """API v1 health endpoint should return healthy status."""
        response = await client.get("/api/v1/health")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["version"] == "v1"


class TestAPIRoot:
    """Tests for API v1 root endpoint."""

    @pytest.mark.asyncio
    async def test_api_root_lists_endpoints(self, client: AsyncClient):
        """API root should list available endpoints."""
        response = await client.get("/api/v1/")

        assert response.status_code == 200
        data = response.json()
        assert "endpoints" in data
        assert "auth" in data["endpoints"]
        assert "chat" in data["endpoints"]
        assert "analysis" in data["endpoints"]
        assert "strategy" in data["endpoints"]
