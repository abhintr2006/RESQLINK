from __future__ import annotations

import asyncio
import json
from typing import Any

import jwt
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.logging import get_logger
from app.core.security import decode_access_token

logger = get_logger(__name__)
router = APIRouter()


class ConnectionManager:
    """Manages active authenticated WebSocket connections and broadcasts events."""

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


manager = ConnectionManager()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    """Authenticated realtime channel for alerts and controlled workflow launch signals.

    The browser supplies the access token as `?token=<JWT>` because WebSocket
    clients cannot rely on the regular fetch Authorization header everywhere.
    """
    token = websocket.query_params.get("token")
    if not token:
        authorization = websocket.headers.get("authorization", "")
        if authorization.lower().startswith("bearer "):
            token = authorization[7:].strip()
    try:
        if not token:
            raise jwt.InvalidTokenError("missing token")
        decode_access_token(token)
    except (jwt.PyJWTError, TypeError, ValueError):
        await websocket.accept()
        await websocket.close(code=1008, reason="Authentication required")
        return

    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
    except Exception:
        await manager.disconnect(websocket)
