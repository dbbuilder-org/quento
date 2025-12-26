"""
Common Schemas

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from datetime import datetime
from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class Meta(BaseModel):
    """Response metadata."""

    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None


class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper."""

    success: bool = True
    data: Optional[T] = None
    meta: Meta = Field(default_factory=Meta)


class ErrorDetail(BaseModel):
    """Error detail."""

    field: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    """Standard error response."""

    success: bool = False
    error: dict[str, Any]
    meta: Meta = Field(default_factory=Meta)


class Pagination(BaseModel):
    """Pagination info."""

    total: int
    limit: int
    offset: int
    has_more: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper."""

    success: bool = True
    data: list[T]
    pagination: Pagination
    meta: Meta = Field(default_factory=Meta)
