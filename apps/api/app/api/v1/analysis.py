"""
Analysis API Endpoints

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.analysis import (
    AnalysisCreate,
    AnalysisResponse,
    AnalysisStatusResponse,
    AnalysisResultsResponse,
)
from app.schemas.common import APIResponse, PaginatedResponse, Pagination
from app.services.analysis_service import AnalysisService
from app.core.security import get_current_active_user
from app.core.exceptions import NotFoundError, ValidationError
from app.models.user import User

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post(
    "",
    response_model=APIResponse[AnalysisResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Start analysis",
    description="Start a new website analysis.",
)
async def create_analysis(
    data: AnalysisCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new website analysis."""
    service = AnalysisService(db)
    try:
        analysis = await service.create_analysis(current_user.id, data)
        return APIResponse(
            data=AnalysisResponse(
                id=analysis.id,
                website_url=analysis.website_url,
                status=analysis.status,
                progress=analysis.progress,
                estimated_time_seconds=60,
                created_at=analysis.created_at,
            )
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "",
    response_model=PaginatedResponse[AnalysisResponse],
    summary="List analyses",
    description="Get list of user's website analyses.",
)
async def list_analyses(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's analyses."""
    service = AnalysisService(db)
    analyses = await service.list_analyses(current_user.id, limit=limit, offset=offset)

    return PaginatedResponse(
        data=[
            AnalysisResponse(
                id=a.id,
                website_url=a.website_url,
                status=a.status,
                progress=a.progress,
                estimated_time_seconds=None,
                created_at=a.created_at,
            )
            for a in analyses
        ],
        pagination=Pagination(
            total=len(analyses),
            limit=limit,
            offset=offset,
            has_more=len(analyses) == limit,
        ),
    )


@router.get(
    "/{analysis_id}",
    response_model=APIResponse[AnalysisResultsResponse],
    summary="Get analysis results",
    description="Get full analysis with results.",
)
async def get_analysis(
    analysis_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get analysis with results."""
    service = AnalysisService(db)
    try:
        results = await service.get_analysis_results(analysis_id, current_user.id)
        return APIResponse(data=results)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/{analysis_id}/status",
    response_model=APIResponse[AnalysisStatusResponse],
    summary="Get analysis status",
    description="Get current analysis status and progress.",
)
async def get_analysis_status(
    analysis_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get analysis status."""
    service = AnalysisService(db)
    try:
        status_response = await service.get_analysis_status(analysis_id, current_user.id)
        return APIResponse(data=status_response)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
