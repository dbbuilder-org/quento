"""
API v1 Router - Combines all endpoint routers

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from fastapi import APIRouter

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
            "users": "/api/v1/users",
        },
    }


# TODO: Import and include routers as they are implemented
# from app.api.v1 import auth, chat, analysis, strategy, users
# api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
# api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
# api_router.include_router(strategy.router, prefix="/strategy", tags=["Strategy"])
# api_router.include_router(users.router, prefix="/users", tags=["Users"])
