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
from app.routers import alerts, audit, auth, claps, eeg, emergency, hospitals, patient, responders, voice_calls, ws

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    configure_logging(settings.LOG_LEVEL)
    logger.info("startup", version=settings.APP_VERSION, db=settings.DATABASE_URL.split("://")[0])

    # Create tables (no-op if already exist)
    await create_all_tables()

    # Seed demo data and clean initial emergency state
    factory = get_session_factory()
    async with factory() as session:
        async with session.begin():
            from app.services.seed import seed_database
            await seed_database(session)

            from sqlalchemy import select
            from app.db.models import Alert, Responder
            alerts_res = await session.execute(select(Alert).where(Alert.status.notin_(["RESOLVED", "CANCELLED"])))
            for a in alerts_res.scalars():
                a.status = "RESOLVED"
            resps_res = await session.execute(select(Responder))
            for r in resps_res.scalars():
                r.is_available = True
                r.assigned_incident_id = None

    logger.info("ready", message="RESQLINK backend is ready (clean initial state)")
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
    application.add_middleware(RequestIDMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Rate limiting ─────────────────────────────────────────────────────────
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # ── Routers ───────────────────────────────────────────────────────────────
    application.include_router(auth.router)
    application.include_router(alerts.router)
    application.include_router(hospitals.router)
    application.include_router(responders.router)
    application.include_router(audit.router)
    application.include_router(eeg.router)
    application.include_router(patient.router)
    application.include_router(claps.router)
    application.include_router(emergency.router)
    application.include_router(voice_calls.router)
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

    return application


def _get_app() -> FastAPI:
    """Lazily create the application (used by uvicorn entry point and tests)."""
    return create_app()


# Module-level `app` for `uvicorn app.main:app`
app = _get_app()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=False)
