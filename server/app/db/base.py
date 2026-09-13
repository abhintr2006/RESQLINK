from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""


def _normalize_database_url(raw_url: str) -> tuple[str, dict, dict]:
    """
    Normalize DATABASE_URL for async SQLAlchemy drivers.
    Supports SQLite (aiosqlite) and PostgreSQL / Supabase (asyncpg).
    """
    import urllib.parse

    url = raw_url.strip()
    connect_args: dict = {}
    engine_kwargs: dict = {}

    if url.startswith("sqlite"):
        if not url.startswith("sqlite+aiosqlite"):
            url = url.replace("sqlite://", "sqlite+aiosqlite://", 1)
        connect_args["check_same_thread"] = False
        engine_kwargs["pool_pre_ping"] = True
        return url, connect_args, engine_kwargs

    # PostgreSQL / Supabase normalization
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    parsed = urllib.parse.urlparse(url)
    query_params = urllib.parse.parse_qs(parsed.query)

    # asyncpg doesn't support 'sslmode' in query params, it uses connect_args['ssl']
    is_ssl = False
    if "sslmode" in query_params:
        mode = query_params.pop("sslmode")[0].lower()
        if mode in ("require", "verify-ca", "verify-full", "prefer"):
            is_ssl = True
    if "ssl" in query_params:
        s_val = query_params.pop("ssl")[0].lower()
        if s_val in ("true", "1", "require"):
            is_ssl = True

    host = (parsed.hostname or "").lower()
    # Supabase hosts always require SSL; disable statement cache for transaction pooler (port 6543)
    is_supabase = (
        host == "supabase.co"
        or host.endswith(".supabase.co")
        or host == "supabase.com"
        or host.endswith(".supabase.com")
    )
    if is_supabase or is_ssl:
        connect_args["ssl"] = "require"
        connect_args["statement_cache_size"] = 0
        connect_args["prepared_statement_cache_size"] = 0

    clean_query = urllib.parse.urlencode(query_params, doseq=True)
    clean_url = urllib.parse.urlunparse(parsed._replace(query=clean_query))

    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 5
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300

    return clean_url, connect_args, engine_kwargs


def _make_engine():
    settings = get_settings()
    db_url, connect_args, engine_kwargs = _normalize_database_url(settings.DATABASE_URL)
    return create_async_engine(
        db_url,
        echo=settings.DEBUG,
        connect_args=connect_args,
        **engine_kwargs,
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
