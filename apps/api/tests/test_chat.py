"""
Chat API Tests

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

import pytest
from httpx import AsyncClient
from uuid import uuid4


class TestCreateConversation:
    """Tests for conversation creation."""

    @pytest.mark.asyncio
    async def test_create_conversation_authenticated(
        self, authenticated_client: AsyncClient
    ):
        """Should create conversation when authenticated."""
        response = await authenticated_client.post(
            "/api/v1/chat/conversations",
            json={"title": "Test Conversation"},
        )

        assert response.status_code == 201
        data = response.json()
        assert "data" in data
        assert "id" in data["data"]
        assert data["data"]["title"] == "Test Conversation"

    @pytest.mark.asyncio
    async def test_create_conversation_default_title(
        self, authenticated_client: AsyncClient
    ):
        """Should create conversation with default title."""
        response = await authenticated_client.post(
            "/api/v1/chat/conversations",
            json={},
        )

        assert response.status_code == 201
        data = response.json()
        assert "title" in data["data"]

    @pytest.mark.asyncio
    async def test_create_conversation_unauthenticated(self, client: AsyncClient):
        """Should reject unauthenticated conversation creation."""
        response = await client.post(
            "/api/v1/chat/conversations",
            json={"title": "Test"},
        )

        assert response.status_code == 401


class TestListConversations:
    """Tests for listing conversations."""

    @pytest.mark.asyncio
    async def test_list_conversations_authenticated(
        self, authenticated_client: AsyncClient
    ):
        """Should list conversations when authenticated."""
        response = await authenticated_client.get("/api/v1/chat/conversations")

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)

    @pytest.mark.asyncio
    async def test_list_conversations_unauthenticated(self, client: AsyncClient):
        """Should reject unauthenticated list request."""
        response = await client.get("/api/v1/chat/conversations")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_list_conversations_with_pagination(
        self, authenticated_client: AsyncClient
    ):
        """Should respect pagination parameters."""
        # Create a few conversations
        for i in range(3):
            await authenticated_client.post(
                "/api/v1/chat/conversations",
                json={"title": f"Conversation {i}"},
            )

        # Get with limit
        response = await authenticated_client.get(
            "/api/v1/chat/conversations?limit=2"
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) <= 2


class TestGetConversation:
    """Tests for getting single conversation."""

    @pytest.mark.asyncio
    async def test_get_conversation_success(self, authenticated_client: AsyncClient):
        """Should get conversation by ID."""
        # Create conversation
        create_response = await authenticated_client.post(
            "/api/v1/chat/conversations",
            json={"title": "Test Conversation"},
        )
        conversation_id = create_response.json()["data"]["id"]

        # Get conversation
        response = await authenticated_client.get(
            f"/api/v1/chat/conversations/{conversation_id}"
        )

        assert response.status_code == 200
        data = response.json()
        assert data["data"]["id"] == conversation_id

    @pytest.mark.asyncio
    async def test_get_conversation_not_found(
        self, authenticated_client: AsyncClient
    ):
        """Should return 404 for non-existent conversation."""
        fake_id = str(uuid4())
        response = await authenticated_client.get(
            f"/api/v1/chat/conversations/{fake_id}"
        )

        assert response.status_code == 404


class TestSendMessage:
    """Tests for sending messages."""

    @pytest.mark.asyncio
    async def test_send_message_success(self, authenticated_client: AsyncClient):
        """Should send message to conversation."""
        # Create conversation
        create_response = await authenticated_client.post(
            "/api/v1/chat/conversations",
            json={"title": "Test Conversation"},
        )
        conversation_id = create_response.json()["data"]["id"]

        # Send message
        response = await authenticated_client.post(
            f"/api/v1/chat/conversations/{conversation_id}/messages",
            json={"content": "Hello, AI!"},
        )

        assert response.status_code == 201
        data = response.json()
        assert "data" in data
        # Should return both user message and AI response
        assert "user_message" in data["data"]
        assert "ai_response" in data["data"]

    @pytest.mark.asyncio
    async def test_send_message_empty_content(
        self, authenticated_client: AsyncClient
    ):
        """Should reject empty message content."""
        # Create conversation
        create_response = await authenticated_client.post(
            "/api/v1/chat/conversations",
            json={"title": "Test Conversation"},
        )
        conversation_id = create_response.json()["data"]["id"]

        # Send empty message
        response = await authenticated_client.post(
            f"/api/v1/chat/conversations/{conversation_id}/messages",
            json={"content": ""},
        )

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_send_message_to_nonexistent_conversation(
        self, authenticated_client: AsyncClient
    ):
        """Should return 404 when conversation doesn't exist."""
        fake_id = str(uuid4())
        response = await authenticated_client.post(
            f"/api/v1/chat/conversations/{fake_id}/messages",
            json={"content": "Hello!"},
        )

        assert response.status_code == 404


class TestGetMessages:
    """Tests for getting conversation messages."""

    @pytest.mark.asyncio
    async def test_get_messages_success(self, authenticated_client: AsyncClient):
        """Should get messages from conversation."""
        # Create conversation
        create_response = await authenticated_client.post(
            "/api/v1/chat/conversations",
            json={"title": "Test Conversation"},
        )
        conversation_id = create_response.json()["data"]["id"]

        # Send a message
        await authenticated_client.post(
            f"/api/v1/chat/conversations/{conversation_id}/messages",
            json={"content": "Hello!"},
        )

        # Get messages
        response = await authenticated_client.get(
            f"/api/v1/chat/conversations/{conversation_id}/messages"
        )

        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)
        assert len(data["data"]) >= 1  # At least the user message


class TestRingPhase:
    """Tests for ring phase functionality."""

    @pytest.mark.asyncio
    async def test_conversation_starts_in_core(
        self, authenticated_client: AsyncClient
    ):
        """New conversation should start in CORE ring phase."""
        response = await authenticated_client.post(
            "/api/v1/chat/conversations",
            json={"title": "Test Conversation"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["data"]["ring_phase"] == "core"

    @pytest.mark.asyncio
    async def test_update_ring_phase(self, authenticated_client: AsyncClient):
        """Should be able to update ring phase."""
        # Create conversation
        create_response = await authenticated_client.post(
            "/api/v1/chat/conversations",
            json={"title": "Test Conversation"},
        )
        conversation_id = create_response.json()["data"]["id"]

        # Update ring phase (correct endpoint uses /ring suffix with query param)
        response = await authenticated_client.patch(
            f"/api/v1/chat/conversations/{conversation_id}/ring?ring_phase=discover",
        )

        assert response.status_code == 200
        data = response.json()
        assert data["data"]["ring_phase"] == "discover"


class TestConversationIsolation:
    """Tests for user isolation of conversations."""

    @pytest.mark.asyncio
    async def test_user_cannot_access_other_user_conversation(
        self,
        client: AsyncClient,
        authenticated_client: AsyncClient,
        valid_user_data: dict,
    ):
        """User should not be able to access another user's conversation."""
        # Create conversation with first user
        create_response = await authenticated_client.post(
            "/api/v1/chat/conversations",
            json={"title": "Private Conversation"},
        )
        conversation_id = create_response.json()["data"]["id"]

        # Register second user
        second_user_data = {**valid_user_data, "email": "second@example.com"}
        register_response = await client.post(
            "/api/v1/auth/register", json=second_user_data
        )
        second_token = register_response.json()["data"]["tokens"]["access_token"]

        # Try to access first user's conversation
        client.headers["Authorization"] = f"Bearer {second_token}"
        response = await client.get(
            f"/api/v1/chat/conversations/{conversation_id}"
        )

        assert response.status_code == 404  # Not found for this user
