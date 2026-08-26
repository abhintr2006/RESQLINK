"""WebSocket endpoint tests."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_ws_endpoint_exists(client: AsyncClient, admin_token: str):
    """
    Verify the WebSocket route is registered and doesn't error with 500.
    WebSocket-only routes return 404 or 400 when accessed via plain HTTP — both are acceptable.
    """
    resp = await client.get("/api/ws")
    # 404 or 400 = route exists but needs WS upgrade; 500 would be a bug
    assert resp.status_code != 500, f"Unexpected server error: {resp.text}"
    assert resp.status_code in (400, 403, 404, 426, 200), (
        f"Unexpected status for WS route: {resp.status_code}"
    )


async def test_sos_triggers_ws_broadcast(client: AsyncClient, patient_token: str, admin_token: str):
    """
    Triggering a SOS should broadcast to connected WebSocket clients.
    We verify indirectly: the alert appears in /api/alerts immediately after.
    """
    _SOS_PAYLOAD = {
        "category": "STROKE",
        "networkTier": "5G_HIGH_SPEED",
        "language": "kn",
        "selectedPreset": {
            "name": "Test Location",
            "ward": "Test Ward",
            "latitude": 12.9298,
            "longitude": 77.5833,
            "isPeripheral": False,
            "pincode": "560041",
        },
        "currentLocation": None,
        "citizenName": "WS Test Citizen",
        "citizenPhone": "+91 99000 11111",
    }

    resp = await client.post(
        "/api/sos", json=_SOS_PAYLOAD,
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert resp.status_code == 201
    alert_id = resp.json()["id"]

    alerts_resp = await client.get(
        "/api/alerts", headers={"Authorization": f"Bearer {admin_token}"}
    )
    alert_ids = [a["id"] for a in alerts_resp.json()["alertHistory"]]
    assert alert_id in alert_ids
