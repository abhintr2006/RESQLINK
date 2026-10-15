from __future__ import annotations

import asyncio
import os
import time
from datetime import datetime, timezone
from typing import Any

import httpx
from sqlalchemy import text

from app.core.config import get_settings
from app.core.logging import get_logger
from app.db.base import get_engine

logger = get_logger(__name__)

_startup_time: float = time.time()
_keep_alive_task: asyncio.Task | None = None

_stats: dict[str, Any] = {
    "ping_count": 0,
    "last_ping_at": None,
    "last_ping_status": None,
    "last_ping_duration_ms": None,
    "last_error": None,
    "target_url": None,
}


def set_startup_time() -> None:
    global _startup_time
    _startup_time = time.time()


def get_uptime_seconds() -> float:
    return round(time.time() - _startup_time, 2)


async def check_database_health() -> tuple[bool, str]:
    """Execute a lightweight SELECT 1 to verify database connectivity."""
    try:
        engine = get_engine()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True, "healthy"
    except Exception as exc:
        logger.error("db_health_check_failed", error=str(exc))
        return False, str(exc)


def get_target_ping_url() -> str:
    """
    Determine target URL for the keep-alive ping.
    Prioritizes RENDER_EXTERNAL_URL (Render environment variable),
    falling back to local HTTP host and port.
    """
    settings = get_settings()
    render_url = settings.RENDER_EXTERNAL_URL or os.getenv("RENDER_EXTERNAL_URL") or os.getenv("BACKEND_URL")
    if render_url:
        return f"{render_url.rstrip('/')}/api/health"

    port = os.getenv("PORT", "8000")
    return f"http://127.0.0.1:{port}/api/health"


async def ping_health_endpoint() -> dict[str, Any]:
    """Send an HTTP request to the health endpoint and record metrics."""
    target_url = get_target_ping_url()
    _stats["target_url"] = target_url
    start = time.perf_counter()

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(target_url, headers={"User-Agent": "RESQLINK-KeepAlive/1.0"})
            duration_ms = round((time.perf_counter() - start) * 1000, 2)

            _stats["ping_count"] += 1
            _stats["last_ping_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
            _stats["last_ping_status"] = resp.status_code
            _stats["last_ping_duration_ms"] = duration_ms
            _stats["last_error"] = None

            logger.info(
                "keep_alive_ping_success",
                url=target_url,
                status=resp.status_code,
                duration_ms=duration_ms,
                total_pings=_stats["ping_count"],
            )
            return {
                "success": resp.is_success,
                "status_code": resp.status_code,
                "duration_ms": duration_ms,
                "url": target_url,
            }
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        _stats["last_ping_at"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        _stats["last_ping_status"] = "error"
        _stats["last_ping_duration_ms"] = duration_ms
        _stats["last_error"] = str(exc)

        logger.warning(
            "keep_alive_ping_failed",
            url=target_url,
            error=str(exc),
            duration_ms=duration_ms,
        )
        return {
            "success": False,
            "error": str(exc),
            "duration_ms": duration_ms,
            "url": target_url,
        }


async def _keep_alive_loop(interval_seconds: int = 300) -> None:
    """
    Background loop that pings the health endpoint every 5 minutes (default: 300s)
    to keep Render's free tier backend instance continuously awake and active.
    """
    # Wait 15 seconds after application startup before initiating the first ping
    await asyncio.sleep(15)

    while True:
        try:
            await ping_health_endpoint()
        except asyncio.CancelledError:
            logger.info("keep_alive_task_cancelled")
            break
        except Exception as exc:
            logger.error("keep_alive_unexpected_error", error=str(exc))

        try:
            await asyncio.sleep(interval_seconds)
        except asyncio.CancelledError:
            logger.info("keep_alive_sleep_cancelled")
            break


def start_keep_alive_task() -> None:
    """Start background keep-alive task if enabled."""
    global _keep_alive_task
    settings = get_settings()

    if not settings.KEEP_ALIVE_ENABLED:
        logger.info("keep_alive_disabled")
        return

    if _keep_alive_task is None or _keep_alive_task.done():
        set_startup_time()
        _keep_alive_task = asyncio.create_task(
            _keep_alive_loop(settings.KEEP_ALIVE_INTERVAL_SECONDS)
        )
        logger.info(
            "keep_alive_started",
            interval_seconds=settings.KEEP_ALIVE_INTERVAL_SECONDS,
            target_url=get_target_ping_url(),
        )


async def stop_keep_alive_task() -> None:
    """Stop the background keep-alive task gracefully."""
    global _keep_alive_task
    if _keep_alive_task and not _keep_alive_task.done():
        _keep_alive_task.cancel()
        try:
            await _keep_alive_task
        except asyncio.CancelledError:
            pass
        _keep_alive_task = None
        logger.info("keep_alive_stopped")


def get_keep_alive_stats() -> dict[str, Any]:
    """Return status and history of keep-alive pings."""
    settings = get_settings()
    return {
        "enabled": settings.KEEP_ALIVE_ENABLED,
        "interval_seconds": settings.KEEP_ALIVE_INTERVAL_SECONDS,
        "target_url": _stats["target_url"] or get_target_ping_url(),
        "total_pings": _stats["ping_count"],
        "last_ping_at": _stats["last_ping_at"],
        "last_ping_status": _stats["last_ping_status"],
        "last_ping_duration_ms": _stats["last_ping_duration_ms"],
        "last_error": _stats["last_error"],
    }
