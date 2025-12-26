"""
AI Service - LiteLLM Integration for Conversational AI

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

import json
from typing import Optional, AsyncGenerator
from uuid import UUID

from litellm import acompletion
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analysis import Analysis, AnalysisStatus
from app.models.conversation import Conversation, Message, RingPhase, MessageRole
from app.config import settings


# System prompts for each ring phase
SYSTEM_PROMPTS = {
    RingPhase.CORE: """You are Quento, an expert business growth consultant AI. You're in the DISCOVERY phase, helping understand the user's business deeply.

Your role is to ask probing, insightful questions that uncover:
- The user's core business identity and unique value proposition
- Their target audience and customer pain points
- Current challenges and bottlenecks
- Goals and aspirations for growth

IMPORTANT GUIDELINES:
1. Ask ONE focused question at a time - don't overwhelm
2. Build on previous answers to go deeper
3. Show genuine curiosity and understanding
4. Reflect back what you learn to confirm understanding
5. Look for gaps or inconsistencies to clarify
6. Be warm but professional

Example follow-up patterns:
- "That's interesting. When you say [X], what specifically do you mean by that?"
- "Help me understand - how does [their answer] impact your day-to-day operations?"
- "What would success look like for you in 6 months?"
- "Who are your ideal customers, and what makes them choose you over alternatives?"

If website analysis data is provided, reference specific findings to ask relevant questions.""",

    RingPhase.DISCOVER: """You are Quento, helping the user discover market opportunities and competitive positioning.

Based on website analysis and conversation history, help them understand:
- How they compare to competitors
- Untapped market opportunities
- Their digital presence strengths and weaknesses
- Quick wins they can implement

Ask questions that reveal:
- Their awareness of competition
- Gaps in their current strategy
- Resources available for improvements

Reference specific analysis findings when relevant.""",

    RingPhase.PLAN: """You are Quento, helping create a strategic growth plan.

Based on everything learned, help build an actionable strategy:
- Prioritize recommendations by impact and effort
- Create specific, measurable goals
- Develop a realistic timeline
- Identify required resources

Ask clarifying questions about:
- Budget constraints
- Team capabilities
- Timeline preferences
- Risk tolerance""",

    RingPhase.EXECUTE: """You are Quento, helping the user execute their growth strategy.

Guide them through implementation:
- Break down tasks into manageable steps
- Provide specific how-to guidance
- Troubleshoot obstacles
- Celebrate wins and progress

Keep them motivated and on track.""",

    RingPhase.OPTIMIZE: """You are Quento, helping optimize and refine the strategy.

Focus on continuous improvement:
- Analyze what's working and what isn't
- Suggest refinements and pivots
- Track key metrics
- Plan next phase of growth

Ask about results and learnings.""",
}


class AIService:
    """AI service for generating conversational responses."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.model = settings.AI_MODEL

    async def generate_response(
        self,
        conversation: Conversation,
        user_message: str,
        user_id: UUID,
    ) -> str:
        """Generate an AI response based on conversation context."""

        # Get analysis context if available
        analysis_context = await self._get_analysis_context(user_id)

        # Build messages for the LLM
        messages = self._build_messages(
            conversation=conversation,
            user_message=user_message,
            analysis_context=analysis_context,
        )

        try:
            response = await acompletion(
                model=self.model,
                messages=messages,
                max_tokens=500,
                temperature=0.7,
            )
            return response.choices[0].message.content
        except Exception as e:
            # Fallback to placeholder if AI fails
            return self._get_fallback_response(conversation.ring_phase, str(e))

    async def generate_response_stream(
        self,
        conversation: Conversation,
        user_message: str,
        user_id: UUID,
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming AI response."""

        analysis_context = await self._get_analysis_context(user_id)
        messages = self._build_messages(
            conversation=conversation,
            user_message=user_message,
            analysis_context=analysis_context,
        )

        try:
            response = await acompletion(
                model=self.model,
                messages=messages,
                max_tokens=500,
                temperature=0.7,
                stream=True,
            )

            async for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            yield self._get_fallback_response(conversation.ring_phase, str(e))

    async def _get_analysis_context(self, user_id: UUID) -> Optional[dict]:
        """Get the most recent completed analysis for the user."""
        result = await self.db.execute(
            select(Analysis)
            .where(
                Analysis.user_id == user_id,
                Analysis.status == AnalysisStatus.COMPLETED,
            )
            .order_by(Analysis.completed_at.desc())
            .limit(1)
        )
        analysis = result.scalar_one_or_none()

        if analysis and analysis.results:
            return {
                "website_url": analysis.website_url,
                "overall_score": analysis.results.get("overall_score"),
                "scores": analysis.results.get("scores"),
                "quick_wins": analysis.results.get("quick_wins"),
                "content_analysis": analysis.results.get("content_analysis"),
                "seo_analysis": analysis.results.get("seo_analysis"),
                "competitors": analysis.results.get("competitors"),
            }
        return None

    def _build_messages(
        self,
        conversation: Conversation,
        user_message: str,
        analysis_context: Optional[dict],
    ) -> list[dict]:
        """Build the message list for the LLM."""
        messages = []

        # System prompt based on ring phase
        system_content = SYSTEM_PROMPTS.get(
            conversation.ring_phase,
            SYSTEM_PROMPTS[RingPhase.CORE]
        )

        # Add analysis context to system prompt if available
        if analysis_context:
            system_content += f"""

WEBSITE ANALYSIS DATA:
Website: {analysis_context.get('website_url', 'Not provided')}
Overall Score: {analysis_context.get('overall_score', 'N/A')}/100

Scores:
- SEO: {analysis_context.get('scores', {}).get('seo', 'N/A')}
- Content: {analysis_context.get('scores', {}).get('content', 'N/A')}
- Mobile: {analysis_context.get('scores', {}).get('mobile', 'N/A')}
- Speed: {analysis_context.get('scores', {}).get('speed', 'N/A')}
- Social: {analysis_context.get('scores', {}).get('social', 'N/A')}

Quick Wins Identified:
{json.dumps(analysis_context.get('quick_wins', []), indent=2)}

Content Issues:
{json.dumps(analysis_context.get('content_analysis', {}).get('issues', []), indent=2)}

Use this data to ask relevant, specific questions about their website and business."""

        # Add business context if available
        if conversation.business_context:
            system_content += f"""

BUSINESS CONTEXT:
{conversation.business_context}"""

        messages.append({"role": "system", "content": system_content})

        # Add conversation history (last 10 messages for context)
        history_messages = sorted(conversation.messages, key=lambda m: m.created_at)[-10:]
        for msg in history_messages:
            role = "user" if msg.role == MessageRole.USER else "assistant"
            messages.append({"role": role, "content": msg.content})

        # Add the new user message
        messages.append({"role": "user", "content": user_message})

        return messages

    def _get_fallback_response(self, ring_phase: RingPhase, error: str = "") -> str:
        """Get a fallback response if AI fails."""
        fallbacks = {
            RingPhase.CORE: (
                "I'd love to learn more about your business. "
                "What products or services do you offer, and who are your ideal customers?"
            ),
            RingPhase.DISCOVER: (
                "Based on what I've learned, I'm identifying opportunities for growth. "
                "What do you see as your biggest competitive advantage?"
            ),
            RingPhase.PLAN: (
                "Let's build a strategy together. "
                "What's your top priority for the next 90 days?"
            ),
            RingPhase.EXECUTE: (
                "Time to take action! "
                "Which of these recommendations would you like to tackle first?"
            ),
            RingPhase.OPTIMIZE: (
                "Let's review your progress. "
                "What results have you seen so far?"
            ),
        }
        return fallbacks.get(ring_phase, "How can I help you today?")


async def get_ai_service(db: AsyncSession) -> AIService:
    """Dependency to get AI service."""
    return AIService(db)
