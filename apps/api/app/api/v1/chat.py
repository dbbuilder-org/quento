"""
Chat API Endpoints with WebSocket Support

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from typing import Optional
from uuid import UUID
import json

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.chat import (
    ConversationCreate,
    ConversationResponse,
    ConversationDetailResponse,
    ConversationListResponse,
    MessageCreate,
    MessageResponse,
    SendMessageResponse,
)
from app.schemas.common import APIResponse, PaginatedResponse, Pagination
from app.services.chat_service import ChatService
from app.core.security import get_current_active_user, decode_token
from app.core.exceptions import NotFoundError, ValidationError
from app.models.user import User
from app.models.conversation import RingPhase

router = APIRouter(prefix="/chat", tags=["Chat"])


# WebSocket connection manager
class ConnectionManager:
    """Manage WebSocket connections for real-time chat."""

    def __init__(self):
        self.active_connections: dict[UUID, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, conversation_id: UUID):
        """Accept and store connection."""
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: UUID):
        """Remove connection."""
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].remove(websocket)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def send_message(self, message: dict, conversation_id: UUID):
        """Send message to all connections in a conversation."""
        if conversation_id in self.active_connections:
            for connection in self.active_connections[conversation_id]:
                await connection.send_json(message)

    async def broadcast_typing(self, conversation_id: UUID, is_typing: bool):
        """Broadcast typing indicator."""
        await self.send_message(
            {"type": "typing", "is_typing": is_typing},
            conversation_id,
        )


manager = ConnectionManager()


@router.post(
    "/conversations",
    response_model=APIResponse[ConversationResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create conversation",
    description="Start a new chat conversation.",
)
async def create_conversation(
    data: Optional[ConversationCreate] = None,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new conversation."""
    service = ChatService(db)
    conversation = await service.create_conversation(current_user.id, data)

    return APIResponse(
        data=ConversationResponse(
            id=conversation.id,
            title=conversation.title,
            ring_phase=conversation.ring_phase,
            status=conversation.status,
            message_count=1,  # Welcome message
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )
    )


@router.get(
    "/conversations",
    response_model=PaginatedResponse[ConversationResponse],
    summary="List conversations",
    description="Get list of user's conversations.",
)
async def list_conversations(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's conversations."""
    service = ChatService(db)
    conversations = await service.list_conversations(
        current_user.id, limit=limit, offset=offset
    )

    return PaginatedResponse(
        data=[
            ConversationResponse(
                id=c.id,
                title=c.title,
                ring_phase=c.ring_phase,
                status=c.status,
                message_count=len(c.messages) if hasattr(c, "messages") else 0,
                created_at=c.created_at,
                updated_at=c.updated_at,
            )
            for c in conversations
        ],
        pagination=Pagination(
            total=len(conversations),
            limit=limit,
            offset=offset,
            has_more=len(conversations) == limit,
        ),
    )


@router.get(
    "/conversations/{conversation_id}",
    response_model=APIResponse[ConversationDetailResponse],
    summary="Get conversation",
    description="Get conversation details with messages.",
)
async def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get conversation with messages."""
    service = ChatService(db)
    try:
        detail = await service.get_conversation_with_messages(
            conversation_id, current_user.id
        )
        return APIResponse(data=detail)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=APIResponse[SendMessageResponse],
    summary="Send message",
    description="Send a message and get AI response.",
)
async def send_message(
    conversation_id: UUID,
    message: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Send message and get AI response."""
    service = ChatService(db)
    try:
        response = await service.send_message(
            conversation_id, current_user.id, message
        )

        # Broadcast to WebSocket connections
        await manager.send_message(
            {
                "type": "message",
                "user_message": response.user_message.model_dump(mode="json"),
                "assistant_message": response.assistant_message.model_dump(mode="json"),
            },
            conversation_id,
        )

        return APIResponse(data=response)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.patch(
    "/conversations/{conversation_id}/ring",
    response_model=APIResponse[ConversationResponse],
    summary="Update ring phase",
    description="Manually update conversation ring phase.",
)
async def update_ring_phase(
    conversation_id: UUID,
    ring_phase: RingPhase,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update conversation ring phase."""
    service = ChatService(db)
    try:
        conversation = await service.update_ring_phase(
            conversation_id, current_user.id, ring_phase
        )
        return APIResponse(
            data=ConversationResponse(
                id=conversation.id,
                title=conversation.title,
                ring_phase=conversation.ring_phase,
                status=conversation.status,
                message_count=len(conversation.messages),
                created_at=conversation.created_at,
                updated_at=conversation.updated_at,
            )
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.delete(
    "/conversations/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete conversation",
    description="Delete a conversation and all its messages.",
)
async def delete_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a conversation."""
    service = ChatService(db)
    try:
        await service.delete_conversation(conversation_id, current_user.id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.websocket("/ws/{conversation_id}")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: UUID,
    token: str = Query(...),
):
    """
    WebSocket endpoint for real-time chat.

    Connect with: ws://host/api/v1/chat/ws/{conversation_id}?token={jwt_token}

    Message format:
    - Send: {"type": "message", "content": "your message"}
    - Receive: {"type": "message", "user_message": {...}, "assistant_message": {...}}
    - Typing: {"type": "typing", "is_typing": true/false}
    """
    # Verify token
    try:
        payload = decode_token(token)
        user_id = UUID(payload.get("sub"))
    except Exception:
        await websocket.close(code=4001, reason="Invalid token")
        return

    # Get database session
    async for db in get_db():
        service = ChatService(db)

        # Verify conversation access
        try:
            await service.get_conversation(conversation_id, user_id)
        except NotFoundError:
            await websocket.close(code=4004, reason="Conversation not found")
            return

        await manager.connect(websocket, conversation_id)

        try:
            while True:
                data = await websocket.receive_json()
                msg_type = data.get("type")

                if msg_type == "message":
                    content = data.get("content", "")
                    if content:
                        # Broadcast typing indicator
                        await manager.broadcast_typing(conversation_id, True)

                        # Process message
                        message_data = MessageCreate(content=content)
                        response = await service.send_message(
                            conversation_id, user_id, message_data
                        )

                        # Stop typing indicator
                        await manager.broadcast_typing(conversation_id, False)

                        # Send response
                        await manager.send_message(
                            {
                                "type": "message",
                                "user_message": response.user_message.model_dump(mode="json"),
                                "assistant_message": response.assistant_message.model_dump(mode="json"),
                                "session_update": response.session_update,
                            },
                            conversation_id,
                        )

                elif msg_type == "typing":
                    is_typing = data.get("is_typing", False)
                    await manager.broadcast_typing(conversation_id, is_typing)

        except WebSocketDisconnect:
            manager.disconnect(websocket, conversation_id)
        except Exception as e:
            manager.disconnect(websocket, conversation_id)
            await websocket.close(code=4000, reason=str(e))
