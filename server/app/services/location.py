from __future__ import annotations

import random
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from app.services.dispatch import haversine_meters


@dataclass
class LocationLockResult:
    is_locked: bool
    samples: list[dict[str, Any]]
    final_coordinate: dict[str, Any] | None
    confidence_score: int
    lock_duration_ms: int
    attempt_count: int

    def to_dict(self) -> dict[str, Any]:
        return {
            "isLocked": self.is_locked,
            "samples": self.samples,
            "finalCoordinate": self.final_coordinate,
            "confidenceScore": self.confidence_score,
            "lockDurationMs": self.lock_duration_ms,
            "attemptCount": self.attempt_count,
        }


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _make_coordinate(
    base_lat: float,
    base_lng: float,
    tier: str,
    supplied: dict[str, Any] | None = None,
) -> dict[str, Any]:
    if supplied:
        return supplied
    jitter = 0.00004 if tier != "2G_SMS_FALLBACK" else 0.000025
    provider_map = {
        "5G_HIGH_SPEED": ("GPS_HARDWARE", 12.0),
        "3G_SPOTTY": ("CELL_TRIANGULATION", 38.5),
        "2G_SMS_FALLBACK": ("MANUAL_PRESET", 42.0),
    }
    provider, accuracy = provider_map.get(tier, ("GPS_HARDWARE", 15.0))
    return {
        "latitude": base_lat + random.uniform(-jitter, jitter),
        "longitude": base_lng + random.uniform(-jitter, jitter),
        "accuracy": accuracy,
        "timestamp": int(datetime.now().timestamp() * 1000),
        "provider": provider,
    }


def lock_location(
    base_lat: float,
    base_lng: float,
    tier: str,
    supplied_coord: dict[str, Any] | None = None,
) -> tuple[dict[str, Any], LocationLockResult]:
    """
    Dual-reading temporal location verification (≤25 m delta, ≤40 m accuracy).
    Returns (final_coordinate, LocationLockResult).
    """
    first = _make_coordinate(base_lat, base_lng, tier, supplied_coord)
    second = _make_coordinate(base_lat, base_lng, tier)

    delta = haversine_meters(first["latitude"], first["longitude"], second["latitude"], second["longitude"])
    first_pass = first["accuracy"] <= 40
    second_pass = delta <= 25
    locked = first_pass and second_pass

    confidence = (
        max(85, min(99, round(100 - min(first["accuracy"], second["accuracy"]) * 0.8)))
        if locked
        else 65
    )
    samples = [
        {
            "sampleIndex": 1,
            "coordinate": first,
            "passedConsistency": first_pass,
            "timeAcquired": _now_iso(),
        },
        {
            "sampleIndex": 2,
            "coordinate": second,
            "deltaFromPrevious": round(delta, 2),
            "passedConsistency": second_pass,
            "timeAcquired": _now_iso(),
        },
    ]
    result = LocationLockResult(
        is_locked=locked,
        samples=samples,
        final_coordinate=second if locked else None,
        confidence_score=confidence,
        lock_duration_ms=1450,
        attempt_count=2,
    )
    final_coord = second if locked else second  # always return second as best estimate
    return final_coord, result
