from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""


def _make_engine():
    settings = get_settings()
    connect_args = {}
    if settings.DATABASE_URL.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    return create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        connect_args=connect_args,
    )


# Lazily created so tests can override settings before import
_engine = None
_SessionLocal: async_sessionmaker[AsyncSession] | None = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = _make_engine()
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = async_sessionmaker(
            get_engine(), class_=AsyncSession, expire_on_commit=False
        )
    return _SessionLocal


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields a transactional async session."""
    factory = get_session_factory()
    async with factory() as session:
        async with session.begin():
            yield session


async def create_all_tables() -> None:
    """Create all tables (used in tests and first-run setup)."""
    from app.db import models as _  # noqa: F401 – ensure models are imported
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
