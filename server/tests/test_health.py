from __future__ import annotations

import pytest
from httpx import AsyncClient

from app.services.keep_alive import (
    check_database_health,
    get_keep_alive_stats,
    get_target_ping_url,
    get_uptime_seconds,
)


@pytest.mark.asyncio
async def test_api_health_endpoint(client: AsyncClient):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["service"] == "resqlink-backend"
    assert "version" in data
    assert "uptime_seconds" in data
    assert data["database"]["status"] == "connected"
    assert "keep_alive" in data
    assert data["keep_alive"]["interval_seconds"] == 300
    assert data["keep_alive"]["enabled"] is True


@pytest.mark.asyncio
async def test_health_root_endpoint(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert data["database"]["status"] == "connected"


@pytest.mark.asyncio
async def test_check_database_health():
    is_healthy, detail = await check_database_health()
    assert is_healthy is True
    assert detail == "healthy"


@pytest.mark.asyncio
async def test_get_keep_alive_stats():
    stats = get_keep_alive_stats()
    assert stats["enabled"] is True
    assert stats["interval_seconds"] == 300
    assert "target_url" in stats


def test_uptime_seconds():
    uptime = get_uptime_seconds()
    assert isinstance(uptime, float)
    assert uptime >= 0.0


def test_target_ping_url(monkeypatch):
    monkeypatch.setenv("RENDER_EXTERNAL_URL", "https://my-app.onrender.com")
    url = get_target_ping_url()
    assert url == "https://my-app.onrender.com/api/health"
