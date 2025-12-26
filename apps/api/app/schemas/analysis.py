"""
Analysis Schemas

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field, HttpUrl

from app.models.analysis import AnalysisStatus


class AnalysisCreate(BaseModel):
    """Create analysis request."""

    website_url: str = Field(..., pattern=r"^https?://.*")
    session_id: Optional[UUID] = None
    include_competitors: bool = True
    include_social: bool = True


class AnalysisScores(BaseModel):
    """Analysis scores breakdown."""

    seo: int = Field(..., ge=0, le=100)
    content: int = Field(..., ge=0, le=100)
    mobile: int = Field(..., ge=0, le=100)
    speed: int = Field(..., ge=0, le=100)
    social: int = Field(..., ge=0, le=100)


class SEOIssue(BaseModel):
    """SEO issue found."""

    severity: str  # high, medium, low
    issue: str
    recommendation: str


class Competitor(BaseModel):
    """Competitor information."""

    name: str
    url: str
    strengths: list[str]
    seo_score: int


class AnalysisResults(BaseModel):
    """Full analysis results."""

    overall_score: int = Field(..., ge=0, le=100)
    scores: AnalysisScores
    content_analysis: dict[str, Any]
    seo_analysis: dict[str, Any]
    competitors: list[Competitor]
    social_presence: Optional[dict[str, Any]] = None
    quick_wins: list[str]


class AnalysisResponse(BaseModel):
    """Analysis response."""

    id: UUID
    website_url: str
    status: AnalysisStatus
    progress: int
    estimated_time_seconds: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AnalysisStatusResponse(BaseModel):
    """Analysis status response."""

    status: AnalysisStatus
    progress: int
    current_step: Optional[str] = None
    steps_completed: list[str] = []
    steps_remaining: list[str] = []


class AnalysisResultsResponse(BaseModel):
    """Full analysis with results."""

    id: UUID
    website_url: str
    status: AnalysisStatus
    progress: int
    results: Optional[AnalysisResults] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
