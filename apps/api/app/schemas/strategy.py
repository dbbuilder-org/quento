"""
Strategy Schemas

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime, date
from typing import Optional, Any
from uuid import UUID
from pydantic import BaseModel, Field

from app.models.strategy import Priority, Effort, ActionStatus, StrategyStatus


class StrategyGenerateRequest(BaseModel):
    """Request to generate a strategy."""

    analysis_id: UUID
    session_id: Optional[UUID] = None
    preferences: Optional[dict[str, Any]] = None


class RecommendationResponse(BaseModel):
    """Strategy recommendation."""

    id: str
    title: str
    priority: Priority
    summary: str
    impact: str
    current_state: Optional[str] = None
    target_state: Optional[str] = None


class ActionItemResponse(BaseModel):
    """Action item response."""

    id: UUID
    title: str
    description: Optional[str]
    priority: Priority
    effort: Effort
    category: Optional[str]
    status: ActionStatus
    expected_impact: Optional[str] = None
    due_date: Optional[date] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class StrategyResponse(BaseModel):
    """Full strategy response."""

    id: UUID
    title: Optional[str]
    status: StrategyStatus
    executive_summary: Optional[str] = None
    vision_statement: Optional[str] = None
    key_strengths: list[str] = []
    critical_gaps: list[str] = []
    recommendations: list[RecommendationResponse] = []
    action_items: list[ActionItemResponse] = []
    ninety_day_priorities: list[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ActionItemUpdate(BaseModel):
    """Update action item status."""

    action_id: UUID
    status: ActionStatus
    notes: Optional[str] = None


class ActionItemBatchUpdate(BaseModel):
    """Batch update action items."""

    updates: list[ActionItemUpdate]


class StrategyExportRequest(BaseModel):
    """Export strategy request."""

    format: str = Field(..., pattern="^(pdf|markdown|notion|trello)$")
    include_sections: list[str] = ["summary", "recommendations", "action_items"]
    branding: Optional[dict[str, Any]] = None
