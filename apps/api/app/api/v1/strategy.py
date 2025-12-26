"""
Strategy API Endpoints

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.strategy import (
    StrategyGenerateRequest,
    StrategyResponse,
    ActionItemResponse,
    ActionItemUpdate,
    ActionItemBatchUpdate,
    StrategyExportRequest,
)
from app.schemas.common import APIResponse, PaginatedResponse, Pagination
from app.services.strategy_service import StrategyService
from app.core.security import get_current_active_user
from app.core.exceptions import NotFoundError, ValidationError
from app.models.user import User

router = APIRouter(prefix="/strategy", tags=["Strategy"])


@router.post(
    "/generate",
    response_model=APIResponse[StrategyResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Generate strategy",
    description="Generate a new strategy based on analysis results.",
)
async def generate_strategy(
    data: StrategyGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a new strategy."""
    service = StrategyService(db)
    try:
        strategy = await service.generate_strategy(current_user.id, data)
        response = await service.get_strategy_response(strategy.id, current_user.id)
        return APIResponse(data=response)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get(
    "",
    response_model=PaginatedResponse[StrategyResponse],
    summary="List strategies",
    description="Get list of user's strategies.",
)
async def list_strategies(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's strategies."""
    service = StrategyService(db)
    strategies = await service.list_strategies(
        current_user.id, limit=limit, offset=offset
    )

    responses = []
    for s in strategies:
        response = await service.get_strategy_response(s.id, current_user.id)
        responses.append(response)

    return PaginatedResponse(
        data=responses,
        pagination=Pagination(
            total=len(strategies),
            limit=limit,
            offset=offset,
            has_more=len(strategies) == limit,
        ),
    )


@router.get(
    "/{strategy_id}",
    response_model=APIResponse[StrategyResponse],
    summary="Get strategy",
    description="Get strategy details with recommendations and action items.",
)
async def get_strategy(
    strategy_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get strategy details."""
    service = StrategyService(db)
    try:
        response = await service.get_strategy_response(strategy_id, current_user.id)
        return APIResponse(data=response)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.patch(
    "/actions/{action_id}",
    response_model=APIResponse[ActionItemResponse],
    summary="Update action item",
    description="Update an action item's status.",
)
async def update_action_item(
    action_id: UUID,
    update: ActionItemUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update action item status."""
    service = StrategyService(db)

    # Ensure action_id matches
    if update.action_id != action_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action ID in path and body must match",
        )

    try:
        action = await service.update_action_item(current_user.id, update)
        return APIResponse(data=ActionItemResponse.model_validate(action))
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.patch(
    "/actions",
    response_model=APIResponse[list[ActionItemResponse]],
    summary="Batch update actions",
    description="Update multiple action items at once.",
)
async def batch_update_actions(
    batch: ActionItemBatchUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Batch update action items."""
    service = StrategyService(db)
    results = []

    for update in batch.updates:
        try:
            action = await service.update_action_item(current_user.id, update)
            results.append(ActionItemResponse.model_validate(action))
        except NotFoundError:
            # Skip not found items in batch
            continue

    return APIResponse(data=results)


@router.post(
    "/{strategy_id}/export",
    response_model=APIResponse[dict],
    summary="Export strategy",
    description="Export strategy to specified format.",
)
async def export_strategy(
    strategy_id: UUID,
    request: StrategyExportRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Export strategy to different formats."""
    service = StrategyService(db)

    try:
        strategy = await service.get_strategy(strategy_id, current_user.id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )

    # Placeholder for export functionality
    # In production, this would generate actual exports
    export_url = f"/exports/strategy-{strategy_id}.{request.format}"

    return APIResponse(
        data={
            "format": request.format,
            "status": "processing",
            "download_url": export_url,
            "message": f"Export to {request.format} initiated. Download will be available shortly.",
        }
    )
