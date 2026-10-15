"""Alert/SOS endpoint tests."""
from __future__ import annotations

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio

_SOS_PAYLOAD = {
    "category": "CARDIAC",
    "networkTier": "5G_HIGH_SPEED",
    "language": "en",
    "selectedPreset": {
        "name": "KSSEM Campus",
        "ward": "Vajrahalli / Mallasandra (Outer Ward)",
        "latitude": 12.8715,
        "longitude": 77.5452,
        "isPeripheral": True,
        "pincode": "560109",
    },
    "currentLocation": None,
    "citizenName": "Test Citizen",
    "citizenPhone": "+91 99999 00000",
}


async def test_trigger_sos(client: AsyncClient, patient_token: str):
    resp = await client.post(
        "/api/sos",
        json=_SOS_PAYLOAD,
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["category"] == "CARDIAC"
    # SOS now enters AWAITING_DISPATCH — ambulance is staged, awaiting hospital acceptance
    assert data["status"] == "AWAITING_DISPATCH"
    assert data["assignedResponder"] is not None
    assert data["assignedHospital"] is not None


async def test_trigger_sos_unauthenticated(client: AsyncClient):
    resp = await client.post("/api/sos", json=_SOS_PAYLOAD)
    assert resp.status_code == 401


async def test_cancel_sos(client: AsyncClient, patient_token: str):
    # Create first
    create_resp = await client.post(
        "/api/sos", json=_SOS_PAYLOAD,
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    alert_id = create_resp.json()["id"]

    cancel_resp = await client.post(
        f"/api/alerts/{alert_id}/cancel",
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert cancel_resp.status_code == 200
    assert cancel_resp.json()["ok"] is True


async def test_update_alert_status(client: AsyncClient, admin_token: str, patient_token: str):
    create_resp = await client.post(
        "/api/sos", json=_SOS_PAYLOAD,
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    alert_id = create_resp.json()["id"]

    update_resp = await client.patch(
        f"/api/alerts/{alert_id}/status",
        json={"status": "ON_SCENE"},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "ON_SCENE"


async def test_list_alerts(client: AsyncClient, admin_token: str):
    resp = await client.get("/api/alerts", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    assert "alertHistory" in resp.json()


async def test_sos_sms_fallback(client: AsyncClient, patient_token: str):
    payload = {**_SOS_PAYLOAD, "networkTier": "2G_SMS_FALLBACK"}
    resp = await client.post(
        "/api/sos", json=payload,
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["fallbackSMSUsed"] is True
    assert data["smsPayloadRaw"] is not None
    assert data["smsPayloadRaw"].startswith("RESQ#")


async def test_simulate_incident_admin_only(client: AsyncClient, admin_token: str, patient_token: str):
    # Patient cannot simulate
    resp = await client.post("/api/simulate/incident", headers={"Authorization": f"Bearer {patient_token}"})
    assert resp.status_code == 403

    # Admin can
    resp = await client.post("/api/simulate/incident", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 201


async def test_bootstrap(client: AsyncClient, admin_token: str):
    resp = await client.get("/api/bootstrap", headers={"Authorization": f"Bearer {admin_token}"})
    assert resp.status_code == 200
    data = resp.json()
    assert "hospitals" in data
    assert "responders" in data
    assert "eegMetrics" in data


async def test_accept_and_dispatch(client: AsyncClient, patient_token: str, admin_token: str):
    """Hospital accept-and-dispatch transitions alert from AWAITING_DISPATCH to DISPATCHED."""
    # Citizen triggers SOS — lands in AWAITING_DISPATCH
    create_resp = await client.post(
        "/api/sos", json=_SOS_PAYLOAD,
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    assert create_resp.status_code == 201
    alert_id = create_resp.json()["id"]
    assert create_resp.json()["status"] == "AWAITING_DISPATCH"

    # Hospital staff accept and dispatch
    dispatch_resp = await client.post(
        f"/api/hospitals/inbound/{alert_id}/accept-and-dispatch",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert dispatch_resp.status_code == 200
    data = dispatch_resp.json()
    assert data["ok"] is True
    assert data["status"] == "DISPATCHED"
    assert data["alertId"] == alert_id
    assert data["dispatchedAt"] is not None

    # Confirm the stored alert reflects the new status
    get_resp = await client.get(
        f"/api/alerts/{alert_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert get_resp.status_code == 200
    assert get_resp.json()["status"] == "DISPATCHED"
    assert "dispatchedAt" in get_resp.json()["statusTimestamps"]


async def test_accept_and_dispatch_wrong_status(client: AsyncClient, patient_token: str, admin_token: str):
    """Calling accept-and-dispatch on an already-dispatched alert returns 409."""
    create_resp = await client.post(
        "/api/sos", json=_SOS_PAYLOAD,
        headers={"Authorization": f"Bearer {patient_token}"},
    )
    alert_id = create_resp.json()["id"]

    # First acceptance — should succeed
    await client.post(
        f"/api/hospitals/inbound/{alert_id}/accept-and-dispatch",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    # Second call — alert is now DISPATCHED, should return 409
    repeat = await client.post(
        f"/api/hospitals/inbound/{alert_id}/accept-and-dispatch",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert repeat.status_code == 409
