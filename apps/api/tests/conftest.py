"""
Test Configuration and Fixtures

AI App Development powered by ServiceVision (https://www.servicevision.net)
"""

import asyncio
from typing import AsyncGenerator, Generator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import get_db, Base
from app.models.user import User
from app.core.security import create_access_token


# Test database URL (in-memory SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session."""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(test_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test HTTP client with test database."""

    async def override_get_db():
        yield test_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def test_user(test_session: AsyncSession) -> User:
    """Create a test user."""
    from app.services.auth_service import AuthService
    from app.schemas.auth import UserCreate

    service = AuthService(test_session)
    user_data = UserCreate(
        email=f"test_{uuid4().hex[:8]}@example.com",
        password="TestPassword123!",
        full_name="Test User",
        company_name="Test Company",
    )

    auth_response = await service.register(user_data)
    return auth_response.user


@pytest_asyncio.fixture(scope="function")
async def auth_headers(test_user: User) -> dict:
    """Create authentication headers for test user."""
    token = create_access_token(data={"sub": str(test_user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="function")
async def authenticated_client(
    client: AsyncClient, auth_headers: dict
) -> AsyncGenerator[AsyncClient, None]:
    """Create authenticated test client."""
    client.headers.update(auth_headers)
    yield client


# Test data fixtures
@pytest.fixture
def valid_user_data() -> dict:
    """Valid user registration data."""
    return {
        "email": f"newuser_{uuid4().hex[:8]}@example.com",
        "password": "SecurePassword123!",
        "full_name": "New User",
        "company_name": "New Company",
    }


@pytest.fixture
def invalid_password_data() -> dict:
    """User data with invalid password (no special character)."""
    return {
        "email": "test@example.com",
        "password": "weakpassword123",  # No special character
        "full_name": "Test User",
    }


@pytest.fixture
def valid_analysis_data() -> dict:
    """Valid analysis creation data."""
    return {
        "website_url": "https://example.com",
        "include_competitors": True,
    }
