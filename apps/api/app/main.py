"""
Quento API - Main Application Entry Point

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

import sys
import traceback

# Log startup for debugging
print("Starting Quento API...", flush=True)

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    print("FastAPI imported successfully", flush=True)

    from app.config import settings
    print(f"Config loaded: ENV={settings.ENVIRONMENT}", flush=True)

    from app.api.v1.router import api_router
    print("Router imported successfully", flush=True)

    from app.db.database import init_db
    print("Database module imported", flush=True)
except Exception as e:
    print(f"STARTUP ERROR: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)

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


@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    print("Initializing database tables...", flush=True)
    try:
        await init_db()
        print("Database tables created successfully", flush=True)
    except Exception as e:
        print(f"Database initialization error: {e}", flush=True)
        traceback.print_exc()
