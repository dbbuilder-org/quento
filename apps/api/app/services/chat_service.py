"""
Chat Service

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime
from typing import Optional, AsyncGenerator
from uuid import UUID
import json

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.conversation import Conversation, Message, RingPhase, ConversationStatus, MessageRole
from app.models.user import User
from app.schemas.chat import (
    ConversationCreate,
    ConversationResponse,
    ConversationDetailResponse,
    MessageCreate,
    MessageResponse,
    SendMessageResponse,
)
from app.core.exceptions import NotFoundError, ValidationError
from app.services.ai_service import AIService, analyze_for_phase_advancement


class ChatService:
    """Chat service for conversation management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_conversation(
        self, user_id: UUID, data: Optional[ConversationCreate] = None
    ) -> Conversation:
        """Create a new conversation."""
        # Use provided title or default
        title = "New Conversation"
        if data and data.title:
            title = data.title

        conversation = Conversation(
            user_id=user_id,
            title=title,
            ring_phase=RingPhase.CORE,
            status=ConversationStatus.ACTIVE,
            business_context=data.initial_context if data else None,
        )

        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)

        # Add welcome message - reference analysis if available
        if data and data.initial_context:
            welcome_content = (
                "I've reviewed your website analysis and I'm ready to dive deeper. "
                "Based on what I found, I have some questions to better understand your business "
                "and how we can improve your online presence. Let's start: "
                "What's the primary goal you want to achieve with your website?"
            )
        else:
            welcome_content = (
                "Welcome to Quento! I'm here to help you grow your business. "
                "To get started, I'd recommend analyzing your website first using the Discover tab - "
                "this gives me valuable context about your online presence. "
                "Or, tell me about your business and what you're hoping to achieve."
            )

        welcome_message = Message(
            conversation_id=conversation.id,
            role=MessageRole.ASSISTANT,
            content=welcome_content,
        )
        self.db.add(welcome_message)
        await self.db.commit()

        return conversation

    async def get_conversation(
        self, conversation_id: UUID, user_id: UUID
    ) -> Conversation:
        """Get conversation by ID."""
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        )
        conversation = result.scalar_one_or_none()

        if not conversation:
            raise NotFoundError(f"Conversation {conversation_id} not found")

        return conversation

    async def list_conversations(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[Conversation]:
        """List user's conversations."""
        result = await self.db.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def get_conversation_with_messages(
        self, conversation_id: UUID, user_id: UUID
    ) -> ConversationDetailResponse:
        """Get conversation with all messages."""
        conversation = await self.get_conversation(conversation_id, user_id)

        # Get message count
        count_result = await self.db.execute(
            select(func.count(Message.id)).where(
                Message.conversation_id == conversation_id
            )
        )
        message_count = count_result.scalar() or 0

        return ConversationDetailResponse(
            id=conversation.id,
            title=conversation.title,
            ring_phase=conversation.ring_phase,
            status=conversation.status,
            business_context=conversation.business_context,
            messages=[
                MessageResponse.model_validate(m)
                for m in sorted(conversation.messages, key=lambda m: m.created_at)
            ],
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )

    async def add_message(
        self,
        conversation_id: UUID,
        user_id: UUID,
        content: str,
        role: MessageRole = MessageRole.USER,
        metadata: Optional[dict] = None,
    ) -> Message:
        """Add a message to a conversation."""
        # Verify conversation exists and belongs to user
        conversation = await self.get_conversation(conversation_id, user_id)

        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            metadata=metadata,
        )

        self.db.add(message)
        conversation.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(message)

        return message

    async def send_message(
        self,
        conversation_id: UUID,
        user_id: UUID,
        message_data: MessageCreate,
    ) -> SendMessageResponse:
        """
        Send a user message and get AI response.
        Uses AIService for intelligent, context-aware responses with:
        - Pre-processing for intent/sentiment detection
        - Phase-optimized RAG context
        - Post-processing for quality assurance
        - AI-driven ring phase advancement
        """
        # Add user message
        user_message = await self.add_message(
            conversation_id=conversation_id,
            user_id=user_id,
            content=message_data.content,
            role=MessageRole.USER,
            metadata={"attachments": message_data.attachments} if message_data.attachments else None,
        )

        # Get conversation for context
        conversation = await self.get_conversation(conversation_id, user_id)

        # Generate AI response using enhanced AIService
        ai_service = AIService(self.db)
        ai_response_content = await ai_service.generate_response(
            conversation=conversation,
            user_message=message_data.content,
            user_id=user_id,
        )

        # Add AI message
        assistant_message = await self.add_message(
            conversation_id=conversation_id,
            user_id=user_id,
            content=ai_response_content,
            role=MessageRole.ASSISTANT,
        )

        # Analyze for AI-driven ring phase advancement
        advancement_analysis = await analyze_for_phase_advancement(
            conversation=conversation,
            latest_exchange=(message_data.content, ai_response_content),
            analysis_context=None,  # Will be fetched from DB if needed
        )

        should_advance = advancement_analysis.get("should_advance", False)
        advancement_confidence = advancement_analysis.get("confidence", 0)

        return SendMessageResponse(
            user_message=MessageResponse.model_validate(user_message),
            assistant_message=MessageResponse.model_validate(assistant_message),
            session_update={
                "ring_phase": conversation.ring_phase.value,
                "should_advance": should_advance,
                "advancement_confidence": advancement_confidence,
                "advancement_reason": advancement_analysis.get("reason", ""),
            },
        )

    async def _generate_placeholder_response(
        self, user_message: str, conversation: Conversation
    ) -> str:
        """
        Generate a placeholder response.
        This will be replaced by LangChain/LiteLLM integration.
        """
        ring_responses = {
            RingPhase.CORE: (
                "I'm analyzing what you've shared about your business. "
                "This helps me understand your core identity and values. "
                "Could you tell me more about your target audience?"
            ),
            RingPhase.DISCOVER: (
                "Great! Now I'm discovering more about your market position. "
                "I'll analyze your competitors and identify opportunities. "
                "What are your main business goals for the next year?"
            ),
            RingPhase.PLAN: (
                "Based on our discussion, I'm putting together a strategic plan. "
                "This will include actionable recommendations tailored to your business. "
                "Would you like to focus on any particular area?"
            ),
            RingPhase.EXECUTE: (
                "Here are the action items I've identified for you. "
                "Each one is designed to move you closer to your goals. "
                "Let's prioritize which ones to tackle first."
            ),
            RingPhase.OPTIMIZE: (
                "Now we're in the optimization phase. "
                "I'll help you track progress and refine your strategy. "
                "What metrics are most important to you?"
            ),
        }

        return ring_responses.get(
            conversation.ring_phase,
            "Thank you for your message. How can I help you further?"
        )

    def _should_advance_ring(self, conversation: Conversation, message: str) -> bool:
        """Determine if conversation should advance to next ring."""
        # Placeholder logic - will be enhanced with AI analysis
        message_count = len(conversation.messages)

        ring_thresholds = {
            RingPhase.CORE: 5,
            RingPhase.DISCOVER: 8,
            RingPhase.PLAN: 10,
            RingPhase.EXECUTE: 12,
            RingPhase.OPTIMIZE: float("inf"),
        }

        threshold = ring_thresholds.get(conversation.ring_phase, 5)
        return message_count >= threshold

    async def update_ring_phase(
        self, conversation_id: UUID, user_id: UUID, new_phase: RingPhase
    ) -> Conversation:
        """Update conversation ring phase."""
        conversation = await self.get_conversation(conversation_id, user_id)
        conversation.ring_phase = new_phase
        conversation.updated_at = datetime.utcnow()
        await self.db.commit()
        await self.db.refresh(conversation)
        return conversation

    async def delete_conversation(self, conversation_id: UUID, user_id: UUID) -> bool:
        """Delete a conversation."""
        conversation = await self.get_conversation(conversation_id, user_id)
        await self.db.delete(conversation)
        await self.db.commit()
        return True


async def get_chat_service(db: AsyncSession) -> ChatService:
    """Dependency to get chat service."""
    return ChatService(db)
