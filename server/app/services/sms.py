from __future__ import annotations

import random
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any


def _encode_sms(alert_id: str, coord: dict[str, Any], category: str, name: str = "CITIZEN") -> str:
    """Produce the compact RESQ# SMS payload (≤160 chars for GSM/2G)."""
    safe_name = (name or "CITIZEN")[:10]
    ts = datetime.now(timezone.utc).strftime("%H:%M:%S")
    return (
        f"RESQ#{alert_id}"
        f"#LOC:{coord['latitude']:.5f},{coord['longitude']:.5f}"
        f"#ACC:{round(coord['accuracy'])}m"
        f"#TYPE:{category}"
        f"#USR:{safe_name}"
        f"#TIME:{ts}"
        f"#URGENT_108_DISPATCH"
    )


@dataclass
class SmsResult:
    message_sid: str
    raw_payload: str
    latency_ms: int
    status: str  # "DELIVERED" | "FAILED" | "SIMULATED"


class SmsAdapter(ABC):
    @abstractmethod
    def send(self, alert_id: str, coord: dict[str, Any], category: str, name: str) -> SmsResult:
        ...


class SimulatedSmsAdapter(SmsAdapter):
    """Returns realistic-looking results without any real network call."""

    def send(self, alert_id: str, coord: dict[str, Any], category: str, name: str) -> SmsResult:
        payload = _encode_sms(alert_id, coord, category, name)
        return SmsResult(
            message_sid=f"SM{uuid.uuid4().hex[:10]}",
            raw_payload=payload,
            latency_ms=random.randint(1200, 2000),
            status="SIMULATED",
        )


class TwilioSmsAdapter(SmsAdapter):
    """Real Twilio REST API call. Only instantiated when credentials are present."""

    def __init__(self, account_sid: str, auth_token: str, from_number: str) -> None:
        from twilio.rest import Client  # type: ignore[import]
        self._client = Client(account_sid, auth_token)
        self._from = from_number

    def send(self, alert_id: str, coord: dict[str, Any], category: str, name: str) -> SmsResult:
        import time
        payload = _encode_sms(alert_id, coord, category, name)
        # In production supply a real `to` number from the citizen profile
        to_number = "+918000000000"
        t0 = time.monotonic()
        msg = self._client.messages.create(body=payload, from_=self._from, to=to_number)
        latency = round((time.monotonic() - t0) * 1000)
        return SmsResult(
            message_sid=str(msg.sid),
            raw_payload=payload,
            latency_ms=latency,
            status="DELIVERED" if msg.status in ("sent", "delivered", "queued") else "FAILED",
        )


def get_sms_adapter() -> SmsAdapter:
    """Return the Twilio adapter when credentials are configured, else the simulator."""
    from app.core.config import get_settings
    s = get_settings()
    if s.twilio_configured:
        return TwilioSmsAdapter(s.TWILIO_ACCOUNT_SID, s.TWILIO_AUTH_TOKEN, s.TWILIO_FROM_NUMBER)
    return SimulatedSmsAdapter()
