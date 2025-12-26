"""
Conversation Chain - LangChain + LiteLLM Integration

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from typing import Optional, AsyncIterator
from uuid import UUID
import json

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_community.chat_models import ChatLiteLLM
from langchain.memory import ConversationBufferWindowMemory

from app.config import settings
from app.models.conversation import RingPhase


class ConversationChain:
    """
    Conversation chain for the Quento AI assistant.

    Uses LiteLLM for model-agnostic LLM integration with LangChain.
    Implements the "Rings of Growth" conversation flow.
    """

    # Ring-specific system prompts
    RING_PROMPTS = {
        RingPhase.CORE: """You are Quento, an AI business growth advisor. You're currently in the CORE phase,
where your goal is to understand the business's core identity, values, and current web presence.

Focus on:
- Understanding their business type and industry
- Learning about their target audience
- Discovering their unique value proposition
- Getting their website URL if not already provided
- Building rapport and trust

Be warm, curious, and encouraging. Ask open-ended questions to gather information.
When you have a good understanding of their core business, suggest moving to the Discover phase.""",

        RingPhase.DISCOVER: """You are Quento, an AI business growth advisor. You're in the DISCOVER phase,
where you help uncover opportunities and analyze their market position.

Focus on:
- Analyzing their website and online presence
- Identifying competitors and market trends
- Discovering growth opportunities
- Understanding their current marketing efforts
- Highlighting strengths and areas for improvement

Reference the analysis data when available. Be insightful and data-driven.
When you've gathered enough discovery insights, suggest moving to the Plan phase.""",

        RingPhase.PLAN: """You are Quento, an AI business growth advisor. You're in the PLAN phase,
where you develop strategic recommendations based on discoveries.

Focus on:
- Creating actionable strategic recommendations
- Prioritizing initiatives based on impact and effort
- Setting realistic goals and milestones
- Building a 90-day action plan
- Explaining the rationale behind recommendations

Be strategic and practical. Help them see the path to growth.
When the plan is solid, suggest moving to the Execute phase.""",

        RingPhase.EXECUTE: """You are Quento, an AI business growth advisor. You're in the EXECUTE phase,
where you guide implementation of the strategy.

Focus on:
- Breaking down strategy into actionable tasks
- Providing specific implementation guidance
- Tracking progress on action items
- Offering encouragement and support
- Helping overcome obstacles

Be supportive and action-oriented. Celebrate progress.
When key actions are underway, suggest moving to the Optimize phase.""",

        RingPhase.OPTIMIZE: """You are Quento, an AI business growth advisor. You're in the OPTIMIZE phase,
where you help refine and improve based on results.

Focus on:
- Reviewing progress and results
- Analyzing what's working and what isn't
- Suggesting optimizations and improvements
- Setting new goals for continued growth
- Celebrating achievements

Be analytical and forward-looking. Help them continuously improve.
The journey of optimization never truly ends - there's always room to grow!""",
    }

    def __init__(
        self,
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ):
        """
        Initialize the conversation chain.

        Args:
            model: LiteLLM model name (e.g., "gpt-4", "claude-3-sonnet")
            temperature: Creativity level (0.0 - 1.0)
            max_tokens: Maximum response length
        """
        self.model = model or settings.LLM_MODEL
        self.temperature = temperature
        self.max_tokens = max_tokens

        # Initialize LiteLLM chat model
        self.llm = ChatLiteLLM(
            model=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )

        # Output parser
        self.output_parser = StrOutputParser()

    def _build_prompt(self, ring_phase: RingPhase) -> ChatPromptTemplate:
        """Build prompt template for the given ring phase."""
        system_prompt = self.RING_PROMPTS.get(ring_phase, self.RING_PROMPTS[RingPhase.CORE])

        return ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
        ])

    def _format_history(
        self, messages: list[dict]
    ) -> list[HumanMessage | AIMessage]:
        """Format message history for LangChain."""
        formatted = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")

            if role == "user":
                formatted.append(HumanMessage(content=content))
            elif role == "assistant":
                formatted.append(AIMessage(content=content))

        return formatted

    async def generate_response(
        self,
        user_message: str,
        ring_phase: RingPhase,
        chat_history: list[dict] = None,
        context: dict = None,
    ) -> str:
        """
        Generate a response to the user's message.

        Args:
            user_message: The user's input message
            ring_phase: Current conversation ring phase
            chat_history: Previous messages in the conversation
            context: Additional context (analysis results, business info, etc.)

        Returns:
            AI assistant's response
        """
        # Build prompt
        prompt = self._build_prompt(ring_phase)

        # Format chat history
        history = self._format_history(chat_history or [])

        # Add context to system message if provided
        if context:
            context_str = self._format_context(context)
            user_message = f"{context_str}\n\nUser: {user_message}"

        # Build chain
        chain = prompt | self.llm | self.output_parser

        # Generate response
        response = await chain.ainvoke({
            "chat_history": history,
            "input": user_message,
        })

        return response

    async def stream_response(
        self,
        user_message: str,
        ring_phase: RingPhase,
        chat_history: list[dict] = None,
        context: dict = None,
    ) -> AsyncIterator[str]:
        """
        Stream a response to the user's message.

        Args:
            user_message: The user's input message
            ring_phase: Current conversation ring phase
            chat_history: Previous messages in the conversation
            context: Additional context

        Yields:
            Response chunks as they're generated
        """
        # Build prompt
        prompt = self._build_prompt(ring_phase)

        # Format chat history
        history = self._format_history(chat_history or [])

        # Add context if provided
        if context:
            context_str = self._format_context(context)
            user_message = f"{context_str}\n\nUser: {user_message}"

        # Build chain
        chain = prompt | self.llm

        # Stream response
        async for chunk in chain.astream({
            "chat_history": history,
            "input": user_message,
        }):
            if hasattr(chunk, "content"):
                yield chunk.content

    def _format_context(self, context: dict) -> str:
        """Format context data for inclusion in prompts."""
        parts = ["[Context Information]"]

        if "business_name" in context:
            parts.append(f"Business: {context['business_name']}")

        if "website_url" in context:
            parts.append(f"Website: {context['website_url']}")

        if "analysis_summary" in context:
            parts.append(f"Analysis Summary: {context['analysis_summary']}")

        if "overall_score" in context:
            parts.append(f"Overall Score: {context['overall_score']}/100")

        if "key_findings" in context:
            findings = context["key_findings"]
            if isinstance(findings, list):
                parts.append("Key Findings:")
                for finding in findings[:5]:
                    parts.append(f"  - {finding}")

        if "recommendations" in context:
            recs = context["recommendations"]
            if isinstance(recs, list):
                parts.append("Current Recommendations:")
                for rec in recs[:3]:
                    if isinstance(rec, dict):
                        parts.append(f"  - {rec.get('title', rec)}")
                    else:
                        parts.append(f"  - {rec}")

        return "\n".join(parts)

    async def should_advance_ring(
        self,
        ring_phase: RingPhase,
        chat_history: list[dict],
        context: dict = None,
    ) -> tuple[bool, str]:
        """
        Determine if the conversation should advance to the next ring.

        Args:
            ring_phase: Current ring phase
            chat_history: Conversation history
            context: Additional context

        Returns:
            Tuple of (should_advance, reason)
        """
        if ring_phase == RingPhase.OPTIMIZE:
            return False, "Already at final ring"

        # Simple heuristic based on message count and content
        message_count = len(chat_history)

        phase_thresholds = {
            RingPhase.CORE: 6,
            RingPhase.DISCOVER: 8,
            RingPhase.PLAN: 10,
            RingPhase.EXECUTE: 12,
        }

        threshold = phase_thresholds.get(ring_phase, 6)

        if message_count >= threshold:
            # Use LLM to determine if ready to advance
            check_prompt = ChatPromptTemplate.from_messages([
                ("system", """You are analyzing a business consultation conversation.
Determine if the conversation has covered enough ground to move to the next phase.

Current phase: {phase}
Next phase: {next_phase}

Respond with JSON: {{"ready": true/false, "reason": "explanation"}}"""),
                ("human", "Here's the recent conversation:\n{history}"),
            ])

            next_phases = {
                RingPhase.CORE: "Discover",
                RingPhase.DISCOVER: "Plan",
                RingPhase.PLAN: "Execute",
                RingPhase.EXECUTE: "Optimize",
            }

            # Get last few messages
            recent = chat_history[-6:] if len(chat_history) > 6 else chat_history
            history_str = "\n".join([
                f"{m['role'].title()}: {m['content'][:200]}..."
                for m in recent
            ])

            chain = check_prompt | self.llm | self.output_parser

            try:
                result = await chain.ainvoke({
                    "phase": ring_phase.value,
                    "next_phase": next_phases.get(ring_phase, "next"),
                    "history": history_str,
                })

                # Parse JSON response
                data = json.loads(result)
                return data.get("ready", False), data.get("reason", "")
            except Exception:
                # Fallback to threshold-based decision
                return True, f"Conversation has {message_count} messages"

        return False, f"Need more discussion ({message_count}/{threshold} messages)"


def get_conversation_chain(
    model: str = None,
    temperature: float = 0.7,
) -> ConversationChain:
    """Factory function to create conversation chain."""
    return ConversationChain(model=model, temperature=temperature)
