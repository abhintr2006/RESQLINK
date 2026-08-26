from __future__ import annotations

import asyncio
import json
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter()


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts events."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self._connections: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        async with self._lock:
            self._connections.append(ws)
        logger.info("ws_connected", total=len(self._connections))

    async def disconnect(self, ws: WebSocket) -> None:
        async with self._lock:
            self._connections = [c for c in self._connections if c is not ws]
        logger.info("ws_disconnected", total=len(self._connections))

    async def broadcast(self, event: str, payload: Any) -> None:
        """Send a JSON event frame to every connected client."""
        message = json.dumps({"event": event, "data": payload})
        dead: list[WebSocket] = []
        async with self._lock:
            targets = list(self._connections)
        for ws in targets:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        if dead:
            async with self._lock:
                self._connections = [c for c in self._connections if c not in dead]


# Singleton instance shared across routers
manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """
    JWT-optional WebSocket for real-time alert/fleet/hospital events.

    Events pushed:
      - alert_created        { alert }
      - alert_status_updated { alertId, status }
      - responder_updated    { responder }
      - hospital_updated     { hospital }
    """
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive; the server only pushes, client sends pings
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception:
        await manager.disconnect(websocket)
