"""
RESQLINK FastAPI application factory.

Run locally:
    cd server
    python -m venv .venv && .venv\\Scripts\\activate
    pip install -r requirements.txt
    uvicorn app.main:app --reload --port 8000

Environment variables (or .env file):
    DATABASE_URL        SQLite (default) or PostgreSQL connection string
    JWT_SECRET_KEY      Required in production
    CORS_ORIGINS        Comma-separated allowed origins
    TWILIO_*            Optional; leave empty to use simulated SMS
    See app/core/config.py for the full list.
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.logging import configure_logging, get_logger
from app.db.base import create_all_tables, get_session_factory
from app.middleware.rate_limit import limiter
from app.middleware.request_id import RequestIDMiddleware
from app.routers import alerts, audit, auth, eeg, hospitals, patient, responders, ws

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    configure_logging(settings.LOG_LEVEL)
    logger.info("startup", version=settings.APP_VERSION, db=settings.DATABASE_URL.split("://")[0])

    # Create tables (no-op if already exist)
    await create_all_tables()

    # Seed demo data
    factory = get_session_factory()
    async with factory() as session:
        async with session.begin():
            from app.services.seed import seed_database
            await seed_database(session)

    logger.info("ready", message="RESQLINK backend is ready")
    yield
    logger.info("shutdown")


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION,
        description="Production-grade FastAPI backend for the RESQLINK Bengaluru emergency-response platform.",
        lifespan=lifespan,
    )

    # ── Middleware ────────────────────────────────────────────────────────────
    cors_origins = settings.cors_origins_list
    allow_all = "*" in cors_origins
    application.add_middleware(RequestIDMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if allow_all else cors_origins,
        allow_credentials=not allow_all,
        allow_origin_regex=r"^https:\/\/.*\.vercel\.app$" if not allow_all else None,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Rate limiting ─────────────────────────────────────────────────────────
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler) # pyright: ignore[reportArgumentType]

    # ── Routers ───────────────────────────────────────────────────────────────
    application.include_router(auth.router)
    application.include_router(alerts.router)
    application.include_router(hospitals.router)
    application.include_router(responders.router)
    application.include_router(audit.router)
    application.include_router(eeg.router)
    application.include_router(patient.router)
    application.include_router(ws.router, prefix="/api")

    # ── Health ────────────────────────────────────────────────────────────────
    @application.get("/api/health", tags=["health"])
    async def health(request: Request) -> dict:
        return {
            "status": "ok",
            "service": "resqlink-backend",
            "version": settings.APP_VERSION,
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }

    # ── Static / Frontend SPA Mounting ───────────────────────────────────────
    candidates = [
        os.path.join(os.path.dirname(__file__), "..", "..", "dist"),
        os.path.join(os.getcwd(), "dist"),
        "/app/dist",
    ]
    dist_dir = next((os.path.abspath(c) for c in candidates if os.path.isdir(c)), None)

    if dist_dir and os.path.isfile(os.path.join(dist_dir, "index.html")):
        from fastapi.responses import FileResponse
        from fastapi.staticfiles import StaticFiles

        assets_dir = os.path.join(dist_dir, "assets")
        if os.path.isdir(assets_dir):
            application.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        @application.get("/{full_path:path}", include_in_schema=False)
        async def serve_spa(full_path: str):
            if full_path.startswith("api/") or full_path == "api":
                return None
            target = os.path.join(dist_dir, full_path)
            if full_path and os.path.isfile(target):
                return FileResponse(target)
            return FileResponse(os.path.join(dist_dir, "index.html"))

    return application


def _get_app() -> FastAPI:
    """Lazily create the application (used by uvicorn entry point and tests)."""
    return create_app()


# Module-level `app` for `uvicorn app.main:app`
app = _get_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=False)
