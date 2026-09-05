from __future__ import annotations

import random
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from app.core.logging import get_logger

logger = get_logger(__name__)


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
    def send(self, alert_id: str, coord: dict[str, Any], category: str, name: str, citizen_phone: str = "") -> SmsResult:
        ...


class SimulatedSmsAdapter(SmsAdapter):
    """Returns realistic-looking results without any real network call."""

    def send(self, alert_id: str, coord: dict[str, Any], category: str, name: str, citizen_phone: str = "") -> SmsResult:
        payload = _encode_sms(alert_id, coord, category, name)
        return SmsResult(
            message_sid=f"SM{uuid.uuid4().hex[:10]}",
            raw_payload=payload,
            latency_ms=random.randint(1200, 2000),
            status="SIMULATED",
        )


class TwilioSmsAdapter(SmsAdapter):
    """Real Twilio REST API call. Only instantiated when credentials are present."""

    def __init__(self, account_sid: str, auth_token: str, from_number: str, to_number: str = "+918000000000") -> None:
        from twilio.rest import Client  # type: ignore[import]
        self._client = Client(account_sid, auth_token)
        self._from = from_number
        self._to = to_number

    def send(self, alert_id: str, coord: dict[str, Any], category: str, name: str, citizen_phone: str = "") -> SmsResult:
        payload = _encode_sms(alert_id, coord, category, name)
        target_number = citizen_phone if (citizen_phone and citizen_phone.startswith("+")) else self._to
        t0 = time.monotonic()
        try:
            msg = self._client.messages.create(body=payload, from_=self._from, to=target_number)
            latency = round((time.monotonic() - t0) * 1000)
            return SmsResult(
                message_sid=str(msg.sid),
                raw_payload=payload,
                latency_ms=latency,
                status="DELIVERED" if msg.status in ("sent", "delivered", "queued") else "FAILED",
            )
        except Exception as err:
            logger.error("twilio_sms_dispatch_failed", error=str(err), alert_id=alert_id)
            latency = round((time.monotonic() - t0) * 1000)
            return SmsResult(
                message_sid=f"ERR-{uuid.uuid4().hex[:8]}",
                raw_payload=payload,
                latency_ms=latency,
                status="FAILED",
            )


def get_sms_adapter() -> SmsAdapter:
    """Return the Twilio adapter when credentials are configured, else the simulator."""
    from app.core.config import get_settings
    s = get_settings()
    if s.twilio_configured:
        return TwilioSmsAdapter(s.TWILIO_ACCOUNT_SID, s.TWILIO_AUTH_TOKEN, s.TWILIO_FROM_NUMBER, s.TWILIO_TO_NUMBER)
    return SimulatedSmsAdapter()

