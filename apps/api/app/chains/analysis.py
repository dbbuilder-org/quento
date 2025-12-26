"""
Analysis Chain - AI-powered Website Analysis

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from typing import Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_community.chat_models import ChatLiteLLM
from pydantic import BaseModel, Field

from app.config import settings


class AnalysisInsights(BaseModel):
    """Structured analysis insights from AI."""

    summary: str = Field(description="Brief summary of the website analysis")
    strengths: list[str] = Field(description="Key strengths identified")
    weaknesses: list[str] = Field(description="Key weaknesses or areas for improvement")
    opportunities: list[str] = Field(description="Growth opportunities")
    threats: list[str] = Field(description="Potential threats or challenges")
    quick_wins: list[str] = Field(description="Easy improvements with high impact")
    priority_recommendations: list[str] = Field(description="Top 3 priority actions")


class AnalysisChain:
    """
    Chain for generating AI insights from website analysis data.

    Transforms raw analysis data into actionable insights using LLM.
    """

    ANALYSIS_PROMPT = """You are an expert digital marketing and web presence analyst.
Analyze the following website data and provide strategic insights.

Website: {website_url}
Overall Score: {overall_score}/100

Scores:
- SEO: {seo_score}/100
- Content: {content_score}/100
- Mobile: {mobile_score}/100
- Speed: {speed_score}/100
- Social: {social_score}/100

Content Analysis:
{content_analysis}

SEO Analysis:
{seo_analysis}

Competitor Information:
{competitors}

Provide a comprehensive analysis with actionable insights.
Focus on practical recommendations that will have real impact on their business growth."""

    def __init__(
        self,
        model: str = None,
        temperature: float = 0.3,
    ):
        """Initialize the analysis chain."""
        self.model = model or settings.LLM_MODEL
        self.llm = ChatLiteLLM(
            model=self.model,
            temperature=temperature,
            max_tokens=2000,
        )
        self.output_parser = JsonOutputParser(pydantic_object=AnalysisInsights)

    async def generate_insights(
        self,
        website_url: str,
        analysis_results: dict,
    ) -> AnalysisInsights:
        """
        Generate AI insights from analysis results.

        Args:
            website_url: The analyzed website URL
            analysis_results: Raw analysis data

        Returns:
            Structured analysis insights
        """
        scores = analysis_results.get("scores", {})

        prompt = ChatPromptTemplate.from_messages([
            ("system", self.ANALYSIS_PROMPT),
            ("human", "Generate insights in this JSON format:\n{format_instructions}"),
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
            "content_analysis": self._format_dict(
                analysis_results.get("content_analysis", {})
            ),
            "seo_analysis": self._format_dict(
                analysis_results.get("seo_analysis", {})
            ),
            "competitors": self._format_competitors(
                analysis_results.get("competitors", [])
            ),
            "format_instructions": self.output_parser.get_format_instructions(),
        })

        return AnalysisInsights(**result)

    async def generate_summary(
        self,
        website_url: str,
        analysis_results: dict,
    ) -> str:
        """Generate a natural language summary of the analysis."""
        scores = analysis_results.get("scores", {})
        overall = analysis_results.get("overall_score", 50)

        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a friendly digital marketing expert.
Create a conversational summary of this website analysis for a business owner.
Be encouraging but honest. Focus on opportunities, not problems."""),
            ("human", """Website: {website_url}
Overall Score: {overall_score}/100
SEO: {seo_score}, Content: {content_score}, Mobile: {mobile_score}

Key Issues: {issues}

Summarize this in 2-3 friendly paragraphs."""),
        ])

        # Collect issues
        issues = []
        content = analysis_results.get("content_analysis", {})
        issues.extend(content.get("issues", []))
        seo = analysis_results.get("seo_analysis", {})
        for issue in seo.get("issues", []):
            if isinstance(issue, dict):
                issues.append(issue.get("issue", ""))
            else:
                issues.append(str(issue))

        chain = prompt | self.llm

        result = await chain.ainvoke({
            "website_url": website_url,
            "overall_score": overall,
            "seo_score": scores.get("seo", 50),
            "content_score": scores.get("content", 50),
            "mobile_score": scores.get("mobile", 50),
            "issues": ", ".join(issues[:5]) if issues else "None significant",
        })

        return result.content if hasattr(result, "content") else str(result)

    def _format_dict(self, data: dict) -> str:
        """Format dictionary for prompt inclusion."""
        lines = []
        for key, value in data.items():
            if isinstance(value, list):
                if value:
                    lines.append(f"{key}:")
                    for item in value[:5]:
                        if isinstance(item, dict):
                            lines.append(f"  - {item}")
                        else:
                            lines.append(f"  - {item}")
            elif isinstance(value, dict):
                lines.append(f"{key}: {value}")
            else:
                lines.append(f"{key}: {value}")
        return "\n".join(lines) if lines else "No data available"

    def _format_competitors(self, competitors: list) -> str:
        """Format competitor data for prompt."""
        if not competitors:
            return "No competitor data available"

        lines = []
        for comp in competitors[:3]:
            if isinstance(comp, dict):
                name = comp.get("name", "Unknown")
                score = comp.get("seo_score", "N/A")
                strengths = comp.get("strengths", [])
                lines.append(f"- {name} (Score: {score})")
                for s in strengths[:2]:
                    lines.append(f"    - {s}")

        return "\n".join(lines)


def get_analysis_chain(model: str = None) -> AnalysisChain:
    """Factory function to create analysis chain."""
    return AnalysisChain(model=model)
