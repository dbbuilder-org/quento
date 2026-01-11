"""
Strategy and ActionItem Models

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, Date, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.database import Base, GUID


class StrategyStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class Priority(str, enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Effort(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class ActionStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class Strategy(Base):
    """Business strategy model."""

    __tablename__ = "strategies"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    analysis_id = Column(GUID(), ForeignKey("analyses.id"), nullable=True)
    title = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)
    status = Column(Enum(StrategyStatus), default=StrategyStatus.DRAFT)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="strategies")
    analysis = relationship("Analysis", back_populates="strategies")
    action_items = relationship("ActionItem", back_populates="strategy", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Strategy {self.id}>"


class ActionItem(Base):
    """Action item model."""

    __tablename__ = "action_items"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(GUID(), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Enum(Priority), default=Priority.MEDIUM)
    effort = Column(Enum(Effort), default=Effort.MEDIUM)
    category = Column(String(100), nullable=True)
    status = Column(Enum(ActionStatus), default=ActionStatus.PENDING)
    due_date = Column(Date, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    extra_data = Column(JSON, default=dict)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    strategy = relationship("Strategy", back_populates="action_items")

    def __repr__(self) -> str:
        return f"<ActionItem {self.title}>"
