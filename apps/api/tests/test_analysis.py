"""
Analysis API Tests

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

import pytest
from httpx import AsyncClient
from uuid import uuid4


class TestCreateAnalysis:
    """Tests for analysis creation endpoint."""

    @pytest.mark.asyncio
    async def test_create_analysis_authenticated(
        self, authenticated_client: AsyncClient, valid_analysis_data: dict
    ):
        """Should create analysis when authenticated."""
        response = await authenticated_client.post(
            "/api/v1/analysis", json=valid_analysis_data
        )

        # Debug: print response details if not successful
        if response.status_code != 201:
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
            print(f"Request headers: {authenticated_client.headers}")

        assert response.status_code == 201
        data = response.json()
        assert "data" in data
        assert "id" in data["data"]
        assert data["data"]["website_url"] == valid_analysis_data["website_url"]
        assert "status" in data["data"]

    @pytest.mark.asyncio
    async def test_create_analysis_unauthenticated(
        self, client: AsyncClient, valid_analysis_data: dict
    ):
        """Should reject unauthenticated analysis creation."""
        response = await client.post("/api/v1/analysis", json=valid_analysis_data)

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_create_analysis_invalid_url(
        self, authenticated_client: AsyncClient
    ):
        """Should reject invalid URL."""
        data = {"website_url": "not-a-valid-url"}
        response = await authenticated_client.post("/api/v1/analysis", json=data)

        assert response.status_code in [400, 422]

    @pytest.mark.asyncio
    async def test_create_analysis_empty_url(self, authenticated_client: AsyncClient):
        """Should reject empty URL."""
        data = {"website_url": ""}
        response = await authenticated_client.post("/api/v1/analysis", json=data)

        assert response.status_code == 422


class TestListAnalyses:
    """Tests for analysis list endpoint."""

    @pytest.mark.asyncio
    async def test_list_analyses_authenticated(
        self, authenticated_client: AsyncClient
    ):
        """Should list analyses when authenticated."""
        response = await authenticated_client.get("/api/v1/analysis")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "pagination" in data
        assert isinstance(data["data"], list)

    @pytest.mark.asyncio
    async def test_list_analyses_unauthenticated(self, client: AsyncClient):
        """Should reject unauthenticated list request."""
        response = await client.get("/api/v1/analysis")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_list_analyses_with_pagination(
        self, authenticated_client: AsyncClient, valid_analysis_data: dict
    ):
        """Should respect pagination parameters."""
        # Create a few analyses
        for _ in range(3):
            await authenticated_client.post("/api/v1/analysis", json=valid_analysis_data)

        # Get with limit
        response = await authenticated_client.get("/api/v1/analysis?limit=2&offset=0")

        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) <= 2
        assert data["pagination"]["limit"] == 2

    @pytest.mark.asyncio
    async def test_list_analyses_limit_validation(
        self, authenticated_client: AsyncClient
    ):
        """Should validate limit parameter bounds."""
        # Limit too high
        response = await authenticated_client.get("/api/v1/analysis?limit=200")
        assert response.status_code == 422

        # Limit too low
        response = await authenticated_client.get("/api/v1/analysis?limit=0")
        assert response.status_code == 422


class TestGetAnalysis:
    """Tests for getting single analysis."""

    @pytest.mark.asyncio
    async def test_get_analysis_success(
        self, authenticated_client: AsyncClient, valid_analysis_data: dict
    ):
        """Should get analysis by ID."""
        # Create analysis
        create_response = await authenticated_client.post(
            "/api/v1/analysis", json=valid_analysis_data
        )
        analysis_id = create_response.json()["data"]["id"]

        # Get analysis
        response = await authenticated_client.get(f"/api/v1/analysis/{analysis_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["data"]["id"] == analysis_id

    @pytest.mark.asyncio
    async def test_get_analysis_not_found(self, authenticated_client: AsyncClient):
        """Should return 404 for non-existent analysis."""
        fake_id = str(uuid4())
        response = await authenticated_client.get(f"/api/v1/analysis/{fake_id}")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_analysis_unauthenticated(
        self, client: AsyncClient, authenticated_client: AsyncClient, valid_analysis_data: dict
    ):
        """Should reject unauthenticated get request."""
        # Create analysis with authenticated client
        create_response = await authenticated_client.post(
            "/api/v1/analysis", json=valid_analysis_data
        )
        analysis_id = create_response.json()["data"]["id"]

        # Try to get with unauthenticated client
        response = await client.get(f"/api/v1/analysis/{analysis_id}")

        assert response.status_code == 401


class TestGetAnalysisStatus:
    """Tests for analysis status endpoint."""

    @pytest.mark.asyncio
    async def test_get_status_success(
        self, authenticated_client: AsyncClient, valid_analysis_data: dict
    ):
        """Should get analysis status."""
        # Create analysis
        create_response = await authenticated_client.post(
            "/api/v1/analysis", json=valid_analysis_data
        )
        analysis_id = create_response.json()["data"]["id"]

        # Get status
        response = await authenticated_client.get(
            f"/api/v1/analysis/{analysis_id}/status"
        )

        assert response.status_code == 200
        data = response.json()
        assert "status" in data["data"]
        assert "progress" in data["data"]

    @pytest.mark.asyncio
    async def test_get_status_not_found(self, authenticated_client: AsyncClient):
        """Should return 404 for non-existent analysis."""
        fake_id = str(uuid4())
        response = await authenticated_client.get(
            f"/api/v1/analysis/{fake_id}/status"
        )

        assert response.status_code == 404


class TestAnalysisIsolation:
    """Tests for user isolation of analyses."""

    @pytest.mark.asyncio
    async def test_user_cannot_access_other_user_analysis(
        self,
        client: AsyncClient,
        authenticated_client: AsyncClient,
        valid_analysis_data: dict,
        valid_user_data: dict,
    ):
        """User should not be able to access another user's analysis."""
        # Create analysis with first user
        create_response = await authenticated_client.post(
            "/api/v1/analysis", json=valid_analysis_data
        )
        analysis_id = create_response.json()["data"]["id"]

        # Register second user
        second_user_data = {**valid_user_data, "email": "second@example.com"}
        register_response = await client.post(
            "/api/v1/auth/register", json=second_user_data
        )
        second_token = register_response.json()["data"]["tokens"]["access_token"]

        # Try to access first user's analysis
        client.headers["Authorization"] = f"Bearer {second_token}"
        response = await client.get(f"/api/v1/analysis/{analysis_id}")

        assert response.status_code == 404  # Not found for this user
