"""
API v1 Router - Combines all endpoint routers

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.analysis import router as analysis_router
from app.api.v1.strategy import router as strategy_router

api_router = APIRouter()


@api_router.get("/")
async def api_root():
    """API v1 root endpoint."""
    return {
        "version": "v1",
        "endpoints": {
            "auth": "/api/v1/auth",
            "chat": "/api/v1/chat",
            "analysis": "/api/v1/analysis",
            "strategy": "/api/v1/strategy",
        },
    }


@api_router.get("/health")
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {
        "status": "healthy",
        "version": "v1",
        "service": "quento-api",
    }


# Include all routers
api_router.include_router(auth_router)
api_router.include_router(chat_router)
api_router.include_router(analysis_router)
api_router.include_router(strategy_router)
