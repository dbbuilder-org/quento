"""
Chat Schemas

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.conversation import RingPhase, ConversationStatus, MessageRole


class MessageCreate(BaseModel):
    """Create message request."""

    content: str = Field(..., min_length=1, max_length=10000)
    attachments: Optional[list[str]] = None


class MessageResponse(BaseModel):
    """Message response."""

    id: UUID
    role: MessageRole
    content: str
    created_at: datetime
    metadata: Optional[dict[str, Any]] = None

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    """Create conversation request."""

    initial_context: Optional[dict[str, Any]] = None


class ConversationResponse(BaseModel):
    """Conversation response."""

    id: UUID
    title: Optional[str]
    ring_phase: RingPhase
    status: ConversationStatus
    message_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetailResponse(BaseModel):
    """Detailed conversation response with messages."""

    id: UUID
    title: Optional[str]
    ring_phase: RingPhase
    status: ConversationStatus
    business_context: Optional[dict[str, Any]] = None
    messages: list[MessageResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    """List of conversations."""

    conversations: list[ConversationResponse]


class ChatResponse(BaseModel):
    """Chat message response with AI reply."""

    user_message: MessageResponse
    assistant_message: MessageResponse
    session_update: dict[str, Any]


class SendMessageResponse(BaseModel):
    """Response after sending a message."""

    user_message: MessageResponse
    assistant_message: MessageResponse
    session_update: dict[str, Any] = Field(
        default_factory=lambda: {"ring_phase": "core", "should_advance": False}
    )
