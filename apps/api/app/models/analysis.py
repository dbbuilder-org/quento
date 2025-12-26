"""
Analysis Model

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.database import Base


class AnalysisStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Analysis(Base):
    """Web presence analysis model."""

    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=True)
    website_url = Column(String(500), nullable=False)
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING)
    progress = Column(Integer, default=0)
    include_competitors = Column(Integer, default=True)
    include_social = Column(Integer, default=True)
    results = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)

    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="analyses")
    strategies = relationship("Strategy", back_populates="analysis")

    def __repr__(self) -> str:
        return f"<Analysis {self.id} ({self.status})>"
