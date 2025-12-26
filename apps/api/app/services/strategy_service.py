"""
Strategy Service - Strategy Generation and Management

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime, date, timedelta
from typing import Optional
from uuid import UUID
import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.strategy import Strategy, ActionItem, StrategyStatus, ActionStatus, Priority, Effort
from app.models.analysis import Analysis
from app.schemas.strategy import (
    StrategyGenerateRequest,
    StrategyResponse,
    ActionItemResponse,
    RecommendationResponse,
    ActionItemUpdate,
)
from app.core.exceptions import NotFoundError, ValidationError


class StrategyService:
    """Service for strategy generation and management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_strategy(
        self, user_id: UUID, data: StrategyGenerateRequest
    ) -> Strategy:
        """Generate a new strategy based on analysis results."""
        # Get analysis
        result = await self.db.execute(
            select(Analysis).where(
                Analysis.id == data.analysis_id,
                Analysis.user_id == user_id,
            )
        )
        analysis = result.scalar_one_or_none()

        if not analysis:
            raise NotFoundError(f"Analysis {data.analysis_id} not found")

        if not analysis.results:
            raise ValidationError("Analysis not yet completed")

        # Create strategy
        strategy = Strategy(
            user_id=user_id,
            analysis_id=analysis.id,
            title=f"Growth Strategy for {analysis.website_url}",
            status=StrategyStatus.GENERATING,
        )

        self.db.add(strategy)
        await self.db.commit()
        await self.db.refresh(strategy)

        # Generate strategy in background
        asyncio.create_task(self._generate_strategy_content(strategy.id, analysis))

        return strategy

    async def get_strategy(self, strategy_id: UUID, user_id: UUID) -> Strategy:
        """Get strategy by ID."""
        result = await self.db.execute(
            select(Strategy)
            .options(selectinload(Strategy.action_items))
            .where(
                Strategy.id == strategy_id,
                Strategy.user_id == user_id,
            )
        )
        strategy = result.scalar_one_or_none()

        if not strategy:
            raise NotFoundError(f"Strategy {strategy_id} not found")

        return strategy

    async def get_strategy_response(
        self, strategy_id: UUID, user_id: UUID
    ) -> StrategyResponse:
        """Get full strategy response."""
        strategy = await self.get_strategy(strategy_id, user_id)

        return StrategyResponse(
            id=strategy.id,
            title=strategy.title,
            status=strategy.status,
            executive_summary=strategy.executive_summary,
            vision_statement=strategy.vision_statement,
            key_strengths=strategy.key_strengths or [],
            critical_gaps=strategy.critical_gaps or [],
            recommendations=[
                RecommendationResponse(**r)
                for r in (strategy.recommendations or [])
            ],
            action_items=[
                ActionItemResponse.model_validate(a)
                for a in strategy.action_items
            ],
            ninety_day_priorities=strategy.ninety_day_priorities or [],
            created_at=strategy.created_at,
            updated_at=strategy.updated_at,
        )

    async def list_strategies(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[Strategy]:
        """List user's strategies."""
        result = await self.db.execute(
            select(Strategy)
            .where(Strategy.user_id == user_id)
            .order_by(Strategy.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def update_action_item(
        self, user_id: UUID, update: ActionItemUpdate
    ) -> ActionItem:
        """Update an action item status."""
        result = await self.db.execute(
            select(ActionItem)
            .join(Strategy)
            .where(
                ActionItem.id == update.action_id,
                Strategy.user_id == user_id,
            )
        )
        action = result.scalar_one_or_none()

        if not action:
            raise NotFoundError(f"Action item {update.action_id} not found")

        action.status = update.status
        if update.notes:
            action.notes = update.notes
        if update.status == ActionStatus.COMPLETED:
            action.completed_at = datetime.utcnow()

        await self.db.commit()
        await self.db.refresh(action)

        return action

    async def _generate_strategy_content(
        self, strategy_id: UUID, analysis: Analysis
    ) -> None:
        """Generate strategy content (background task)."""
        from app.db.database import async_session_maker

        async with async_session_maker() as db:
            try:
                # Get strategy
                result = await db.execute(
                    select(Strategy).where(Strategy.id == strategy_id)
                )
                strategy = result.scalar_one_or_none()
                if not strategy:
                    return

                results = analysis.results or {}

                # Generate executive summary
                overall_score = results.get("overall_score", 50)
                strategy.executive_summary = self._generate_executive_summary(
                    analysis.website_url, overall_score, results
                )

                # Generate vision statement
                strategy.vision_statement = (
                    f"Transform {analysis.website_url} into a high-performing "
                    "digital presence that drives measurable business growth "
                    "through optimized content, improved user experience, and "
                    "strategic marketing initiatives."
                )

                # Identify strengths and gaps
                strategy.key_strengths = self._identify_strengths(results)
                strategy.critical_gaps = self._identify_gaps(results)

                # Generate recommendations
                strategy.recommendations = self._generate_recommendations(results)

                # Generate 90-day priorities
                strategy.ninety_day_priorities = self._generate_90_day_priorities(results)

                # Update status
                strategy.status = StrategyStatus.READY
                await db.commit()

                # Generate action items
                await self._generate_action_items(db, strategy_id, results)

            except Exception as e:
                result = await db.execute(
                    select(Strategy).where(Strategy.id == strategy_id)
                )
                strategy = result.scalar_one_or_none()
                if strategy:
                    strategy.status = StrategyStatus.FAILED
                    await db.commit()

    def _generate_executive_summary(
        self, url: str, score: int, results: dict
    ) -> str:
        """Generate executive summary."""
        scores = results.get("scores", {})

        if score >= 80:
            assessment = "performing well"
            outlook = "fine-tuning for excellence"
        elif score >= 60:
            assessment = "has a solid foundation"
            outlook = "strategic improvements"
        elif score >= 40:
            assessment = "has significant opportunities for improvement"
            outlook = "focused optimization"
        else:
            assessment = "requires immediate attention"
            outlook = "foundational rebuilding"

        return (
            f"Based on our comprehensive analysis, {url} {assessment} "
            f"with an overall score of {score}/100. "
            f"The website scores {scores.get('seo', 50)}/100 for SEO, "
            f"{scores.get('content', 50)}/100 for content quality, "
            f"and {scores.get('mobile', 50)}/100 for mobile experience. "
            f"Our recommended strategy focuses on {outlook} to maximize "
            "your digital presence and drive business growth."
        )

    def _identify_strengths(self, results: dict) -> list[str]:
        """Identify key strengths from analysis."""
        strengths = []
        scores = results.get("scores", {})

        if scores.get("seo", 0) >= 70:
            strengths.append("Strong SEO foundation")
        if scores.get("content", 0) >= 70:
            strengths.append("Quality content presence")
        if scores.get("mobile", 0) >= 70:
            strengths.append("Good mobile responsiveness")
        if scores.get("speed", 0) >= 70:
            strengths.append("Fast page load times")

        seo = results.get("seo_analysis", {})
        if seo.get("image_optimization", {}).get("score", 0) >= 80:
            strengths.append("Well-optimized images")
        if seo.get("has_canonical"):
            strengths.append("Proper canonical URL setup")

        if not strengths:
            strengths.append("Opportunity for significant improvement")

        return strengths

    def _identify_gaps(self, results: dict) -> list[str]:
        """Identify critical gaps from analysis."""
        gaps = []
        scores = results.get("scores", {})

        if scores.get("seo", 100) < 50:
            gaps.append("SEO optimization needs work")
        if scores.get("content", 100) < 50:
            gaps.append("Content quality and depth")
        if scores.get("mobile", 100) < 50:
            gaps.append("Mobile user experience")
        if scores.get("speed", 100) < 50:
            gaps.append("Page speed optimization")
        if scores.get("social", 100) < 50:
            gaps.append("Social media integration")

        content = results.get("content_analysis", {})
        for issue in content.get("issues", []):
            if issue not in [g.lower() for g in gaps]:
                gaps.append(issue.capitalize())

        return gaps[:5]  # Top 5 gaps

    def _generate_recommendations(self, results: dict) -> list[dict]:
        """Generate strategic recommendations."""
        recommendations = []
        scores = results.get("scores", {})

        # SEO recommendations
        if scores.get("seo", 100) < 80:
            recommendations.append({
                "id": "seo-optimization",
                "title": "Enhance SEO Performance",
                "priority": Priority.HIGH.value,
                "summary": "Implement technical SEO improvements to boost search visibility",
                "impact": "Increase organic traffic by 30-50%",
                "current_state": f"Current SEO score: {scores.get('seo', 50)}/100",
                "target_state": "Target SEO score: 85+/100",
            })

        # Content recommendations
        if scores.get("content", 100) < 80:
            recommendations.append({
                "id": "content-strategy",
                "title": "Content Strategy Enhancement",
                "priority": Priority.HIGH.value,
                "summary": "Develop comprehensive content that addresses user needs",
                "impact": "Improve engagement and reduce bounce rate",
                "current_state": f"Current content score: {scores.get('content', 50)}/100",
                "target_state": "Target content score: 80+/100",
            })

        # Mobile recommendations
        if scores.get("mobile", 100) < 70:
            recommendations.append({
                "id": "mobile-optimization",
                "title": "Mobile Experience Optimization",
                "priority": Priority.MEDIUM.value,
                "summary": "Optimize for mobile users who make up 60%+ of traffic",
                "impact": "Capture more mobile conversions",
                "current_state": f"Current mobile score: {scores.get('mobile', 50)}/100",
                "target_state": "Target mobile score: 90+/100",
            })

        # Speed recommendations
        if scores.get("speed", 100) < 70:
            recommendations.append({
                "id": "speed-improvement",
                "title": "Page Speed Improvement",
                "priority": Priority.MEDIUM.value,
                "summary": "Reduce load times for better user experience",
                "impact": "Every 1s improvement = 7% more conversions",
                "current_state": f"Current speed score: {scores.get('speed', 50)}/100",
                "target_state": "Target speed score: 85+/100",
            })

        # Social recommendations
        if scores.get("social", 100) < 60:
            recommendations.append({
                "id": "social-presence",
                "title": "Build Social Presence",
                "priority": Priority.LOW.value,
                "summary": "Strengthen social media integration and presence",
                "impact": "Increase brand awareness and referral traffic",
                "current_state": "Limited social integration",
                "target_state": "Active social presence with website integration",
            })

        return recommendations

    def _generate_90_day_priorities(self, results: dict) -> list[str]:
        """Generate 90-day priority list."""
        priorities = []
        scores = results.get("scores", {})

        # Quick wins first
        for win in results.get("quick_wins", [])[:2]:
            priorities.append(f"Quick Win: {win}")

        # Based on lowest scores
        score_priorities = sorted(
            [(k, v) for k, v in scores.items()],
            key=lambda x: x[1]
        )

        for area, score in score_priorities[:3]:
            if score < 70:
                priorities.append(f"Improve {area.upper()} score from {score} to 70+")

        if len(priorities) < 5:
            priorities.extend([
                "Establish baseline metrics and tracking",
                "Create content calendar for next quarter",
                "Implement user feedback collection",
            ])

        return priorities[:5]

    async def _generate_action_items(
        self, db: AsyncSession, strategy_id: UUID, results: dict
    ) -> None:
        """Generate action items for the strategy."""
        scores = results.get("scores", {})
        today = date.today()

        action_items = []

        # SEO actions
        if scores.get("seo", 100) < 80:
            action_items.extend([
                ActionItem(
                    strategy_id=strategy_id,
                    title="Add missing meta descriptions",
                    description="Ensure all pages have unique, compelling meta descriptions",
                    priority=Priority.HIGH,
                    effort=Effort.SMALL,
                    category="SEO",
                    due_date=today + timedelta(days=7),
                ),
                ActionItem(
                    strategy_id=strategy_id,
                    title="Optimize image alt texts",
                    description="Add descriptive alt text to all images",
                    priority=Priority.MEDIUM,
                    effort=Effort.SMALL,
                    category="SEO",
                    due_date=today + timedelta(days=14),
                ),
                ActionItem(
                    strategy_id=strategy_id,
                    title="Implement structured data",
                    description="Add schema.org markup for better search results",
                    priority=Priority.MEDIUM,
                    effort=Effort.MEDIUM,
                    category="SEO",
                    due_date=today + timedelta(days=30),
                ),
            ])

        # Content actions
        if scores.get("content", 100) < 80:
            action_items.extend([
                ActionItem(
                    strategy_id=strategy_id,
                    title="Expand homepage content",
                    description="Add more detailed content about services and value proposition",
                    priority=Priority.HIGH,
                    effort=Effort.MEDIUM,
                    category="Content",
                    due_date=today + timedelta(days=14),
                ),
                ActionItem(
                    strategy_id=strategy_id,
                    title="Create blog content strategy",
                    description="Plan 4 blog posts for the next month",
                    priority=Priority.MEDIUM,
                    effort=Effort.LARGE,
                    category="Content",
                    due_date=today + timedelta(days=21),
                ),
            ])

        # Mobile actions
        if scores.get("mobile", 100) < 70:
            action_items.extend([
                ActionItem(
                    strategy_id=strategy_id,
                    title="Add viewport meta tag",
                    description="Ensure proper mobile viewport configuration",
                    priority=Priority.HIGH,
                    effort=Effort.SMALL,
                    category="Mobile",
                    due_date=today + timedelta(days=3),
                ),
                ActionItem(
                    strategy_id=strategy_id,
                    title="Test mobile responsiveness",
                    description="Review and fix mobile layout issues",
                    priority=Priority.MEDIUM,
                    effort=Effort.MEDIUM,
                    category="Mobile",
                    due_date=today + timedelta(days=14),
                ),
            ])

        # Add all action items
        for item in action_items:
            db.add(item)

        await db.commit()


async def get_strategy_service(db: AsyncSession) -> StrategyService:
    """Dependency to get strategy service."""
    return StrategyService(db)
