"""
Strategy Chain - AI-powered Strategy Generation

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from typing import Optional
from datetime import date, timedelta
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_community.chat_models import ChatLiteLLM
from pydantic import BaseModel, Field

from app.config import settings


class StrategicRecommendation(BaseModel):
    """A strategic recommendation."""

    id: str = Field(description="Unique identifier for the recommendation")
    title: str = Field(description="Short title for the recommendation")
    priority: str = Field(description="Priority level: high, medium, or low")
    summary: str = Field(description="Brief description of the recommendation")
    impact: str = Field(description="Expected impact of implementing this")
    current_state: str = Field(description="Description of current situation")
    target_state: str = Field(description="Description of desired end state")


class ActionItem(BaseModel):
    """An actionable task."""

    title: str = Field(description="Short task title")
    description: str = Field(description="Detailed description of the task")
    priority: str = Field(description="Priority: high, medium, or low")
    effort: str = Field(description="Effort level: small, medium, or large")
    category: str = Field(description="Category: SEO, Content, Mobile, Speed, Social")
    due_days: int = Field(description="Number of days from now for due date")


class StrategyOutput(BaseModel):
    """Complete strategy output from AI."""

    executive_summary: str = Field(description="Executive summary of the strategy")
    vision_statement: str = Field(description="Vision statement for growth")
    key_strengths: list[str] = Field(description="Key strengths identified")
    critical_gaps: list[str] = Field(description="Critical gaps to address")
    recommendations: list[StrategicRecommendation] = Field(description="Strategic recommendations")
    ninety_day_priorities: list[str] = Field(description="Top priorities for next 90 days")
    action_items: list[ActionItem] = Field(description="Specific action items")


class StrategyChain:
    """
    Chain for generating comprehensive business growth strategies.

    Uses AI to transform analysis data into actionable strategic plans.
    """

    STRATEGY_PROMPT = """You are an expert business strategist and digital marketing consultant.
Based on the following website analysis, create a comprehensive growth strategy.

Business Information:
- Website: {website_url}
- Overall Score: {overall_score}/100

Performance Scores:
- SEO: {seo_score}/100
- Content: {content_score}/100
- Mobile: {mobile_score}/100
- Speed: {speed_score}/100
- Social: {social_score}/100

Analysis Findings:
{analysis_findings}

Quick Wins Identified:
{quick_wins}

Create a strategic plan that:
1. Provides an executive summary that inspires action
2. Articulates a clear vision for digital growth
3. Identifies 3-5 key strengths to leverage
4. Highlights 3-5 critical gaps to address
5. Provides 4-6 strategic recommendations with clear priorities
6. Lists 5 priorities for the next 90 days
7. Breaks down into 8-12 specific action items with realistic timeframes

Be specific, actionable, and prioritize based on impact and effort.
Focus on quick wins in the first 30 days, medium-term improvements in days 31-60,
and strategic initiatives for days 61-90."""

    def __init__(
        self,
        model: str = None,
        temperature: float = 0.4,
    ):
        """Initialize the strategy chain."""
        self.model = model or settings.LLM_MODEL
        self.llm = ChatLiteLLM(
            model=self.model,
            temperature=temperature,
            max_tokens=3000,
        )
        self.output_parser = JsonOutputParser(pydantic_object=StrategyOutput)

    async def generate_strategy(
        self,
        website_url: str,
        analysis_results: dict,
        business_context: dict = None,
    ) -> StrategyOutput:
        """
        Generate a comprehensive strategy from analysis results.

        Args:
            website_url: The analyzed website URL
            analysis_results: Raw analysis data
            business_context: Additional business context from conversation

        Returns:
            Complete strategy output
        """
        scores = analysis_results.get("scores", {})

        # Format analysis findings
        findings = self._format_findings(analysis_results)
        quick_wins = analysis_results.get("quick_wins", [])

        prompt = ChatPromptTemplate.from_messages([
            ("system", self.STRATEGY_PROMPT),
            ("human", """Generate a comprehensive strategy in this JSON format:
{format_instructions}

Remember to be specific and actionable. Each recommendation should have clear next steps."""),
        ])

        chain = prompt | self.llm | self.output_parser

        result = await chain.ainvoke({
            "website_url": website_url,
            "overall_score": analysis_results.get("overall_score", 50),
            "seo_score": scores.get("seo", 50),
            "content_score": scores.get("content", 50),
            "mobile_score": scores.get("mobile", 50),
            "speed_score": scores.get("speed", 50),
            "social_score": scores.get("social", 50),
            "analysis_findings": findings,
            "quick_wins": "\n".join([f"- {w}" for w in quick_wins]) if quick_wins else "None identified",
            "format_instructions": self.output_parser.get_format_instructions(),
        })

        return StrategyOutput(**result)

    async def generate_executive_summary(
        self,
        website_url: str,
        analysis_results: dict,
    ) -> str:
        """Generate just the executive summary."""
        scores = analysis_results.get("scores", {})
        overall = analysis_results.get("overall_score", 50)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a business strategist writing an executive summary.
Be inspiring yet realistic. Focus on the opportunity ahead."""),
            ("human", """Website: {website_url}
Overall Score: {overall}/100
Scores: SEO {seo}, Content {content}, Mobile {mobile}, Speed {speed}, Social {social}

Write a compelling 2-paragraph executive summary that:
1. Acknowledges current state objectively
2. Paints an inspiring picture of what's possible
3. Hints at the strategic approach without details"""),
        ])

        chain = prompt | self.llm

        result = await chain.ainvoke({
            "website_url": website_url,
            "overall": overall,
            "seo": scores.get("seo", 50),
            "content": scores.get("content", 50),
            "mobile": scores.get("mobile", 50),
            "speed": scores.get("speed", 50),
            "social": scores.get("social", 50),
        })

        return result.content if hasattr(result, "content") else str(result)

    async def prioritize_actions(
        self,
        action_items: list[dict],
        business_goals: list[str] = None,
    ) -> list[dict]:
        """
        Re-prioritize action items based on business goals.

        Args:
            action_items: List of action items
            business_goals: User's stated business goals

        Returns:
            Prioritized and ordered action items
        """
        if not action_items:
            return []

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are helping prioritize business actions.
Consider impact, effort, dependencies, and alignment with goals."""),
            ("human", """Action Items:
{actions}

Business Goals:
{goals}

Reorder these actions by priority. Output as JSON array with 'title' and 'priority_rank' (1 = highest)."""),
        ])

        actions_str = "\n".join([
            f"- {a.get('title')}: {a.get('description', '')} (Effort: {a.get('effort', 'medium')})"
            for a in action_items
        ])

        goals_str = "\n".join([f"- {g}" for g in (business_goals or ["Grow online presence"])])

        chain = prompt | self.llm

        try:
            result = await chain.ainvoke({
                "actions": actions_str,
                "goals": goals_str,
            })

            # Parse and apply priorities
            import json
            content = result.content if hasattr(result, "content") else str(result)

            # Extract JSON from response
            start = content.find("[")
            end = content.rfind("]") + 1
            if start >= 0 and end > start:
                priorities = json.loads(content[start:end])

                # Create lookup
                priority_map = {
                    p.get("title", "").lower(): p.get("priority_rank", 99)
                    for p in priorities
                }

                # Sort original items
                return sorted(
                    action_items,
                    key=lambda x: priority_map.get(x.get("title", "").lower(), 99)
                )
        except Exception:
            pass

        return action_items

    def _format_findings(self, analysis_results: dict) -> str:
        """Format analysis findings for the prompt."""
        lines = []

        # Content analysis
        content = analysis_results.get("content_analysis", {})
        if content:
            lines.append("Content:")
            if content.get("title"):
                lines.append(f"  Title: {content['title']}")
            if content.get("word_count"):
                lines.append(f"  Word Count: {content['word_count']}")
            for issue in content.get("issues", [])[:3]:
                lines.append(f"  Issue: {issue}")

        # SEO analysis
        seo = analysis_results.get("seo_analysis", {})
        if seo:
            lines.append("\nSEO:")
            img = seo.get("image_optimization", {})
            if img:
                lines.append(f"  Images: {img.get('with_alt', 0)}/{img.get('total', 0)} with alt text")
            lines.append(f"  Mobile Ready: {seo.get('mobile_ready', False)}")
            lines.append(f"  Has Canonical: {seo.get('has_canonical', False)}")
            for issue in seo.get("issues", [])[:3]:
                if isinstance(issue, dict):
                    lines.append(f"  Issue ({issue.get('severity', 'medium')}): {issue.get('issue', '')}")

        # Competitors
        competitors = analysis_results.get("competitors", [])
        if competitors:
            lines.append("\nCompetitors:")
            for comp in competitors[:2]:
                if isinstance(comp, dict):
                    lines.append(f"  {comp.get('name', 'Unknown')}: Score {comp.get('seo_score', 'N/A')}")

        return "\n".join(lines) if lines else "No detailed findings available"


def get_strategy_chain(model: str = None) -> StrategyChain:
    """Factory function to create strategy chain."""
    return StrategyChain(model=model)
