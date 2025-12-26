"""
Analysis Service - Web Scraping and Analysis

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
import asyncio
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.analysis import Analysis, AnalysisStatus
from app.models.user import User
from app.schemas.analysis import (
    AnalysisCreate,
    AnalysisResponse,
    AnalysisResults,
    AnalysisScores,
    Competitor,
    SEOIssue,
    AnalysisStatusResponse,
    AnalysisResultsResponse,
)
from app.core.exceptions import NotFoundError, ValidationError


class AnalysisService:
    """Service for website analysis and scraping."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_analysis(
        self, user_id: UUID, data: AnalysisCreate
    ) -> Analysis:
        """Create a new analysis request."""
        # Validate URL
        parsed = urlparse(data.website_url)
        if not parsed.scheme or not parsed.netloc:
            raise ValidationError("Invalid website URL")

        # Create analysis record
        analysis = Analysis(
            user_id=user_id,
            website_url=data.website_url,
            status=AnalysisStatus.PENDING,
            progress=0,
            include_competitors=data.include_competitors,
            include_social=data.include_social,
        )

        self.db.add(analysis)
        await self.db.commit()
        await self.db.refresh(analysis)

        # Start analysis in background
        asyncio.create_task(self._run_analysis(analysis.id))

        return analysis

    async def get_analysis(self, analysis_id: UUID, user_id: UUID) -> Analysis:
        """Get analysis by ID."""
        result = await self.db.execute(
            select(Analysis).where(
                Analysis.id == analysis_id,
                Analysis.user_id == user_id,
            )
        )
        analysis = result.scalar_one_or_none()

        if not analysis:
            raise NotFoundError(f"Analysis {analysis_id} not found")

        return analysis

    async def get_analysis_status(
        self, analysis_id: UUID, user_id: UUID
    ) -> AnalysisStatusResponse:
        """Get analysis status."""
        analysis = await self.get_analysis(analysis_id, user_id)

        steps = [
            "Fetching website",
            "Analyzing content",
            "Checking SEO",
            "Analyzing competitors",
            "Checking social presence",
            "Generating report",
        ]

        progress_to_step = {
            0: 0,
            20: 1,
            40: 2,
            60: 3,
            80: 4,
            100: 5,
        }

        current_step_idx = progress_to_step.get(
            (analysis.progress // 20) * 20, 0
        )

        return AnalysisStatusResponse(
            status=analysis.status,
            progress=analysis.progress,
            current_step=steps[min(current_step_idx, len(steps) - 1)],
            steps_completed=steps[:current_step_idx],
            steps_remaining=steps[current_step_idx + 1:],
        )

    async def get_analysis_results(
        self, analysis_id: UUID, user_id: UUID
    ) -> AnalysisResultsResponse:
        """Get full analysis with results."""
        analysis = await self.get_analysis(analysis_id, user_id)

        results = None
        if analysis.status == AnalysisStatus.COMPLETED and analysis.results:
            results = AnalysisResults(**analysis.results)

        return AnalysisResultsResponse(
            id=analysis.id,
            website_url=analysis.website_url,
            status=analysis.status,
            progress=analysis.progress,
            results=results,
            created_at=analysis.created_at,
            completed_at=analysis.completed_at,
        )

    async def list_analyses(
        self, user_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[Analysis]:
        """List user's analyses."""
        result = await self.db.execute(
            select(Analysis)
            .where(Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def _run_analysis(self, analysis_id: UUID) -> None:
        """Run the actual analysis (background task)."""
        from app.db.database import async_session_maker

        async with async_session_maker() as db:
            try:
                # Get analysis
                result = await db.execute(
                    select(Analysis).where(Analysis.id == analysis_id)
                )
                analysis = result.scalar_one_or_none()
                if not analysis:
                    return

                # Update status to processing
                analysis.status = AnalysisStatus.PROCESSING
                analysis.progress = 10
                await db.commit()

                # Fetch website
                website_data = await self._fetch_website(analysis.website_url)
                analysis.progress = 20
                await db.commit()

                # Analyze content
                content_analysis = self._analyze_content(website_data)
                analysis.progress = 40
                await db.commit()

                # SEO analysis
                seo_analysis = self._analyze_seo(website_data)
                analysis.progress = 60
                await db.commit()

                # Competitor analysis (placeholder)
                competitors = []
                if analysis.include_competitors:
                    competitors = self._analyze_competitors(website_data)
                analysis.progress = 80
                await db.commit()

                # Social presence (placeholder)
                social_presence = None
                if analysis.include_social:
                    social_presence = self._analyze_social(website_data)
                analysis.progress = 90
                await db.commit()

                # Calculate scores
                scores = self._calculate_scores(
                    content_analysis, seo_analysis, social_presence
                )

                # Generate quick wins
                quick_wins = self._generate_quick_wins(seo_analysis)

                # Overall score
                overall_score = sum([
                    scores["seo"],
                    scores["content"],
                    scores["mobile"],
                    scores["speed"],
                    scores["social"],
                ]) // 5

                # Save results
                analysis.results = {
                    "overall_score": overall_score,
                    "scores": scores,
                    "content_analysis": content_analysis,
                    "seo_analysis": seo_analysis,
                    "competitors": [c.model_dump() for c in competitors],
                    "social_presence": social_presence,
                    "quick_wins": quick_wins,
                }
                analysis.status = AnalysisStatus.COMPLETED
                analysis.progress = 100
                analysis.completed_at = datetime.utcnow()
                await db.commit()

            except Exception as e:
                # Handle errors
                result = await db.execute(
                    select(Analysis).where(Analysis.id == analysis_id)
                )
                analysis = result.scalar_one_or_none()
                if analysis:
                    analysis.status = AnalysisStatus.FAILED
                    analysis.error_message = str(e)
                    await db.commit()

    async def _fetch_website(self, url: str) -> dict:
        """Fetch and parse website content."""
        async with httpx.AsyncClient(
            timeout=30.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (compatible; QuentoBot/1.0; +https://quento.co)"
            },
        ) as client:
            response = await client.get(url)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "html.parser")

            return {
                "url": str(response.url),
                "status_code": response.status_code,
                "title": soup.title.string if soup.title else None,
                "meta_description": self._get_meta(soup, "description"),
                "meta_keywords": self._get_meta(soup, "keywords"),
                "h1_tags": [h1.get_text(strip=True) for h1 in soup.find_all("h1")],
                "h2_tags": [h2.get_text(strip=True) for h2 in soup.find_all("h2")],
                "images": len(soup.find_all("img")),
                "images_with_alt": len(soup.find_all("img", alt=True)),
                "links": len(soup.find_all("a", href=True)),
                "internal_links": self._count_internal_links(soup, url),
                "external_links": self._count_external_links(soup, url),
                "has_viewport": bool(soup.find("meta", {"name": "viewport"})),
                "has_canonical": bool(soup.find("link", {"rel": "canonical"})),
                "word_count": len(soup.get_text().split()),
                "html_size": len(response.text),
            }

    def _get_meta(self, soup: BeautifulSoup, name: str) -> Optional[str]:
        """Get meta tag content."""
        tag = soup.find("meta", {"name": name}) or soup.find("meta", {"property": f"og:{name}"})
        return tag.get("content") if tag else None

    def _count_internal_links(self, soup: BeautifulSoup, url: str) -> int:
        """Count internal links."""
        parsed = urlparse(url)
        count = 0
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            if href.startswith("/") or parsed.netloc in href:
                count += 1
        return count

    def _count_external_links(self, soup: BeautifulSoup, url: str) -> int:
        """Count external links."""
        parsed = urlparse(url)
        count = 0
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            if href.startswith("http") and parsed.netloc not in href:
                count += 1
        return count

    def _analyze_content(self, data: dict) -> dict:
        """Analyze website content."""
        issues = []
        recommendations = []

        # Title analysis
        if not data.get("title"):
            issues.append("Missing page title")
            recommendations.append("Add a descriptive page title")
        elif len(data.get("title", "")) < 30:
            issues.append("Page title too short")
            recommendations.append("Expand title to 50-60 characters")
        elif len(data.get("title", "")) > 60:
            issues.append("Page title too long")
            recommendations.append("Shorten title to under 60 characters")

        # Meta description
        if not data.get("meta_description"):
            issues.append("Missing meta description")
            recommendations.append("Add a compelling meta description")
        elif len(data.get("meta_description", "")) < 120:
            issues.append("Meta description too short")
            recommendations.append("Expand meta description to 150-160 characters")

        # Headings
        if not data.get("h1_tags"):
            issues.append("Missing H1 tag")
            recommendations.append("Add a single H1 tag with main keyword")
        elif len(data.get("h1_tags", [])) > 1:
            issues.append("Multiple H1 tags found")
            recommendations.append("Use only one H1 tag per page")

        # Word count
        if data.get("word_count", 0) < 300:
            issues.append("Low word count")
            recommendations.append("Add more content (aim for 500+ words)")

        return {
            "title": data.get("title"),
            "meta_description": data.get("meta_description"),
            "word_count": data.get("word_count", 0),
            "heading_structure": {
                "h1_count": len(data.get("h1_tags", [])),
                "h2_count": len(data.get("h2_tags", [])),
            },
            "issues": issues,
            "recommendations": recommendations,
        }

    def _analyze_seo(self, data: dict) -> dict:
        """Analyze SEO factors."""
        issues = []

        # Image optimization
        images = data.get("images", 0)
        images_with_alt = data.get("images_with_alt", 0)
        if images > 0 and images_with_alt < images:
            issues.append({
                "severity": "medium",
                "issue": f"{images - images_with_alt} images missing alt text",
                "recommendation": "Add descriptive alt text to all images",
            })

        # Mobile optimization
        if not data.get("has_viewport"):
            issues.append({
                "severity": "high",
                "issue": "Missing viewport meta tag",
                "recommendation": "Add viewport meta tag for mobile responsiveness",
            })

        # Canonical URL
        if not data.get("has_canonical"):
            issues.append({
                "severity": "low",
                "issue": "Missing canonical URL",
                "recommendation": "Add canonical URL to prevent duplicate content",
            })

        # Link structure
        if data.get("internal_links", 0) < 3:
            issues.append({
                "severity": "medium",
                "issue": "Few internal links",
                "recommendation": "Add more internal links to improve navigation",
            })

        return {
            "issues": issues,
            "image_optimization": {
                "total": images,
                "with_alt": images_with_alt,
                "score": (images_with_alt / images * 100) if images > 0 else 100,
            },
            "mobile_ready": data.get("has_viewport", False),
            "has_canonical": data.get("has_canonical", False),
            "link_structure": {
                "internal": data.get("internal_links", 0),
                "external": data.get("external_links", 0),
            },
        }

    def _analyze_competitors(self, data: dict) -> list[Competitor]:
        """Placeholder for competitor analysis."""
        # In production, this would use search APIs and competitive analysis
        return [
            Competitor(
                name="Competitor A",
                url="https://competitor-a.com",
                strengths=["Strong SEO", "Active blog"],
                seo_score=78,
            ),
            Competitor(
                name="Competitor B",
                url="https://competitor-b.com",
                strengths=["Social media presence", "Fast website"],
                seo_score=72,
            ),
        ]

    def _analyze_social(self, data: dict) -> dict:
        """Placeholder for social media analysis."""
        # In production, this would check social media APIs
        return {
            "platforms_found": ["linkedin", "twitter"],
            "activity_level": "moderate",
            "recommendations": [
                "Increase posting frequency",
                "Add social sharing buttons to website",
            ],
        }

    def _calculate_scores(
        self, content: dict, seo: dict, social: Optional[dict]
    ) -> dict:
        """Calculate scores for each category."""
        # Content score
        content_score = 100
        content_score -= len(content.get("issues", [])) * 15
        content_score = max(0, min(100, content_score))

        # SEO score
        seo_score = 100
        for issue in seo.get("issues", []):
            if issue.get("severity") == "high":
                seo_score -= 20
            elif issue.get("severity") == "medium":
                seo_score -= 10
            else:
                seo_score -= 5
        seo_score = max(0, min(100, seo_score))

        # Mobile score (simplified)
        mobile_score = 80 if seo.get("mobile_ready") else 40

        # Speed score (placeholder - would use PageSpeed API)
        speed_score = 70

        # Social score
        social_score = 60 if social else 40

        return {
            "seo": seo_score,
            "content": content_score,
            "mobile": mobile_score,
            "speed": speed_score,
            "social": social_score,
        }

    def _generate_quick_wins(self, seo: dict) -> list[str]:
        """Generate quick win recommendations."""
        quick_wins = []

        for issue in seo.get("issues", []):
            if issue.get("severity") in ["high", "medium"]:
                quick_wins.append(issue.get("recommendation"))

        if not quick_wins:
            quick_wins = [
                "Consider adding more internal links",
                "Optimize images for faster loading",
                "Add structured data markup",
            ]

        return quick_wins[:5]  # Return top 5


async def get_analysis_service(db: AsyncSession) -> AnalysisService:
    """Dependency to get analysis service."""
    return AnalysisService(db)
