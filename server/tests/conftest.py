"""
Pytest fixtures for the RESQLINK test suite.
Uses an in-memory SQLite database so tests are fully isolated and require no external services.
"""
from __future__ import annotations

import os

# ── Override settings BEFORE importing app modules ───────────────────────────
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-ci-must-be-at-least-32-chars"
os.environ["LOG_LEVEL"] = "WARNING"
os.environ["RATE_LIMIT_LOGIN"] = "1000/minute"
os.environ["RATE_LIMIT_SOS"] = "1000/minute"

# Clear lru_cache so test overrides take effect
from app.core.config import get_settings  # noqa: E402

get_settings.cache_clear()

import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import (  # noqa: E402
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.db.base import Base, get_db  # noqa: E402
from app.main import create_app  # noqa: E402
from app.services.seed import seed_database  # noqa: E402

_TEST_ENGINE = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
)
_TestSession = async_sessionmaker(_TEST_ENGINE, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_tables():
    from app.db import models as _  # noqa: F401 — ensure all models are registered
    async with _TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with _TEST_ENGINE.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(autouse=True)
async def seed_db():
    async with _TestSession() as session:
        async with session.begin():
            await seed_database(session)
    yield


async def _override_get_db():
    async with _TestSession() as session:
        async with session.begin():
            yield session


@pytest_asyncio.fixture
async def client():
    # Reset rate limiter counters between tests
    from app.middleware.rate_limit import limiter
    try:
        limiter._storage.reset()
    except Exception:
        pass

    app = create_app()
    app.dependency_overrides[get_db] = _override_get_db
    app.state.limiter = limiter

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient) -> str:
    resp = await client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def patient_token(client: AsyncClient) -> str:
    resp = await client.post("/api/auth/login", json={"username": "patient", "password": "patient123"})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]


@pytest_asyncio.fixture
async def hospital_token(client: AsyncClient) -> str:
    resp = await client.post("/api/auth/login", json={"username": "hospital", "password": "hospital123"})
    assert resp.status_code == 200, resp.text
    return resp.json()["access_token"]
