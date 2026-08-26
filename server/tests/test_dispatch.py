"""Unit tests for the stateless dispatch engine — no DB required."""
from __future__ import annotations

import pytest

from app.services.dispatch import (
    DispatchDecision,
    HospitalSnapshot,
    ResponderSnapshot,
    haversine_meters,
    run_dispatch,
)

# These are pure synchronous unit tests — no asyncio mark needed


def _make_responders() -> list[ResponderSnapshot]:
    return [
        ResponderSnapshot(
            id="R-ALS-1", name="ALS Unit 1", type="ALS_AMBULANCE",
            vehicle_number="KA-01", driver_name="Driver A", contact_number="",
            base_hospital="Hospital A", current_lat=12.872, current_lng=77.546,
            is_available=True, speed_kmh=40, eta_minutes=5,
        ),
        ResponderSnapshot(
            id="R-BIKE-1", name="Bike Medic 1", type="FIRST_RESPONDER_BIKE",
            vehicle_number="KA-02", driver_name="Driver B", contact_number="",
            base_hospital="Hospital B", current_lat=12.930, current_lng=77.590,
            is_available=True, speed_kmh=55, eta_minutes=4,
        ),
    ]


def _make_hospitals() -> list[HospitalSnapshot]:
    return [
        HospitalSnapshot(
            id="H-1", name="Hospital A", area="Area A",
            latitude=12.8715, longitude=77.5452, trauma_level=1,
            icu_beds_available=10, oxygen_available=True, contact_number="",
        ),
    ]


def test_haversine_same_point():
    assert haversine_meters(12.87, 77.54, 12.87, 77.54) == pytest.approx(0.0)


def test_haversine_known_distance():
    d = haversine_meters(12.87, 77.54, 12.879, 77.54)
    assert 900 < d < 1100


def test_dispatch_prefers_als_for_cardiac():
    loc = {"latitude": 12.871, "longitude": 77.545}
    result = run_dispatch(loc, "CARDIAC", False, _make_responders(), _make_hospitals())
    assert isinstance(result, DispatchDecision)
    assert result.matched_responder["type"] == "ALS_AMBULANCE"
    assert result.suggested_als is True


def test_dispatch_peripheral_equity_bonus():
    loc = {"latitude": 12.871, "longitude": 77.545}
    result = run_dispatch(loc, "ELDERLY_FALL", True, _make_responders(), _make_hospitals())
    assert result.equity_priority_applied is True
    assert "equity" in result.ai_rationale.lower() or "peripheral" in result.ai_rationale.lower()


def test_dispatch_with_no_available_responders_uses_all():
    """If no responders are available, dispatch should still pick the best one."""
    responders = _make_responders()
    for r in responders:
        r.is_available = False
    loc = {"latitude": 12.871, "longitude": 77.545}
    result = run_dispatch(loc, "STROKE", False, responders, _make_hospitals())
    assert result.matched_responder is not None


def test_dispatch_ai_rationale_contains_responder_name():
    loc = {"latitude": 12.871, "longitude": 77.545}
    result = run_dispatch(loc, "CARDIAC", False, _make_responders(), _make_hospitals())
    assert result.matched_responder["name"] in result.ai_rationale
