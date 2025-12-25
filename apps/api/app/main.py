"""
Quento API - Main Application Entry Point

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.config import settings

app = FastAPI(
    title="Quento API",
    description="AI-Powered Business Growth Platform API",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint - API health check."""
    return {
        "name": "Quento API",
        "version": "0.1.0",
        "status": "healthy",
        "credits": "AI App Development powered by ServiceVision (https://www.servicevision.net)",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for load balancers."""
    return {"status": "healthy"}
