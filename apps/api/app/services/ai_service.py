"""
AI Service - LiteLLM Integration for Conversational AI with Advanced Context Engineering

AI App Development powered by ServiceVision (https://www.servicevision.net)

This module implements the "Rings of Growth" conversational framework with:
- Sophisticated system prompts tuned for business coaching
- Pre-processing for intent detection and context enrichment
- Post-processing for quality assurance and action extraction
- AI-driven ring phase advancement
- Optimized RAG context injection
"""

import json
import re
from typing import Optional, AsyncGenerator
from uuid import UUID
from enum import Enum

from litellm import acompletion
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analysis import Analysis, AnalysisStatus
from app.models.conversation import Conversation, Message, RingPhase, MessageRole
from app.config import settings


# ============================================================================
# QUENTO BRAND VOICE & PERSONALITY
# ============================================================================

BRAND_VOICE = """
QUENTO BRAND VOICE:
- Warm, approachable, and genuinely curious
- Confident but never arrogant - you're a knowledgeable partner, not a lecturer
- Action-oriented - always move toward practical outcomes
- Celebratory - acknowledge wins and progress enthusiastically
- Concise - respect the user's time; be substantive but not verbose
- Human - use conversational language, occasional humor when appropriate
- Never use corporate jargon or buzzwords without explaining them
- Speak in first person singular ("I noticed..." not "We noticed...")
"""

# ============================================================================
# USER INTENT CATEGORIES
# ============================================================================

class UserIntent(str, Enum):
    QUESTION = "question"  # User is asking for information
    STATEMENT = "statement"  # User is sharing information
    REQUEST = "request"  # User wants action or recommendation
    CONCERN = "concern"  # User expressing worry or problem
    AGREEMENT = "agreement"  # User agreeing or confirming
    DISAGREEMENT = "disagreement"  # User pushing back
    CLARIFICATION = "clarification"  # User asking for more detail
    OFF_TOPIC = "off_topic"  # Message unrelated to business


# ============================================================================
# RING PHASE SYSTEM PROMPTS
# ============================================================================

SYSTEM_PROMPTS = {
    RingPhase.CORE: f"""You are Quento, an expert business growth consultant. You're currently in the CORE phase - the foundational discovery stage where you build deep understanding of the business.

{BRAND_VOICE}

YOUR MISSION IN CORE PHASE:
Help the user articulate and refine their business identity. Most business owners have never clearly defined these foundational elements, and doing so creates clarity that drives all future decisions.

COACHING METHODOLOGY:
Use the "5 Whys" technique - when the user gives a surface answer, dig deeper to find the true motivation or meaning. Great consultants don't accept the first answer.

AREAS TO EXPLORE (one at a time):
1. IDENTITY: What does the business actually do? What transformation do they provide?
2. DIFFERENTIATION: What makes them different from every other option?
3. AUDIENCE: Who is their ideal customer? Be specific - demographics, psychographics, pain points
4. VALUES: What principles guide their decisions? What won't they compromise on?
5. VISION: Where do they want to be in 2-3 years? What does success look like?

CONVERSATION RULES:
- Ask ONE powerful question at a time
- Wait for the answer before moving to the next topic
- When they give a vague answer, ask "What do you mean by that?" or "Can you give me an example?"
- Reflect back what you hear to confirm understanding: "So what I'm hearing is..."
- Use their exact words when possible - this builds trust
- If website data is available, reference specific things you noticed to show you did your homework
- Never ask more than 2 sentences before the question mark

TRANSITION SIGNAL:
When you feel you have a solid grasp of their business identity (typically after 4-6 exchanges), naturally summarize what you've learned and say something like: "I feel like I have a good foundation now. Ready to discover some opportunities?"

EXAMPLE OPENING (with website context):
"I looked at your site and I see you're focused on [specific service]. Before I make assumptions, tell me - if you had to explain what makes your approach different in one sentence, what would you say?"

EXAMPLE OPENING (without website context):
"Let's start at the foundation. In the simplest terms, what does your business do - and more importantly, what problem does it solve for people?"
""",

    RingPhase.DISCOVER: f"""You are Quento in the DISCOVER phase - helping the user see opportunities and gaps they might be missing.

{BRAND_VOICE}

YOUR MISSION IN DISCOVER PHASE:
Act as a strategic mirror, helping them see their business from the outside. Share observations, identify patterns, and reveal opportunities they're too close to see.

DISCOVERY AREAS:
1. COMPETITIVE LANDSCAPE: How do they compare? What are others doing that's working?
2. DIGITAL PRESENCE: Website, social, search visibility - where are the gaps?
3. CUSTOMER JOURNEY: How do people find and choose them? Where do they lose people?
4. QUICK WINS: Low-effort, high-impact improvements they can make now
5. UNTAPPED CHANNELS: Marketing or sales channels they haven't explored

COACHING APPROACH:
- Share observations as hypotheses, not facts: "I wonder if..." or "Have you considered..."
- Ask about their awareness: "Are you seeing what your competitors are doing with [X]?"
- Connect dots: "Earlier you mentioned [X]. That makes me think about..."
- Balance positive and constructive: "Your [strength] is great, but I noticed [opportunity]"

USE WEBSITE ANALYSIS DATA:
If scores and quick wins are available, weave them naturally into conversation:
- "Your SEO score came in at X - that tells me..."
- "One quick win I spotted: [specific recommendation]"
- Don't dump all the data at once; reveal it progressively

TRANSITION SIGNAL:
When you've covered the major discovery areas and the user seems energized about opportunities, transition with: "Now that we've mapped out the landscape, want to build an action plan?"

AVOID:
- Overwhelming with too many opportunities at once
- Being negative or critical without offering solutions
- Generic advice that could apply to any business
""",

    RingPhase.PLAN: f"""You are Quento in the PLAN phase - helping create a focused, actionable growth strategy.

{BRAND_VOICE}

YOUR MISSION IN PLAN PHASE:
Transform insights from Core and Discover phases into a prioritized action plan. The goal is clarity and commitment, not perfection.

PLANNING FRAMEWORK:
Use a simple prioritization matrix:
- IMPACT: How much will this move the needle? (High/Medium/Low)
- EFFORT: How hard is this to implement? (High/Medium/Low)
- Start with High Impact + Low Effort = Quick Wins

AREAS TO PLAN:
1. 90-DAY PRIORITIES: What are the 3 most important things to accomplish?
2. SPECIFIC ACTIONS: Break priorities into concrete next steps
3. RESOURCES NEEDED: What will this take? (time, money, skills)
4. METRICS: How will you know it's working?
5. ACCOUNTABILITY: Who does what, by when?

COACHING APPROACH:
- Help them be realistic about capacity: "How many hours per week can you dedicate to this?"
- Push for specificity: "When you say 'improve social media', what specifically would that look like?"
- Challenge overcommitment: "That's ambitious - what if we focused on just the first two?"
- Get buy-in: "On a scale of 1-10, how confident are you that you'll do this?"

OUTPUT FORMAT:
When presenting a plan, use clear structure:
- Priority 1: [Name]
  - Why: [Business reason]
  - Actions: [Specific steps]
  - Timeline: [When]
  - Success looks like: [Measurable outcome]

TRANSITION SIGNAL:
When you have 2-3 clear priorities with specific actions, move forward: "This is a solid plan. Ready to start executing? Let's tackle the first one."
""",

    RingPhase.EXECUTE: f"""You are Quento in the EXECUTE phase - helping the user take action and overcome obstacles.

{BRAND_VOICE}

YOUR MISSION IN EXECUTE PHASE:
Be a supportive accountability partner. Help them do the work, troubleshoot problems, and maintain momentum.

EXECUTION SUPPORT:
1. TASK BREAKDOWN: Turn big actions into small, doable steps
2. HOW-TO GUIDANCE: Provide specific instructions when asked
3. OBSTACLE REMOVAL: Help them get unstuck when blocked
4. MOTIVATION: Celebrate progress, no matter how small
5. ACCOUNTABILITY: Follow up on commitments, gently but consistently

COACHING APPROACH:
- Make the next step crystal clear: "The very next thing to do is..."
- Anticipate roadblocks: "People often get stuck here because..."
- Offer alternatives: "If that feels overwhelming, you could also..."
- Check in on energy: "How are you feeling about this?"
- Celebrate wins immediately: "That's fantastic! You just [accomplishment]"

WHEN THEY'RE STUCK:
- "What's the specific part that's blocking you?"
- "What would need to be true for this to feel easier?"
- "Let's break this down smaller - what's ONE thing you could do in 15 minutes?"

WHEN THEY COMPLETE SOMETHING:
- Acknowledge the accomplishment genuinely
- Help them see the impact: "Now that you've done X, Y becomes possible"
- Preview the next step, but don't push if they need a break

TRANSITION SIGNAL:
After significant execution progress (several tasks completed), begin transitioning: "You've made real progress. Want to step back and look at what's working and what we might adjust?"
""",

    RingPhase.OPTIMIZE: f"""You are Quento in the OPTIMIZE phase - helping refine strategy based on real results.

{BRAND_VOICE}

YOUR MISSION IN OPTIMIZE PHASE:
Analyze what's working, identify what isn't, and evolve the strategy. This is where good strategies become great ones.

OPTIMIZATION AREAS:
1. RESULTS REVIEW: What metrics have changed? What outcomes are you seeing?
2. LEARNING EXTRACTION: What worked better or worse than expected? Why?
3. STRATEGY REFINEMENT: What should we do more of? Less of? Differently?
4. NEW OPPORTUNITIES: Now that we know more, what new possibilities emerge?
5. NEXT CYCLE: What's the next level of growth to pursue?

COACHING APPROACH:
- Lead with curiosity: "What surprised you most about the results?"
- Separate signal from noise: "Is this a trend or a one-time thing?"
- Challenge assumptions: "You assumed X would happen - what actually happened?"
- Look for patterns: "I'm noticing a theme here..."
- Plan iterations: "Based on this, here's what I'd suggest trying next..."

ANALYSIS FRAMEWORK:
- What did we set out to accomplish? (Original goal)
- What actually happened? (Results)
- What does this tell us? (Insight)
- What should we do next? (Action)

CELEBRATING GROWTH:
- Help them see how far they've come from the Core phase
- Connect improvements to their stated values and vision
- Acknowledge their effort and commitment

CYCLING BACK:
The Rings are iterative. After optimization, you may:
- Go deeper on Core (refined understanding)
- Return to Discover (new opportunities)
- Update Plan (evolved strategy)
- Continue Execute (more implementation)
"""
}


# ============================================================================
# PRE-PROCESSING
# ============================================================================

def preprocess_user_message(
    message: str,
    conversation_history: list[Message],
    ring_phase: RingPhase
) -> dict:
    """
    Pre-process user message to extract intent, context, and enrichment.

    Returns a dict with:
    - original_message: The raw user input
    - intent: Detected user intent
    - key_topics: Main topics/entities mentioned
    - sentiment: Positive/negative/neutral
    - references_previous: Whether they're referencing earlier conversation
    - message_length: short/medium/long
    - enrichment_notes: Context for the AI about this message
    """
    message_lower = message.lower().strip()

    # Detect intent
    intent = _detect_intent(message_lower)

    # Detect sentiment
    sentiment = _detect_sentiment(message_lower)

    # Check for references to previous conversation
    references_previous = _check_references_previous(message_lower)

    # Categorize message length
    word_count = len(message.split())
    if word_count <= 5:
        message_length = "short"
    elif word_count <= 30:
        message_length = "medium"
    else:
        message_length = "long"

    # Build enrichment notes for the AI
    enrichment_notes = []

    if message_length == "short":
        enrichment_notes.append("User gave a brief response - may need to probe for more detail")

    if sentiment == "negative":
        enrichment_notes.append("User may be expressing concern or frustration - acknowledge their feelings")

    if intent == UserIntent.DISAGREEMENT:
        enrichment_notes.append("User is pushing back - validate their perspective before responding")

    if intent == UserIntent.CONCERN:
        enrichment_notes.append("User is worried about something - address the concern directly")

    if references_previous:
        enrichment_notes.append("User is referencing earlier conversation - maintain continuity")

    return {
        "original_message": message,
        "intent": intent.value,
        "sentiment": sentiment,
        "references_previous": references_previous,
        "message_length": message_length,
        "enrichment_notes": enrichment_notes,
    }


def _detect_intent(message: str) -> UserIntent:
    """Detect the primary intent of the user message."""
    # Question indicators
    question_patterns = [
        r'\?$', r'^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does)',
        r'tell me', r'explain', r'help me understand'
    ]

    # Request indicators
    request_patterns = [
        r'(can you|could you|please|help me|i need|i want|give me|show me)',
        r'recommend', r'suggest', r'create', r'make', r'build'
    ]

    # Concern indicators
    concern_patterns = [
        r"(worried|concerned|afraid|scared|nervous|unsure|don't know|struggling|problem|issue|difficult|hard)",
        r"(not working|doesn't work|failed|failing)"
    ]

    # Agreement indicators
    agreement_patterns = [
        r'^(yes|yeah|yep|sure|ok|okay|right|exactly|agreed|absolutely|definitely|that\'s right|sounds good)',
        r'makes sense', r'i agree', r'you\'re right'
    ]

    # Disagreement indicators
    disagreement_patterns = [
        r'^(no|nope|not really|i disagree|that\'s not|actually)',
        r"(but|however|although)", r"don't think so", r"not sure about that"
    ]

    # Check patterns in order of specificity
    for pattern in concern_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            return UserIntent.CONCERN

    for pattern in disagreement_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            return UserIntent.DISAGREEMENT

    for pattern in agreement_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            return UserIntent.AGREEMENT

    for pattern in request_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            return UserIntent.REQUEST

    for pattern in question_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            return UserIntent.QUESTION

    return UserIntent.STATEMENT


def _detect_sentiment(message: str) -> str:
    """Detect overall sentiment of the message."""
    positive_words = [
        'great', 'good', 'excellent', 'amazing', 'love', 'happy', 'excited',
        'wonderful', 'fantastic', 'perfect', 'awesome', 'glad', 'pleased',
        'thrilled', 'delighted', 'success', 'working', 'progress'
    ]

    negative_words = [
        'bad', 'terrible', 'awful', 'hate', 'frustrated', 'angry', 'worried',
        'concerned', 'problem', 'issue', 'difficult', 'hard', 'failing',
        'struggle', 'stuck', 'confused', 'overwhelmed', 'stressed'
    ]

    message_lower = message.lower()

    pos_count = sum(1 for word in positive_words if word in message_lower)
    neg_count = sum(1 for word in negative_words if word in message_lower)

    if pos_count > neg_count:
        return "positive"
    elif neg_count > pos_count:
        return "negative"
    return "neutral"


def _check_references_previous(message: str) -> bool:
    """Check if message references previous conversation."""
    reference_patterns = [
        r'(you said|you mentioned|earlier|before|last time|we talked about)',
        r'(that thing|the thing|what you|as you|like you)',
        r'(remember|recall|back to|going back)'
    ]

    for pattern in reference_patterns:
        if re.search(pattern, message, re.IGNORECASE):
            return True
    return False


# ============================================================================
# POST-PROCESSING
# ============================================================================

def postprocess_ai_response(
    response: str,
    ring_phase: RingPhase,
    user_intent: str,
    user_sentiment: str
) -> dict:
    """
    Post-process AI response for quality and extraction.

    Returns a dict with:
    - content: The (potentially cleaned) response text
    - has_question: Whether response ends with engagement
    - action_items: Any actionable items mentioned
    - suggested_phase_transition: Whether AI suggests moving phases
    - quality_flags: Any quality concerns
    """
    content = response.strip()

    # Clean up any artifacts
    content = _clean_response(content)

    # Check if response has engagement (question or call to action)
    has_question = bool(re.search(r'\?[\s]*$', content)) or bool(
        re.search(r'(let me know|tell me|share|what do you think)', content.lower())
    )

    # Extract any action items
    action_items = _extract_action_items(content)

    # Check for phase transition signals
    suggested_phase_transition = _detect_phase_transition_signal(content, ring_phase)

    # Quality flags
    quality_flags = _check_quality(content, user_intent, user_sentiment)

    return {
        "content": content,
        "has_question": has_question,
        "action_items": action_items,
        "suggested_phase_transition": suggested_phase_transition,
        "quality_flags": quality_flags,
    }


def _clean_response(response: str) -> str:
    """Clean up AI response artifacts."""
    # Remove any accidental system prompt leakage
    response = re.sub(r'^\s*(SYSTEM|ASSISTANT|AI):\s*', '', response, flags=re.IGNORECASE)

    # Remove any markdown headers if they seem out of place
    if response.count('#') > 3:
        # Too many headers for conversational response
        response = re.sub(r'^#{1,3}\s+', '', response, flags=re.MULTILINE)

    # Ensure we don't have multiple consecutive newlines
    response = re.sub(r'\n{3,}', '\n\n', response)

    return response.strip()


def _extract_action_items(response: str) -> list[str]:
    """Extract actionable items from the response."""
    action_items = []

    # Look for numbered lists
    numbered_items = re.findall(r'^\s*\d+[\.\)]\s*(.+)$', response, re.MULTILINE)
    action_items.extend(numbered_items)

    # Look for bullet points
    bullet_items = re.findall(r'^\s*[-•*]\s*(.+)$', response, re.MULTILINE)
    action_items.extend(bullet_items)

    # Look for "Priority" or "Action" labeled items
    priority_items = re.findall(
        r'(?:Priority|Action|Step|Task)(?:\s*\d*)?:\s*(.+?)(?:\n|$)',
        response,
        re.IGNORECASE
    )
    action_items.extend(priority_items)

    # Filter out items that are too short or look like headers
    action_items = [
        item.strip() for item in action_items
        if len(item.strip()) > 10 and not item.strip().endswith(':')
    ]

    return action_items[:10]  # Limit to 10 items


def _detect_phase_transition_signal(response: str, current_phase: RingPhase) -> Optional[str]:
    """Detect if AI is signaling readiness to transition phases."""
    response_lower = response.lower()

    transition_signals = {
        RingPhase.CORE: [
            "ready to discover", "discover some opportunities",
            "good foundation", "understand your business",
            "move forward", "next phase"
        ],
        RingPhase.DISCOVER: [
            "build a plan", "create a strategy", "action plan",
            "ready to plan", "let's prioritize"
        ],
        RingPhase.PLAN: [
            "start executing", "take action", "let's do this",
            "first step", "ready to implement"
        ],
        RingPhase.EXECUTE: [
            "review progress", "step back", "optimize",
            "what's working", "refine our approach"
        ],
        RingPhase.OPTIMIZE: [
            "new cycle", "deeper dive", "revisit",
            "next level", "evolved strategy"
        ],
    }

    signals = transition_signals.get(current_phase, [])
    for signal in signals:
        if signal in response_lower:
            # Map to next phase
            phase_order = [RingPhase.CORE, RingPhase.DISCOVER, RingPhase.PLAN,
                          RingPhase.EXECUTE, RingPhase.OPTIMIZE]
            try:
                current_idx = phase_order.index(current_phase)
                if current_idx < len(phase_order) - 1:
                    return phase_order[current_idx + 1].value
            except ValueError:
                pass

    return None


def _check_quality(response: str, user_intent: str, user_sentiment: str) -> list[str]:
    """Check response quality and return any flags."""
    flags = []

    # Check response length
    if len(response) < 50:
        flags.append("response_too_short")
    elif len(response) > 1500:
        flags.append("response_too_long")

    # Check if response addresses negative sentiment
    if user_sentiment == "negative" and not any(
        word in response.lower() for word in
        ['understand', 'hear you', 'makes sense', 'valid', 'challenging', 'difficult']
    ):
        flags.append("may_not_acknowledge_concern")

    # Check if question was asked when one might be expected
    if user_intent == "statement" and '?' not in response:
        flags.append("no_follow_up_question")

    return flags


# ============================================================================
# RING PHASE ADVANCEMENT
# ============================================================================

async def analyze_for_phase_advancement(
    conversation: Conversation,
    latest_exchange: tuple[str, str],  # (user_message, ai_response)
    analysis_context: Optional[dict],
) -> dict:
    """
    Analyze conversation to determine if it's ready to advance phases.

    This uses heuristics rather than AI to keep it fast and cost-effective.
    Returns dict with:
    - should_advance: bool
    - confidence: float 0-1
    - reason: str
    """
    ring_phase = conversation.ring_phase
    messages = conversation.messages
    user_message, ai_response = latest_exchange

    # Count exchanges (pairs of user + assistant messages)
    exchange_count = len([m for m in messages if m.role == MessageRole.USER])

    # Phase-specific criteria
    criteria = {
        RingPhase.CORE: {
            "min_exchanges": 4,
            "key_signals": [
                "target audience", "ideal customer", "customers",
                "different", "unique", "value", "problem we solve",
                "mission", "vision", "goal"
            ],
            "sufficient_coverage": 3,  # Need to cover at least 3 key signals
        },
        RingPhase.DISCOVER: {
            "min_exchanges": 3,
            "key_signals": [
                "competitor", "opportunity", "quick win", "improve",
                "channel", "marketing", "seo", "social"
            ],
            "sufficient_coverage": 2,
        },
        RingPhase.PLAN: {
            "min_exchanges": 3,
            "key_signals": [
                "priority", "action", "timeline", "first",
                "metric", "measure", "goal"
            ],
            "sufficient_coverage": 2,
        },
        RingPhase.EXECUTE: {
            "min_exchanges": 4,
            "key_signals": [
                "done", "completed", "finished", "working on",
                "progress", "started", "implemented"
            ],
            "sufficient_coverage": 2,
        },
        RingPhase.OPTIMIZE: {
            "min_exchanges": 3,
            "key_signals": [
                "results", "learning", "adjust", "improve",
                "working", "not working", "next"
            ],
            "sufficient_coverage": 2,
        },
    }

    phase_criteria = criteria.get(ring_phase)
    if not phase_criteria:
        return {"should_advance": False, "confidence": 0, "reason": "Unknown phase"}

    # Check minimum exchanges
    if exchange_count < phase_criteria["min_exchanges"]:
        return {
            "should_advance": False,
            "confidence": 0.2,
            "reason": f"Only {exchange_count} exchanges, need {phase_criteria['min_exchanges']}"
        }

    # Check topic coverage in conversation
    all_content = " ".join([m.content.lower() for m in messages])
    all_content += f" {user_message.lower()} {ai_response.lower()}"

    covered_signals = sum(
        1 for signal in phase_criteria["key_signals"]
        if signal in all_content
    )

    if covered_signals >= phase_criteria["sufficient_coverage"]:
        confidence = min(0.9, 0.5 + (covered_signals / len(phase_criteria["key_signals"])) * 0.4)
        return {
            "should_advance": True,
            "confidence": confidence,
            "reason": f"Covered {covered_signals} key topics in {exchange_count} exchanges"
        }

    # Check if AI naturally signaled transition
    if _detect_phase_transition_signal(ai_response, ring_phase):
        return {
            "should_advance": True,
            "confidence": 0.85,
            "reason": "AI signaled readiness for next phase"
        }

    return {
        "should_advance": False,
        "confidence": 0.4,
        "reason": f"Only covered {covered_signals}/{phase_criteria['sufficient_coverage']} key topics"
    }


# ============================================================================
# RAG CONTEXT OPTIMIZATION
# ============================================================================

def build_optimized_rag_context(
    analysis_context: Optional[dict],
    ring_phase: RingPhase,
    recent_topics: list[str]
) -> str:
    """
    Build optimized RAG context based on ring phase and conversation topics.

    Different phases need different context emphasis:
    - CORE: Website content for understanding the business
    - DISCOVER: Scores, quick wins, competitive data
    - PLAN: Quick wins prioritized, action-oriented data
    - EXECUTE: Specific recommendations, how-to context
    - OPTIMIZE: Metrics, benchmarks
    """
    if not analysis_context:
        return ""

    sections = []

    # Always include basic business context
    website_url = analysis_context.get('website_url', 'Not provided')
    website_title = analysis_context.get('website_title', 'Unknown')
    website_desc = analysis_context.get('website_description', '')

    sections.append(f"""
BUSINESS WEBSITE: {website_url}
Business Name: {website_title}
Description: {website_desc[:200] if website_desc else 'No description found'}
""")

    # Phase-specific context
    if ring_phase in [RingPhase.CORE, RingPhase.DISCOVER]:
        # Include website content for understanding
        headings = analysis_context.get('website_headings', [])[:8]
        key_paragraphs = analysis_context.get('key_paragraphs', [])[:4]

        if headings:
            sections.append(f"""
WEBSITE STRUCTURE (main headings):
{chr(10).join(f"- {h}" for h in headings)}
""")

        if key_paragraphs:
            sections.append("""
KEY CONTENT FROM WEBSITE:
""" + chr(10).join(f"• {p[:250]}..." if len(p) > 250 else f"• {p}" for p in key_paragraphs))

    if ring_phase in [RingPhase.DISCOVER, RingPhase.PLAN, RingPhase.EXECUTE]:
        # Include scores and quick wins
        overall_score = analysis_context.get('overall_score')
        scores = analysis_context.get('scores', {})
        quick_wins = analysis_context.get('quick_wins', [])

        if overall_score:
            sections.append(f"""
WEBSITE ANALYSIS SCORES:
Overall: {overall_score}/100
- SEO: {scores.get('seo', 'N/A')}/100
- Content: {scores.get('content', 'N/A')}/100
- Mobile: {scores.get('mobile', 'N/A')}/100
- Speed: {scores.get('speed', 'N/A')}/100
- Social: {scores.get('social', 'N/A')}/100
""")

        if quick_wins:
            sections.append(f"""
IDENTIFIED QUICK WINS:
{json.dumps(quick_wins[:5], indent=2)}
""")

    if ring_phase in [RingPhase.PLAN, RingPhase.EXECUTE]:
        # Include content issues for action planning
        content_issues = analysis_context.get('content_analysis', {}).get('issues', [])
        if content_issues:
            sections.append(f"""
CONTENT ISSUES TO ADDRESS:
{chr(10).join(f"- {issue}" for issue in content_issues[:5])}
""")

    if ring_phase == RingPhase.OPTIMIZE:
        # Include all scores for benchmarking
        seo_analysis = analysis_context.get('seo_analysis', {})
        if seo_analysis:
            sections.append(f"""
SEO DETAILS:
{json.dumps(seo_analysis, indent=2)[:800]}
""")

    return chr(10).join(sections)


# ============================================================================
# MAIN AI SERVICE CLASS
# ============================================================================

class AIService:
    """
    AI service for generating conversational responses with advanced context engineering.

    Features:
    - Phase-aware system prompts
    - Pre-processing for intent and sentiment detection
    - Post-processing for quality and action extraction
    - Optimized RAG context injection
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.model = settings.AI_MODEL

    async def generate_response(
        self,
        conversation: Conversation,
        user_message: str,
        user_id: UUID,
    ) -> str:
        """Generate an AI response with full context engineering pipeline."""

        # 1. PRE-PROCESSING
        preprocessing = preprocess_user_message(
            message=user_message,
            conversation_history=list(conversation.messages),
            ring_phase=conversation.ring_phase,
        )

        # 2. GET ANALYSIS CONTEXT
        analysis_context = await self._get_analysis_context(user_id)

        # 3. BUILD OPTIMIZED RAG CONTEXT
        rag_context = build_optimized_rag_context(
            analysis_context=analysis_context,
            ring_phase=conversation.ring_phase,
            recent_topics=[],  # Could extract from conversation
        )

        # 4. BUILD MESSAGES
        messages = self._build_messages(
            conversation=conversation,
            user_message=user_message,
            preprocessing=preprocessing,
            rag_context=rag_context,
        )

        # 5. CALL LLM
        try:
            response = await acompletion(
                model=self.model,
                messages=messages,
                max_tokens=600,
                temperature=0.7,
            )
            raw_response = response.choices[0].message.content
        except Exception as e:
            return self._get_fallback_response(conversation.ring_phase, str(e))

        # 6. POST-PROCESSING
        postprocessing = postprocess_ai_response(
            response=raw_response,
            ring_phase=conversation.ring_phase,
            user_intent=preprocessing["intent"],
            user_sentiment=preprocessing["sentiment"],
        )

        return postprocessing["content"]

    async def generate_response_stream(
        self,
        conversation: Conversation,
        user_message: str,
        user_id: UUID,
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming AI response."""

        preprocessing = preprocess_user_message(
            message=user_message,
            conversation_history=list(conversation.messages),
            ring_phase=conversation.ring_phase,
        )

        analysis_context = await self._get_analysis_context(user_id)

        rag_context = build_optimized_rag_context(
            analysis_context=analysis_context,
            ring_phase=conversation.ring_phase,
            recent_topics=[],
        )

        messages = self._build_messages(
            conversation=conversation,
            user_message=user_message,
            preprocessing=preprocessing,
            rag_context=rag_context,
        )

        try:
            response = await acompletion(
                model=self.model,
                messages=messages,
                max_tokens=600,
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
            website_content = analysis.results.get("website_content", {})

            return {
                "website_url": analysis.website_url,
                "overall_score": analysis.results.get("overall_score"),
                "scores": analysis.results.get("scores"),
                "quick_wins": analysis.results.get("quick_wins"),
                "content_analysis": analysis.results.get("content_analysis"),
                "seo_analysis": analysis.results.get("seo_analysis"),
                "competitors": analysis.results.get("competitors"),
                "website_title": website_content.get("title"),
                "website_description": website_content.get("description"),
                "website_headings": website_content.get("headings", []),
                "website_content": website_content.get("raw_content", ""),
                "key_paragraphs": website_content.get("key_paragraphs", []),
            }
        return None

    def _build_messages(
        self,
        conversation: Conversation,
        user_message: str,
        preprocessing: dict,
        rag_context: str,
    ) -> list[dict]:
        """Build the message list for the LLM with enhanced context."""
        messages = []

        # System prompt based on ring phase
        system_content = SYSTEM_PROMPTS.get(
            conversation.ring_phase,
            SYSTEM_PROMPTS[RingPhase.CORE]
        )

        # Add RAG context
        if rag_context:
            system_content += f"""

---
CONTEXT FROM WEBSITE ANALYSIS:
{rag_context}
---
Use this context to personalize your responses. Reference specific details from their website when relevant.
"""

        # Add business context if stored in conversation
        if conversation.business_context:
            system_content += f"""

BUSINESS CONTEXT (from user input):
{conversation.business_context}
"""

        # Add preprocessing enrichment notes
        if preprocessing.get("enrichment_notes"):
            system_content += f"""

CONVERSATION NOTES:
{chr(10).join(f"- {note}" for note in preprocessing['enrichment_notes'])}
"""

        messages.append({"role": "system", "content": system_content})

        # Add conversation history (last 10 messages)
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
