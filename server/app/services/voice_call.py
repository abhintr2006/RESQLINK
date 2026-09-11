from __future__ import annotations

import asyncio
import html
import uuid
from dataclasses import dataclass

from app.core.config import get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


@dataclass(frozen=True)
class VoiceCallResult:
    call_sid: str
    recipient_number: str
    status: str
    provider: str
    error: str | None = None


class SimulatedVoiceAdapter:
    async def place_call(self, message: str) -> VoiceCallResult:
        recipient = get_settings().TWILIO_TO_NUMBER
        return VoiceCallResult(f"SIM-CA-{uuid.uuid4().hex[:12]}", recipient, "SIMULATED", "simulated")


class TwilioVoiceAdapter:
    def __init__(self) -> None:
        from twilio.rest import Client  # type: ignore[import]
        settings = get_settings()
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self.from_number = settings.TWILIO_VOICE_FROM_NUMBER or settings.TWILIO_FROM_NUMBER
        self.to_number = settings.TWILIO_TO_NUMBER

    async def place_call(self, message: str) -> VoiceCallResult:
        settings = get_settings()
        twiml = f'<Response><Say language="en-IN">{html.escape(message)}</Say></Response>'
        try:
            call = await asyncio.to_thread(
                self.client.calls.create,
                to=self.to_number,
                from_=self.from_number,
                twiml=twiml,
            )
            return VoiceCallResult(str(call.sid), self.to_number, str(call.status).upper(), "twilio")
        except Exception as exc:
            logger.error("twilio_voice_call_failed", recipient=self.to_number, error=str(exc))
            return VoiceCallResult(f"ERR-{uuid.uuid4().hex[:8]}", self.to_number, "FAILED", "twilio", str(exc))


def get_voice_adapter() -> SimulatedVoiceAdapter | TwilioVoiceAdapter:
    settings = get_settings()
    if settings.twilio_configured and settings.TWILIO_VOICE_FROM_NUMBER:
        return TwilioVoiceAdapter()
    return SimulatedVoiceAdapter()


async def place_fixed_sos_call(alert_id: str, location: dict, category: str) -> VoiceCallResult:
    settings = get_settings()
    message = settings.SOS_VOICE_MESSAGE
    result = await get_voice_adapter().place_call(message)
    logger.info(
        "sos_voice_call_result",
        alert_id=alert_id,
        recipient=result.recipient_number,
        provider=result.provider,
        status=result.status,
        category=category,
        message=message,
        location=location,
    )
    return result
