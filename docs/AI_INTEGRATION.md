# AI Integration & LangChain Architecture
## Quento Mobile Platform

**Version:** 1.0
**Last Updated:** December 2025
**AI Development Partner:** ServiceVision (https://www.servicevision.net)

---

## 1. Overview

The Quento AI system leverages **LangChain** for orchestration and **LiteLLM** for model flexibility, creating an intelligent conversational experience that guides users through their business growth journey.

### 1.1 AI System Goals

1. **Conversational Understanding** - Natural, contextual dialogue about business goals
2. **Automated Analysis** - Intelligent web scraping and competitive analysis
3. **Strategic Recommendation** - Data-driven, personalized business strategies
4. **Continuous Learning** - Improved recommendations over time

### 1.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          QUENTO AI ARCHITECTURE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        ORCHESTRATION LAYER                           │   │
│   │                         (LangChain)                                  │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│   │  │ Conversation│  │  Analysis   │  │  Strategy   │  │  Action    │  │   │
│   │  │    Chain    │  │    Chain    │  │    Chain    │  │   Chain    │  │   │
│   │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘  │   │
│   │         │                │                │               │          │   │
│   │         └────────────────┼────────────────┼───────────────┘          │   │
│   │                          │                │                          │   │
│   │                          ▼                ▼                          │   │
│   │  ┌───────────────────────────────────────────────────────────────┐  │   │
│   │  │                    AGENT FRAMEWORK                             │  │   │
│   │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │  │   │
│   │  │  │  Business   │  │   Web       │  │     Strategy        │   │  │   │
│   │  │  │  Analyst    │  │  Analyst    │  │     Advisor         │   │  │   │
│   │  │  │  Agent      │  │   Agent     │  │      Agent          │   │  │   │
│   │  │  └─────────────┘  └─────────────┘  └─────────────────────┘   │  │   │
│   │  └───────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         MODEL LAYER                                  │   │
│   │                         (LiteLLM)                                   │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│   │  │   GPT-4o    │  │   Claude    │  │   Gemini    │  │  Mistral   │  │   │
│   │  │  (Primary)  │  │  (Fallback) │  │  (Analysis) │  │  (Fast)    │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                       │
│                                      ▼                                       │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                         TOOL LAYER                                   │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│   │  │    Web      │  │     SEO     │  │   Social    │  │ Competitor │  │   │
│   │  │  Scraper    │  │  Analyzer   │  │  Scanner    │  │   Finder   │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. LiteLLM Configuration

### 2.1 Model Strategy

```python
# config/llm_config.py

from dataclasses import dataclass
from typing import Optional

@dataclass
class LLMConfig:
    """Configuration for LiteLLM models."""

    # Primary conversational model
    CHAT_MODEL: str = "gpt-4o"
    CHAT_TEMPERATURE: float = 0.7
    CHAT_MAX_TOKENS: int = 2000

    # Analysis model (more deterministic)
    ANALYSIS_MODEL: str = "gpt-4o"
    ANALYSIS_TEMPERATURE: float = 0.2
    ANALYSIS_MAX_TOKENS: int = 4000

    # Fast model for quick operations
    FAST_MODEL: str = "gpt-4o-mini"
    FAST_TEMPERATURE: float = 0.3
    FAST_MAX_TOKENS: int = 1000

    # Embedding model
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS: int = 1536

    # Fallback configuration
    FALLBACK_MODELS: list = None

    def __post_init__(self):
        self.FALLBACK_MODELS = [
            "claude-3-5-sonnet-20241022",
            "gemini-1.5-pro",
            "gpt-4-turbo"
        ]

# Model routing configuration
MODEL_ROUTING = {
    "conversation": {
        "primary": "gpt-4o",
        "fallback": ["claude-3-5-sonnet-20241022"],
        "timeout": 30,
        "retries": 2
    },
    "analysis": {
        "primary": "gpt-4o",
        "fallback": ["claude-3-5-sonnet-20241022", "gemini-1.5-pro"],
        "timeout": 60,
        "retries": 3
    },
    "embedding": {
        "primary": "text-embedding-3-small",
        "fallback": ["text-embedding-ada-002"],
        "timeout": 10,
        "retries": 2
    }
}
```

### 2.2 LiteLLM Integration

```python
# ai/llm.py

import litellm
from litellm import completion, acompletion, embedding
from langchain_community.chat_models import ChatLiteLLM
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks import StreamingStdOutCallbackHandler
import asyncio
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class QuentoLLM:
    """
    Unified LLM interface using LiteLLM for model-agnostic AI operations.
    Provides fallback handling, rate limiting, and cost tracking.
    """

    def __init__(self, config: LLMConfig):
        self.config = config
        self._setup_litellm()

    def _setup_litellm(self):
        """Configure LiteLLM settings."""
        # Enable caching for cost optimization
        litellm.cache = litellm.Cache(type="redis", host="localhost", port=6379)

        # Set up callbacks for logging
        litellm.success_callback = ["langfuse"]
        litellm.failure_callback = ["sentry"]

        # Configure rate limiting
        litellm.set_verbose = False

    def get_chat_model(
        self,
        streaming: bool = False,
        callbacks: Optional[List] = None
    ) -> ChatLiteLLM:
        """
        Get a LangChain-compatible chat model for conversations.

        Args:
            streaming: Enable streaming responses
            callbacks: Optional callback handlers

        Returns:
            ChatLiteLLM instance configured for conversation
        """
        callback_manager = None
        if callbacks or streaming:
            handlers = callbacks or []
            if streaming:
                handlers.append(StreamingStdOutCallbackHandler())
            callback_manager = CallbackManager(handlers)

        return ChatLiteLLM(
            model=self.config.CHAT_MODEL,
            temperature=self.config.CHAT_TEMPERATURE,
            max_tokens=self.config.CHAT_MAX_TOKENS,
            streaming=streaming,
            callback_manager=callback_manager,
            model_kwargs={
                "fallbacks": self.config.FALLBACK_MODELS,
                "metadata": {"application": "quento", "type": "conversation"}
            }
        )

    def get_analysis_model(self) -> ChatLiteLLM:
        """Get model optimized for analysis tasks (low temperature)."""
        return ChatLiteLLM(
            model=self.config.ANALYSIS_MODEL,
            temperature=self.config.ANALYSIS_TEMPERATURE,
            max_tokens=self.config.ANALYSIS_MAX_TOKENS,
            model_kwargs={
                "fallbacks": self.config.FALLBACK_MODELS,
                "metadata": {"application": "quento", "type": "analysis"}
            }
        )

    def get_fast_model(self) -> ChatLiteLLM:
        """Get fast model for quick operations."""
        return ChatLiteLLM(
            model=self.config.FAST_MODEL,
            temperature=self.config.FAST_TEMPERATURE,
            max_tokens=self.config.FAST_MAX_TOKENS,
            model_kwargs={
                "metadata": {"application": "quento", "type": "fast"}
            }
        )

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for text."""
        response = await litellm.aembedding(
            model=self.config.EMBEDDING_MODEL,
            input=[text]
        )
        return response.data[0]["embedding"]

    async def generate_embeddings_batch(
        self,
        texts: List[str],
        batch_size: int = 100
    ) -> List[List[float]]:
        """Generate embeddings for multiple texts efficiently."""
        embeddings = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            response = await litellm.aembedding(
                model=self.config.EMBEDDING_MODEL,
                input=batch
            )
            embeddings.extend([d["embedding"] for d in response.data])

        return embeddings
```

---

## 3. LangChain Chains

### 3.1 Conversation Chain

The core conversational experience for the "Rings of Growth" journey.

```python
# ai/chains/conversation_chain.py

from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import SystemMessage, HumanMessage, AIMessage
from typing import Dict, Any, Optional
import json

from ..prompts import CONVERSATION_SYSTEM_PROMPT, RING_PROMPTS
from ..llm import QuentoLLM

class QuentoConversationChain:
    """
    Manages the conversational flow through the Rings of Growth.
    Adapts personality and focus based on current ring phase.
    """

    RING_PHASES = ["core", "discover", "plan", "execute", "optimize"]

    def __init__(
        self,
        llm_config,
        user_context: Dict[str, Any],
        current_ring: int = 1
    ):
        self.llm = QuentoLLM(llm_config).get_chat_model(streaming=True)
        self.user_context = user_context
        self.current_ring = current_ring
        self.memory = self._create_memory()
        self.chain = self._create_chain()

    def _create_memory(self) -> ConversationBufferWindowMemory:
        """Create conversation memory with appropriate window."""
        return ConversationBufferWindowMemory(
            memory_key="chat_history",
            return_messages=True,
            k=20,  # Keep last 20 exchanges
            ai_prefix="Quento",
            human_prefix="User"
        )

    def _get_ring_context(self) -> str:
        """Get context-specific instructions for current ring."""
        ring_name = self.RING_PHASES[self.current_ring - 1]
        return RING_PROMPTS.get(ring_name, "")

    def _create_chain(self) -> ConversationChain:
        """Create the LangChain conversation chain."""

        system_prompt = f"""
{CONVERSATION_SYSTEM_PROMPT}

CURRENT RING: {self.current_ring} - {self.RING_PHASES[self.current_ring - 1].upper()}

{self._get_ring_context()}

USER CONTEXT:
{json.dumps(self.user_context, indent=2)}

Remember to:
1. Be conversational and warm, like a knowledgeable friend
2. Ask clarifying questions to better understand their business
3. Guide them naturally toward the next ring when ready
4. Reference their specific business context in responses
5. Provide actionable insights, not just generic advice
"""

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}")
        ])

        return ConversationChain(
            llm=self.llm,
            prompt=prompt,
            memory=self.memory,
            verbose=True
        )

    async def chat(self, user_message: str) -> Dict[str, Any]:
        """
        Process a user message and generate response.

        Returns:
            Dict containing response, updated ring, and metadata
        """
        response = await self.chain.ainvoke({"input": user_message})

        # Analyze if user is ready to advance to next ring
        advancement_check = await self._check_ring_advancement(
            user_message,
            response["response"]
        )

        return {
            "response": response["response"],
            "current_ring": self.current_ring,
            "should_advance": advancement_check["should_advance"],
            "advancement_reason": advancement_check.get("reason"),
            "suggested_next_action": advancement_check.get("next_action")
        }

    async def _check_ring_advancement(
        self,
        user_message: str,
        ai_response: str
    ) -> Dict[str, Any]:
        """Check if user is ready to advance to next ring."""

        if self.current_ring >= 5:
            return {"should_advance": False}

        # Use fast model for quick classification
        fast_llm = QuentoLLM(self.llm_config).get_fast_model()

        check_prompt = f"""
Based on this conversation exchange, determine if the user is ready
to advance from Ring {self.current_ring} ({self.RING_PHASES[self.current_ring - 1]})
to Ring {self.current_ring + 1} ({self.RING_PHASES[self.current_ring]}).

User said: {user_message}
AI responded: {ai_response}

Ring advancement criteria:
- Ring 1 (Core) -> Ring 2 (Discover): User has shared their business story and website/online presence
- Ring 2 (Discover) -> Ring 3 (Plan): Analysis is complete and user has reviewed findings
- Ring 3 (Plan) -> Ring 4 (Execute): Strategy is generated and user has approved priorities
- Ring 4 (Execute) -> Ring 5 (Optimize): User has completed initial action items

Respond with JSON:
{{"should_advance": boolean, "reason": "string", "next_action": "string"}}
"""

        result = await fast_llm.ainvoke(check_prompt)
        return json.loads(result.content)

    def advance_ring(self):
        """Manually advance to next ring."""
        if self.current_ring < 5:
            self.current_ring += 1
            self.chain = self._create_chain()  # Rebuild with new context

    def get_conversation_summary(self) -> str:
        """Get a summary of the conversation so far."""
        return self.memory.load_memory_variables({})
```

### 3.2 Analysis Chain

Orchestrates the web presence analysis using multiple tools.

```python
# ai/chains/analysis_chain.py

from langchain.chains import LLMChain, SequentialChain
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import asyncio

from ..tools import WebScraperTool, SEOAnalyzerTool, SocialScannerTool, CompetitorFinderTool
from ..llm import QuentoLLM

class WebsiteAnalysis(BaseModel):
    """Structured output for website analysis."""

    overall_score: int = Field(description="Overall score 0-100")

    # Content analysis
    content_quality: int = Field(description="Content quality score 0-100")
    content_summary: str = Field(description="Summary of website content")
    key_messages: List[str] = Field(description="Key messages identified")

    # Technical analysis
    seo_score: int = Field(description="SEO score 0-100")
    mobile_friendly: bool = Field(description="Is the site mobile-friendly")
    page_speed: str = Field(description="Page speed rating: fast/medium/slow")
    technical_issues: List[str] = Field(description="Technical issues found")

    # Competitive position
    competitors: List[Dict[str, Any]] = Field(description="Identified competitors")
    differentiation_opportunities: List[str] = Field(description="Ways to stand out")

    # Recommendations
    quick_wins: List[str] = Field(description="Easy improvements")
    major_recommendations: List[str] = Field(description="Significant changes needed")

class AnalysisChain:
    """
    Orchestrates comprehensive web presence analysis.
    Coordinates multiple tools and synthesizes findings.
    """

    def __init__(self, llm_config):
        self.llm = QuentoLLM(llm_config)
        self.tools = {
            "scraper": WebScraperTool(),
            "seo": SEOAnalyzerTool(),
            "social": SocialScannerTool(),
            "competitors": CompetitorFinderTool()
        }
        self.parser = PydanticOutputParser(pydantic_object=WebsiteAnalysis)

    async def analyze(
        self,
        website_url: str,
        business_context: Dict[str, Any],
        progress_callback: Optional[callable] = None
    ) -> WebsiteAnalysis:
        """
        Run comprehensive analysis on a website.

        Args:
            website_url: URL to analyze
            business_context: Context from conversation
            progress_callback: Optional callback for progress updates

        Returns:
            WebsiteAnalysis with complete findings
        """

        results = {}

        # Phase 1: Web scraping (0-25%)
        if progress_callback:
            await progress_callback(0, "Starting website scan...")

        results["scrape"] = await self.tools["scraper"].run(website_url)

        if progress_callback:
            await progress_callback(25, "Content extracted, analyzing SEO...")

        # Phase 2: SEO Analysis (25-50%)
        results["seo"] = await self.tools["seo"].run(
            website_url,
            results["scrape"]["content"]
        )

        if progress_callback:
            await progress_callback(50, "SEO analyzed, scanning social presence...")

        # Phase 3: Social scanning (50-70%)
        business_name = business_context.get("business_name", "")
        results["social"] = await self.tools["social"].run(
            business_name,
            website_url
        )

        if progress_callback:
            await progress_callback(70, "Social scanned, finding competitors...")

        # Phase 4: Competitor analysis (70-90%)
        results["competitors"] = await self.tools["competitors"].run(
            business_context.get("industry", ""),
            business_context.get("location", ""),
            website_url
        )

        if progress_callback:
            await progress_callback(90, "Synthesizing findings...")

        # Phase 5: Synthesis (90-100%)
        analysis = await self._synthesize_results(
            results,
            business_context
        )

        if progress_callback:
            await progress_callback(100, "Analysis complete!")

        return analysis

    async def _synthesize_results(
        self,
        results: Dict[str, Any],
        business_context: Dict[str, Any]
    ) -> WebsiteAnalysis:
        """Synthesize all tool results into coherent analysis."""

        synthesis_prompt = PromptTemplate(
            template="""
You are an expert digital marketing analyst. Synthesize the following
analysis results into a comprehensive, actionable report.

BUSINESS CONTEXT:
{business_context}

WEBSITE SCRAPE RESULTS:
{scrape_results}

SEO ANALYSIS:
{seo_results}

SOCIAL PRESENCE:
{social_results}

COMPETITOR ANALYSIS:
{competitor_results}

Provide a synthesis that:
1. Scores the overall web presence (0-100)
2. Identifies the most impactful improvements
3. Highlights competitive advantages and gaps
4. Prioritizes recommendations by effort vs impact

{format_instructions}
""",
            input_variables=[
                "business_context",
                "scrape_results",
                "seo_results",
                "social_results",
                "competitor_results"
            ],
            partial_variables={
                "format_instructions": self.parser.get_format_instructions()
            }
        )

        chain = LLMChain(
            llm=self.llm.get_analysis_model(),
            prompt=synthesis_prompt
        )

        result = await chain.ainvoke({
            "business_context": str(business_context),
            "scrape_results": str(results["scrape"]),
            "seo_results": str(results["seo"]),
            "social_results": str(results["social"]),
            "competitor_results": str(results["competitors"])
        })

        return self.parser.parse(result["text"])
```

### 3.3 Strategy Chain

Generates personalized business strategies based on analysis.

```python
# ai/chains/strategy_chain.py

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

from ..llm import QuentoLLM

class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Effort(str, Enum):
    LOW = "low"      # < 2 hours
    MEDIUM = "medium"  # 2-8 hours
    HIGH = "high"    # > 8 hours

class ActionItem(BaseModel):
    """Individual action item."""
    title: str
    description: str
    priority: Priority
    effort: Effort
    category: str  # website, social, seo, content, marketing
    prerequisites: List[str] = []
    expected_impact: str
    resources_needed: List[str] = []

class StrategicRecommendation(BaseModel):
    """A strategic recommendation area."""
    title: str
    summary: str
    importance: str
    current_state: str
    target_state: str
    action_items: List[ActionItem]

class BusinessStrategy(BaseModel):
    """Complete business strategy output."""

    executive_summary: str = Field(
        description="2-3 sentence summary of the strategy"
    )

    vision_statement: str = Field(
        description="Aspirational statement for the business's digital presence"
    )

    key_strengths: List[str] = Field(
        description="Current strengths to leverage"
    )

    critical_gaps: List[str] = Field(
        description="Most important gaps to address"
    )

    recommendations: List[StrategicRecommendation] = Field(
        description="Strategic recommendations by area"
    )

    quick_wins: List[ActionItem] = Field(
        description="High-impact, low-effort actions for immediate implementation"
    )

    ninety_day_priorities: List[str] = Field(
        description="Top priorities for the next 90 days"
    )

class StrategyChain:
    """
    Generates comprehensive business strategies from analysis results.
    """

    def __init__(self, llm_config):
        self.llm = QuentoLLM(llm_config)
        self.parser = PydanticOutputParser(pydantic_object=BusinessStrategy)

    async def generate_strategy(
        self,
        analysis: Dict[str, Any],
        conversation_history: List[Dict[str, str]],
        business_context: Dict[str, Any],
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> BusinessStrategy:
        """
        Generate a personalized business strategy.

        Args:
            analysis: Results from AnalysisChain
            conversation_history: Relevant conversation context
            business_context: Business details from conversation
            user_preferences: Optional constraints (budget, timeline, etc.)

        Returns:
            BusinessStrategy with complete recommendations
        """

        strategy_prompt = PromptTemplate(
            template="""
You are a world-class digital marketing strategist with expertise in
helping small and medium businesses maximize their online impact.

Create a comprehensive, actionable strategy based on:

BUSINESS PROFILE:
- Name: {business_name}
- Industry: {industry}
- Location: {location}
- Goals: {goals}
- Unique Value: {unique_value}

ANALYSIS FINDINGS:
{analysis_summary}

KEY CONVERSATION INSIGHTS:
{conversation_insights}

USER CONSTRAINTS:
{constraints}

Your strategy should:
1. Be specific to THIS business, not generic advice
2. Prioritize actions by impact and effort
3. Include quick wins they can implement today
4. Build toward a coherent 90-day plan
5. Be realistic for a small business team
6. Focus on their unique story and differentiators

The strategy should align with the Quento philosophy:
"Story First. Design Always." - Help them tell their story better.

{format_instructions}
""",
            input_variables=[
                "business_name",
                "industry",
                "location",
                "goals",
                "unique_value",
                "analysis_summary",
                "conversation_insights",
                "constraints"
            ],
            partial_variables={
                "format_instructions": self.parser.get_format_instructions()
            }
        )

        # Extract key insights from conversation
        conversation_insights = await self._extract_conversation_insights(
            conversation_history
        )

        # Format constraints
        constraints = self._format_constraints(user_preferences)

        chain = LLMChain(
            llm=self.llm.get_analysis_model(),
            prompt=strategy_prompt
        )

        result = await chain.ainvoke({
            "business_name": business_context.get("business_name", "Unknown"),
            "industry": business_context.get("industry", "Unknown"),
            "location": business_context.get("location", "Unknown"),
            "goals": ", ".join(business_context.get("goals", [])),
            "unique_value": business_context.get("unique_value", ""),
            "analysis_summary": self._format_analysis(analysis),
            "conversation_insights": conversation_insights,
            "constraints": constraints
        })

        return self.parser.parse(result["text"])

    async def _extract_conversation_insights(
        self,
        conversation_history: List[Dict[str, str]]
    ) -> str:
        """Extract key insights from conversation history."""

        if not conversation_history:
            return "No prior conversation context available."

        # Use fast model for extraction
        fast_llm = self.llm.get_fast_model()

        extraction_prompt = f"""
Extract the key business insights from this conversation:

{conversation_history[-10:]}  # Last 10 exchanges

Summarize:
1. What the business does
2. Their main challenges
3. What they've tried before
4. What success looks like to them
5. Any constraints mentioned (time, budget, skills)

Be concise but comprehensive.
"""

        result = await fast_llm.ainvoke(extraction_prompt)
        return result.content

    def _format_analysis(self, analysis: Dict[str, Any]) -> str:
        """Format analysis results for the prompt."""
        return f"""
Overall Score: {analysis.get('overall_score', 'N/A')}/100
SEO Score: {analysis.get('seo_score', 'N/A')}/100
Mobile Friendly: {analysis.get('mobile_friendly', 'Unknown')}

Key Issues:
{chr(10).join('- ' + issue for issue in analysis.get('technical_issues', []))}

Competitors:
{chr(10).join('- ' + c.get('name', 'Unknown') for c in analysis.get('competitors', []))}

Quick Wins Identified:
{chr(10).join('- ' + win for win in analysis.get('quick_wins', []))}
"""

    def _format_constraints(
        self,
        preferences: Optional[Dict[str, Any]]
    ) -> str:
        """Format user constraints for the prompt."""
        if not preferences:
            return "No specific constraints provided. Assume small business resources."

        constraints = []

        if "budget" in preferences:
            constraints.append(f"Budget: {preferences['budget']}")
        if "timeline" in preferences:
            constraints.append(f"Timeline: {preferences['timeline']}")
        if "team_size" in preferences:
            constraints.append(f"Team Size: {preferences['team_size']}")
        if "technical_skills" in preferences:
            constraints.append(f"Technical Skills: {preferences['technical_skills']}")

        return "\n".join(constraints) or "No specific constraints."
```

---

## 4. AI Tools

### 4.1 Web Scraper Tool

```python
# ai/tools/web_scraper.py

from langchain.tools import BaseTool
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
from typing import Dict, Any, Optional
import asyncio
import json

class WebScraperTool(BaseTool):
    """
    Tool for scraping and extracting content from websites.
    Uses Playwright for JavaScript-rendered content.
    """

    name = "web_scraper"
    description = """
    Scrapes a website and extracts its content, structure, and metadata.
    Input: A valid URL
    Output: Structured data about the website content
    """

    async def _arun(self, url: str) -> Dict[str, Any]:
        """Async implementation of web scraping."""

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()

            try:
                # Navigate and wait for content
                await page.goto(url, wait_until="networkidle", timeout=30000)

                # Get rendered HTML
                html = await page.content()

                # Extract metadata
                metadata = await self._extract_metadata(page)

                # Get all page links
                links = await page.evaluate("""
                    () => Array.from(document.querySelectorAll('a'))
                        .map(a => ({href: a.href, text: a.textContent.trim()}))
                        .filter(l => l.href.startsWith('http'))
                """)

                # Take screenshot
                screenshot = await page.screenshot(full_page=False)

                await browser.close()

                # Parse HTML
                soup = BeautifulSoup(html, 'html.parser')

                return {
                    "url": url,
                    "title": soup.title.string if soup.title else None,
                    "metadata": metadata,
                    "headings": self._extract_headings(soup),
                    "content": self._extract_main_content(soup),
                    "links": links[:50],  # Limit links
                    "images": self._extract_images(soup, url),
                    "has_screenshot": True
                }

            except Exception as e:
                await browser.close()
                return {
                    "url": url,
                    "error": str(e),
                    "partial_data": True
                }

    async def _extract_metadata(self, page) -> Dict[str, str]:
        """Extract meta tags from page."""
        return await page.evaluate("""
            () => {
                const meta = {};
                document.querySelectorAll('meta').forEach(m => {
                    const name = m.getAttribute('name') || m.getAttribute('property');
                    const content = m.getAttribute('content');
                    if (name && content) meta[name] = content;
                });
                return meta;
            }
        """)

    def _extract_headings(self, soup: BeautifulSoup) -> Dict[str, list]:
        """Extract heading hierarchy."""
        headings = {}
        for level in range(1, 7):
            tag = f"h{level}"
            headings[tag] = [h.get_text(strip=True) for h in soup.find_all(tag)]
        return headings

    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main text content."""
        # Remove script and style elements
        for element in soup(["script", "style", "nav", "footer", "header"]):
            element.decompose()

        # Get text
        text = soup.get_text(separator="\n", strip=True)

        # Limit length
        return text[:10000] if len(text) > 10000 else text

    def _extract_images(
        self,
        soup: BeautifulSoup,
        base_url: str
    ) -> list:
        """Extract image information."""
        images = []
        for img in soup.find_all("img")[:20]:  # Limit to 20
            images.append({
                "src": img.get("src", ""),
                "alt": img.get("alt", ""),
                "has_alt": bool(img.get("alt"))
            })
        return images

    def _run(self, url: str) -> Dict[str, Any]:
        """Sync wrapper for async implementation."""
        return asyncio.run(self._arun(url))
```

### 4.2 SEO Analyzer Tool

```python
# ai/tools/seo_analyzer.py

from langchain.tools import BaseTool
from typing import Dict, Any, List
import re

class SEOAnalyzerTool(BaseTool):
    """
    Analyzes website content for SEO best practices.
    """

    name = "seo_analyzer"
    description = """
    Analyzes scraped website content for SEO optimization opportunities.
    Input: Website URL and scraped content
    Output: SEO score and recommendations
    """

    async def _arun(
        self,
        url: str,
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze content for SEO factors."""

        scores = {}
        issues = []
        recommendations = []

        # Title analysis
        title = content.get("title", "")
        scores["title"] = self._analyze_title(title, issues, recommendations)

        # Meta description
        meta_desc = content.get("metadata", {}).get("description", "")
        scores["meta_description"] = self._analyze_meta_description(
            meta_desc, issues, recommendations
        )

        # Heading structure
        headings = content.get("headings", {})
        scores["headings"] = self._analyze_headings(
            headings, issues, recommendations
        )

        # Content analysis
        text_content = content.get("content", "")
        scores["content"] = self._analyze_content(
            text_content, issues, recommendations
        )

        # Image optimization
        images = content.get("images", [])
        scores["images"] = self._analyze_images(
            images, issues, recommendations
        )

        # Calculate overall score
        overall = sum(scores.values()) / len(scores) if scores else 0

        return {
            "url": url,
            "overall_score": round(overall),
            "category_scores": scores,
            "issues": issues,
            "recommendations": recommendations,
            "priority_fixes": self._prioritize_fixes(issues, recommendations)
        }

    def _analyze_title(
        self,
        title: str,
        issues: List[str],
        recommendations: List[str]
    ) -> int:
        """Analyze page title."""
        score = 100

        if not title:
            issues.append("Missing page title")
            recommendations.append("Add a descriptive page title")
            return 0

        if len(title) < 30:
            score -= 20
            issues.append("Title too short (under 30 characters)")
            recommendations.append("Expand title to 50-60 characters")
        elif len(title) > 60:
            score -= 10
            issues.append("Title too long (over 60 characters)")
            recommendations.append("Shorten title to under 60 characters")

        return max(0, score)

    def _analyze_meta_description(
        self,
        description: str,
        issues: List[str],
        recommendations: List[str]
    ) -> int:
        """Analyze meta description."""
        score = 100

        if not description:
            issues.append("Missing meta description")
            recommendations.append("Add a compelling meta description (150-160 chars)")
            return 0

        if len(description) < 120:
            score -= 30
            issues.append("Meta description too short")
        elif len(description) > 160:
            score -= 15
            issues.append("Meta description too long")

        return max(0, score)

    def _analyze_headings(
        self,
        headings: Dict[str, List[str]],
        issues: List[str],
        recommendations: List[str]
    ) -> int:
        """Analyze heading structure."""
        score = 100

        h1s = headings.get("h1", [])

        if len(h1s) == 0:
            score -= 40
            issues.append("No H1 heading found")
            recommendations.append("Add a single, descriptive H1 heading")
        elif len(h1s) > 1:
            score -= 20
            issues.append(f"Multiple H1 headings found ({len(h1s)})")
            recommendations.append("Use only one H1 per page")

        # Check for heading hierarchy
        h2s = headings.get("h2", [])
        if len(h2s) < 2 and len(headings.get("content", "")) > 1000:
            score -= 15
            issues.append("Insufficient subheadings for content length")
            recommendations.append("Break content into sections with H2 headings")

        return max(0, score)

    def _analyze_content(
        self,
        content: str,
        issues: List[str],
        recommendations: List[str]
    ) -> int:
        """Analyze main content."""
        score = 100

        word_count = len(content.split())

        if word_count < 300:
            score -= 30
            issues.append(f"Thin content ({word_count} words)")
            recommendations.append("Add more substantive content (aim for 500+ words)")
        elif word_count < 500:
            score -= 15
            issues.append("Content could be more comprehensive")

        return max(0, score)

    def _analyze_images(
        self,
        images: List[Dict],
        issues: List[str],
        recommendations: List[str]
    ) -> int:
        """Analyze image optimization."""
        if not images:
            return 80  # No images isn't necessarily bad

        images_without_alt = [img for img in images if not img.get("has_alt")]

        if images_without_alt:
            pct_missing = len(images_without_alt) / len(images) * 100
            score = 100 - pct_missing
            if pct_missing > 50:
                issues.append(f"{len(images_without_alt)} images missing alt text")
                recommendations.append("Add descriptive alt text to all images")
            return max(0, int(score))

        return 100

    def _prioritize_fixes(
        self,
        issues: List[str],
        recommendations: List[str]
    ) -> List[Dict[str, str]]:
        """Prioritize fixes by impact."""
        priority_keywords = {
            "high": ["missing", "no h1", "title"],
            "medium": ["too short", "too long", "insufficient"],
            "low": ["could be", "consider"]
        }

        prioritized = []
        for issue, rec in zip(issues, recommendations):
            priority = "medium"
            issue_lower = issue.lower()

            for level, keywords in priority_keywords.items():
                if any(kw in issue_lower for kw in keywords):
                    priority = level
                    break

            prioritized.append({
                "issue": issue,
                "recommendation": rec,
                "priority": priority
            })

        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2}
        return sorted(prioritized, key=lambda x: priority_order[x["priority"]])

    def _run(self, url: str, content: Dict[str, Any]) -> Dict[str, Any]:
        """Sync wrapper."""
        import asyncio
        return asyncio.run(self._arun(url, content))
```

---

## 5. Prompts Library

```python
# ai/prompts/system_prompts.py

CONVERSATION_SYSTEM_PROMPT = """
You are Quento, an AI business growth advisor with deep expertise in
digital marketing, web design, and brand strategy.

Your personality:
- Warm and encouraging, like a knowledgeable friend
- Curious and genuinely interested in the user's business
- Direct but kind when pointing out areas for improvement
- Focused on actionable advice, not generic platitudes
- Story-oriented: you believe every business has a unique story worth telling

Your approach:
- Ask thoughtful questions to understand their business deeply
- Listen for the unique aspects that make them special
- Connect their story to practical marketing strategies
- Balance aspiration with realistic next steps
- Celebrate their wins, however small

Never:
- Give generic advice that could apply to any business
- Overwhelm with too many suggestions at once
- Be condescending about their current efforts
- Make assumptions without asking
- Promise unrealistic results

Always:
- Reference specific details they've shared
- Tie recommendations back to their goals
- Explain the "why" behind suggestions
- Offer to dive deeper on any topic
- Remember you're guiding them through the Rings of Growth
"""

RING_PROMPTS = {
    "core": """
RING 1 - CORE: Understanding Their Story

Your focus in this ring:
- Learn who they are and what they do
- Understand their origin story and passion
- Discover what makes them unique
- Learn about their current customers
- Understand their goals and dreams

Key questions to explore:
- What does your business do?
- How did you get started?
- What makes you different from others in your field?
- Who are your ideal customers?
- What does success look like for you?

When ready to advance: They've shared their story and you have a clear
picture of their business, values, and goals. Ask if they have a website
to analyze.
""",

    "discover": """
RING 2 - DISCOVER: Analyzing Their Presence

Your focus in this ring:
- Guide them through the analysis process
- Explain what you're looking for and why
- Help them understand the findings
- Contextualize results to their specific situation
- Identify both strengths and opportunities

Key areas to discuss:
- Their website's first impression
- How well it tells their story
- Technical aspects (SEO, mobile, speed)
- How they compare to competitors
- Their social media presence

When ready to advance: Analysis is complete and they understand their
current state. They're ready to discuss strategy.
""",

    "plan": """
RING 3 - PLAN: Creating Their Strategy

Your focus in this ring:
- Present strategic recommendations
- Prioritize actions by impact and effort
- Ensure recommendations align with their goals
- Help them understand the reasoning
- Get buy-in on the approach

Key elements to cover:
- Vision for their digital presence
- Priority focus areas
- Quick wins vs. longer-term initiatives
- Resource requirements
- Success metrics

When ready to advance: They've reviewed and approved the strategy,
and are ready to start implementation.
""",

    "execute": """
RING 4 - EXECUTE: Taking Action

Your focus in this ring:
- Break strategy into actionable tasks
- Provide guidance on implementation
- Answer questions as they work
- Help troubleshoot obstacles
- Celebrate completed tasks

Key support areas:
- Step-by-step guidance on tasks
- Resource recommendations
- Priority management
- Motivation and encouragement
- Problem-solving

When ready to advance: They've completed initial action items and
are ready for ongoing optimization.
""",

    "optimize": """
RING 5 - OPTIMIZE: Continuous Growth

Your focus in this ring:
- Review progress and results
- Suggest ongoing improvements
- Recommend when to re-analyze
- Introduce new opportunities
- Maintain momentum

Key activities:
- Reviewing metrics and progress
- Suggesting next-level optimizations
- Identifying new opportunities
- Seasonal or timely recommendations
- Long-term growth planning

This is an ongoing phase: Continue to support their growth journey
with fresh insights and recommendations.
"""
}
```

---

## 6. Cost Management

### 6.1 Token Optimization

```python
# ai/cost_management.py

from dataclasses import dataclass
from typing import Dict, Optional
import tiktoken

@dataclass
class UsageLimits:
    """Per-user usage limits."""
    daily_tokens: int = 50000
    daily_analyses: int = 3
    daily_strategies: int = 2

class CostManager:
    """Manages AI usage costs and limits."""

    # Approximate costs per 1K tokens (as of 2024)
    MODEL_COSTS = {
        "gpt-4o": {"input": 0.005, "output": 0.015},
        "gpt-4o-mini": {"input": 0.00015, "output": 0.0006},
        "claude-3-5-sonnet-20241022": {"input": 0.003, "output": 0.015},
    }

    def __init__(self, redis_client):
        self.redis = redis_client
        self.encoder = tiktoken.get_encoding("cl100k_base")

    def count_tokens(self, text: str) -> int:
        """Count tokens in text."""
        return len(self.encoder.encode(text))

    async def check_limits(self, user_id: str) -> Dict[str, bool]:
        """Check if user is within usage limits."""
        usage = await self._get_usage(user_id)
        limits = UsageLimits()

        return {
            "tokens_ok": usage["tokens"] < limits.daily_tokens,
            "analyses_ok": usage["analyses"] < limits.daily_analyses,
            "strategies_ok": usage["strategies"] < limits.daily_strategies,
            "usage": usage,
            "limits": {
                "tokens": limits.daily_tokens,
                "analyses": limits.daily_analyses,
                "strategies": limits.daily_strategies
            }
        }

    async def record_usage(
        self,
        user_id: str,
        tokens: int,
        usage_type: str = "chat"
    ):
        """Record token usage for a user."""
        key = f"usage:{user_id}:{self._get_date_key()}"

        await self.redis.hincrby(key, "tokens", tokens)
        await self.redis.hincrby(key, usage_type, 1)
        await self.redis.expire(key, 86400 * 2)  # Expire after 2 days

    def estimate_cost(
        self,
        input_tokens: int,
        output_tokens: int,
        model: str = "gpt-4o"
    ) -> float:
        """Estimate cost for a request."""
        costs = self.MODEL_COSTS.get(model, self.MODEL_COSTS["gpt-4o"])

        input_cost = (input_tokens / 1000) * costs["input"]
        output_cost = (output_tokens / 1000) * costs["output"]

        return input_cost + output_cost
```

---

## 7. Error Handling & Fallbacks

```python
# ai/resilience.py

from typing import Any, Callable, List, Optional
import asyncio
import logging
from functools import wraps

logger = logging.getLogger(__name__)

class AIResilience:
    """Resilience patterns for AI operations."""

    @staticmethod
    def with_retry(
        max_retries: int = 3,
        delay: float = 1.0,
        backoff: float = 2.0,
        exceptions: tuple = (Exception,)
    ):
        """Decorator for retry logic with exponential backoff."""

        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                last_exception = None
                current_delay = delay

                for attempt in range(max_retries):
                    try:
                        return await func(*args, **kwargs)
                    except exceptions as e:
                        last_exception = e
                        logger.warning(
                            f"Attempt {attempt + 1}/{max_retries} failed: {e}"
                        )

                        if attempt < max_retries - 1:
                            await asyncio.sleep(current_delay)
                            current_delay *= backoff

                raise last_exception

            return wrapper
        return decorator

    @staticmethod
    def with_fallback(fallback_func: Callable):
        """Decorator to provide fallback on failure."""

        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    logger.error(f"Primary function failed: {e}, using fallback")
                    return await fallback_func(*args, **kwargs)

            return wrapper
        return decorator

    @staticmethod
    def with_timeout(seconds: float = 30.0):
        """Decorator for operation timeout."""

        def decorator(func: Callable):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                try:
                    return await asyncio.wait_for(
                        func(*args, **kwargs),
                        timeout=seconds
                    )
                except asyncio.TimeoutError:
                    raise TimeoutError(
                        f"Operation timed out after {seconds} seconds"
                    )

            return wrapper
        return decorator

# Example usage
class ResilientAIService:
    """AI service with built-in resilience."""

    @AIResilience.with_retry(max_retries=3)
    @AIResilience.with_timeout(seconds=60)
    async def generate_response(self, prompt: str) -> str:
        # AI call implementation
        pass

    @AIResilience.with_fallback(fallback_func=lambda: {"status": "unavailable"})
    async def analyze_website(self, url: str) -> dict:
        # Analysis implementation
        pass
```

---

*AI Integration documentation maintained by ServiceVision AI Development Team*
