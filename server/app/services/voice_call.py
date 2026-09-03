from __future__ import annotations

import asyncio
import hashlib
import hmac
import html
import json
import math
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import decode_workflow_handoff_token
from app.db.base import get_session_factory
from app.db.models import AuditLog, EmergencyOccurrence, Hospital, HospitalStatus, PatientProfile, VoiceCallAttempt


@dataclass(frozen=True)
class TTSResult:
    provider: str
    audio_url: str | None
    provider_id: str


@dataclass(frozen=True)
class CallResult:
    provider: str
    call_id: str
    status: str
    delivery_status: str | None
    error: str | None = None


class TTSAdapter(ABC):
    @abstractmethod
    async def synthesize(self, message: str) -> TTSResult:
        raise NotImplementedError


class SimulatedTTSAdapter(TTSAdapter):
    async def synthesize(self, message: str) -> TTSResult:
        return TTSResult("simulated", None, f"TTS-{uuid.uuid4().hex.upper()}")


class HttpTTSAdapter(TTSAdapter):
    """Generic JSON TTS adapter; provider must return a public audio URL."""

    async def synthesize(self, message: str) -> TTSResult:
        settings = get_settings()
        headers = {"Authorization": f"Bearer {settings.TTS_API_KEY}", "Content-Type": "application/json"}
        payload = {"input": message, "voice": settings.TTS_VOICE, "format": "mp3"}
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post(settings.TTS_API_URL, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
        audio_url = data.get("audio_url") or data.get("audioUrl") or data.get("url")
        if not audio_url:
            raise RuntimeError("TTS provider did not return a public audio URL")
        return TTSResult(settings.TTS_PROVIDER, audio_url, str(data.get("id", uuid.uuid4().hex)))


def get_tts_adapter() -> TTSAdapter:
    return HttpTTSAdapter() if get_settings().tts_configured else SimulatedTTSAdapter()


class TelephonyAdapter(ABC):
    @abstractmethod
    async def place_call(self, destination: str, message: str, audio_url: str | None, callback_url: str | None) -> CallResult:
        raise NotImplementedError


class SimulatedTelephonyAdapter(TelephonyAdapter):
    async def place_call(self, destination: str, message: str, audio_url: str | None, callback_url: str | None) -> CallResult:
        return CallResult("simulated", f"CA-{uuid.uuid4().hex.upper()}", "QUEUED", "SIMULATED")


class TwilioVoiceAdapter(TelephonyAdapter):
    def __init__(self) -> None:
        from twilio.rest import Client  # type: ignore[import]
        settings = get_settings()
        self._client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self._from = settings.TWILIO_VOICE_FROM_NUMBER or settings.TWILIO_FROM_NUMBER

    async def place_call(self, destination: str, message: str, audio_url: str | None, callback_url: str | None) -> CallResult:
        safe_message = html.escape(message)
        if audio_url:
            twiml = f"<Response><Play>{html.escape(audio_url)}</Play></Response>"
        else:
            twiml = f"<Response><Say language=\"en-IN\">{safe_message}</Say></Response>"
        kwargs: dict[str, Any] = {"to": destination, "from_": self._from, "twiml": twiml}
        if callback_url:
            kwargs.update({"status_callback": callback_url, "status_callback_event": ["initiated", "ringing", "answered", "completed"], "status_callback_method": "POST"})
        result = await asyncio.to_thread(self._client.calls.create, **kwargs)
        status = str(getattr(result, "status", "queued")).upper()
        return CallResult("twilio_voice", str(result.sid), status, status)


def get_telephony_adapter() -> TelephonyAdapter:
    return TwilioVoiceAdapter() if get_settings().twilio_voice_configured else SimulatedTelephonyAdapter()


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    radius = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lng / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def compose_emergency_message(profile: PatientProfile, location: dict[str, Any], occurrence_id: str, hospital: Hospital) -> str:
    conditions = ", ".join(profile.chronic_conditions or []) or "no conditions recorded"
    allergies = ", ".join(profile.allergies or []) or "none recorded"
    medications = ", ".join(profile.current_medications or []) or "none recorded"
    accuracy = f" within approximately {round(float(location.get('accuracy', 0)))} meters" if location.get("accuracy") is not None else ""
    return (
        f"Emergency alert for {profile.name}. Occurrence {occurrence_id}. "
        f"A validated three clap emergency signal was received. "
        f"Patient conditions: {conditions}. Allergies: {allergies}. Current medications: {medications}. "
        f"Patient location is latitude {float(location['latitude']):.6f}, longitude {float(location['longitude']):.6f}{accuracy}. "
        f"Please prepare emergency reception and confirm this call. Nearest identified facility is {hospital.name}."
    )


async def _audit(db: AsyncSession, occurrence_id: str, event: str, actor: str, details: dict[str, Any]) -> None:
    result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(1))
    previous = result.scalar_one_or_none()
    previous_hash = previous.cryptographic_hash if previous else "GENESIS_RESQLINK_CHAIN_2026"
    timestamp = datetime.now(timezone.utc).isoformat()
    canonical = json.dumps({"alertId": occurrence_id, "event": event, "actor": actor, "details": details, "timestamp": timestamp}, sort_keys=True, separators=(",", ":"))
    digest = hashlib.sha256(f"{previous_hash}:{canonical}".encode()).hexdigest()
    db.add(AuditLog(id=f"AUDIT-{uuid.uuid4().hex.upper()}", alert_id=occurrence_id, event=event, actor=actor, details=details, data_minimization_verified=True, cryptographic_hash=f"SHA256:{digest}"))


class VoiceCallService:
    """Stage 3 orchestrator. Provider calls are disabled by default and simulated locally."""

    async def validate_handoff(self, occurrence_id: str, handoff_token: str) -> dict[str, Any]:
        try:
            claims = decode_workflow_handoff_token(handoff_token)
        except Exception as exc:
            raise ValueError("Invalid or expired workflow handoff") from exc
        if claims.get("occurrenceId") != occurrence_id or "AI_VOICE_CALL" not in claims.get("stages", []):
            raise ValueError("Workflow handoff does not authorize AI voice call")
        return claims

    async def initiate_with_retries(self, occurrence_id: str, handoff_token: str, actor_username: str) -> dict[str, Any]:
        settings = get_settings()
        factory = get_session_factory()
        last_result: dict[str, Any] = {"status": "FAILED", "attempts": 0}
        async with factory() as db:
            async with db.begin():
                occurrence = await db.get(EmergencyOccurrence, occurrence_id)
                if occurrence is None:
                    raise ValueError("Emergency occurrence not found")
                try:
                    claims = await self.validate_handoff(occurrence_id, handoff_token)
                except ValueError:
                    raise
                if claims.get("sub") != occurrence.patient_username:
                    raise ValueError("Workflow handoff does not match occurrence")
                if occurrence.workflow_stage not in ("AI_VOICE_CALL_PENDING", "AI_VOICE_CALL_READY"):
                    return {"status": occurrence.workflow_stage, "attempts": 0}

                location = occurrence.signal_metadata.get("location") or {}
                if "latitude" not in location or "longitude" not in location:
                    occurrence.workflow_stage = "AI_VOICE_CALL_BLOCKED_NO_GPS"
                    occurrence.status = "BLOCKED"
                    await _audit(db, occurrence_id, "VOICE_CALL_BLOCKED", "VOICE_CALL_SERVICE", {"reason": "GPS coordinates unavailable"})
                    return {"status": "BLOCKED", "attempts": 0, "reason": "GPS coordinates unavailable"}

                profile = await db.scalar(select(PatientProfile).where(PatientProfile.username == occurrence.patient_username))
                if profile is None:
                    raise ValueError("Stored patient profile no longer exists")
                hospitals = list((await db.execute(select(Hospital))).scalars())
                if not hospitals:
                    raise ValueError("No hospitals are configured")
                preferred = next((hospital for hospital in hospitals if hospital.id == profile.preferred_hospital), None)
                hospital = preferred or min(hospitals, key=lambda item: _haversine_km(float(location["latitude"]), float(location["longitude"]), item.latitude, item.longitude))
                message = compose_emergency_message(profile, location, occurrence_id, hospital)
                tts = get_tts_adapter()
                telephony = get_telephony_adapter()
                settings = get_settings()
                occurrence.workflow_stage = "AI_VOICE_CALL_IN_PROGRESS"
                occurrence.status = "IN_PROGRESS"
                await _audit(db, occurrence_id, "VOICE_MESSAGE_COMPOSED", "VOICE_CALL_SERVICE", {"hospitalId": hospital.id, "messageLength": len(message), "locationIncluded": True})
                tts_result = await tts.synthesize(message)
                await _audit(db, occurrence_id, "TTS_SYNTHESIZED", "TTS_SERVICE", {"provider": tts_result.provider, "providerId": tts_result.provider_id})
                await db.flush()

                for attempt_number in range(1, max(1, settings.VOICE_CALL_MAX_ATTEMPTS) + 1):
                    attempt = VoiceCallAttempt(id=f"CALL-{uuid.uuid4().hex.upper()}", occurrence_id=occurrence_id, attempt_number=attempt_number, provider=telephony.__class__.__name__, hospital_id=hospital.id, destination_number=hospital.contact_number, message_text=message, audio_url=tts_result.audio_url, status="CREATED")
                    db.add(attempt)
                    await db.flush()
                    try:
                        callback_url = settings.TWILIO_VOICE_STATUS_CALLBACK_URL or None
                        result = await telephony.place_call(hospital.contact_number, message, tts_result.audio_url, callback_url)
                        attempt.provider_call_id = result.call_id
                        attempt.status = result.status
                        attempt.delivery_status = result.delivery_status
                        attempt.retryable = result.status not in ("QUEUED", "INITIATED", "RINGING", "COMPLETED", "ANSWERED", "DELIVERED", "SIMULATED")
                        attempt.completed_at = datetime.now(timezone.utc) if not attempt.retryable else None
                        await _audit(db, occurrence_id, "VOICE_CALL_ATTEMPTED", "VOICE_CALL_SERVICE", {"attempt": attempt_number, "hospitalId": hospital.id, "provider": result.provider, "callId": result.call_id, "status": result.status})
                        last_result = {"status": result.status, "attempts": attempt_number, "callId": result.call_id, "hospitalId": hospital.id}
                        if result.status in ("COMPLETED", "ANSWERED", "DELIVERED", "SIMULATED"):
                            occurrence.workflow_stage = "AI_VOICE_CALL_DELIVERED"
                            occurrence.status = "IN_PROGRESS"
                            await _audit(db, occurrence_id, "VOICE_CALL_DELIVERY_CONFIRMED", "VOICE_CALL_SERVICE", {"callId": result.call_id, "deliveryStatus": result.delivery_status})
                            return last_result
                        if not attempt.retryable:
                            occurrence.workflow_stage = "AI_VOICE_CALL_AWAITING_CONFIRMATION"
                            occurrence.status = "IN_PROGRESS"
                            await _audit(db, occurrence_id, "VOICE_CALL_ACCEPTED_AWAITING_CALLBACK", "VOICE_CALL_SERVICE", {"callId": result.call_id, "providerStatus": result.status})
                            return last_result
                    except Exception as exc:
                        attempt.status = "FAILED"
                        attempt.retryable = attempt_number < settings.VOICE_CALL_MAX_ATTEMPTS
                        attempt.error_detail = str(exc)[:500]
                        await _audit(db, occurrence_id, "VOICE_CALL_ATTEMPT_FAILED", "VOICE_CALL_SERVICE", {"attempt": attempt_number, "error": str(exc)[:200]})
                        last_result = {"status": "FAILED", "attempts": attempt_number, "error": str(exc)[:200]}
                    if attempt_number < settings.VOICE_CALL_MAX_ATTEMPTS:
                        await asyncio.sleep(max(0, settings.VOICE_CALL_RETRY_DELAY_SECONDS))

                occurrence.workflow_stage = "AI_VOICE_CALL_FAILED"
                occurrence.status = "IN_PROGRESS"
                await _audit(db, occurrence_id, "VOICE_CALL_RETRIES_EXHAUSTED", "VOICE_CALL_SERVICE", last_result)
                return last_result

    async def initiate_fixed_sos_call(self, alert_id: str, location: dict[str, Any], category: str, actor_username: str) -> dict[str, Any]:
        """Call the configured SOS recipient with the exact safety message."""
        settings = get_settings()
        factory = get_session_factory()
        message = settings.SOS_VOICE_MESSAGE
        tts_result = await get_tts_adapter().synthesize(message)
        adapter = get_telephony_adapter()
        last_result: dict[str, Any] = {"status": "FAILED", "attempts": 0}
        async with factory() as db:
            async with db.begin():
                await _audit(db, alert_id, "SOS_VOICE_MESSAGE_PREPARED", f"VOICE_CALL_SERVICE:{actor_username}", {"recipient": settings.SOS_RECIPIENT_NUMBER, "message": message, "ttsProvider": tts_result.provider, "category": category, "locationIncludedInSms": True, "location": {"latitude": location.get("latitude"), "longitude": location.get("longitude"), "accuracy": location.get("accuracy")}})
                for attempt_number in range(1, max(1, settings.VOICE_CALL_MAX_ATTEMPTS) + 1):
                    attempt = VoiceCallAttempt(id=f"CALL-{uuid.uuid4().hex.upper()}", occurrence_id=alert_id, attempt_number=attempt_number, provider=adapter.__class__.__name__, hospital_id=None, destination_number=settings.SOS_RECIPIENT_NUMBER, message_text=message, audio_url=tts_result.audio_url, status="CREATED")
                    db.add(attempt)
                    await db.flush()
                    try:
                        callback_url = settings.TWILIO_VOICE_STATUS_CALLBACK_URL or None
                        result = await adapter.place_call(settings.SOS_RECIPIENT_NUMBER, message, tts_result.audio_url, callback_url)
                        attempt.provider_call_id = result.call_id
                        attempt.status = result.status
                        attempt.delivery_status = result.delivery_status
                        attempt.retryable = result.status not in ("QUEUED", "INITIATED", "RINGING", "COMPLETED", "ANSWERED", "DELIVERED", "SIMULATED")
                        if result.status in ("COMPLETED", "ANSWERED", "DELIVERED", "SIMULATED"):
                            attempt.completed_at = datetime.now(timezone.utc)
                            await _audit(db, alert_id, "SOS_VOICE_CALL_DELIVERY_CONFIRMED", "VOICE_CALL_SERVICE", {"recipient": settings.SOS_RECIPIENT_NUMBER, "callId": result.call_id, "status": result.status})
                        else:
                            await _audit(db, alert_id, "SOS_VOICE_CALL_ATTEMPTED", "VOICE_CALL_SERVICE", {"recipient": settings.SOS_RECIPIENT_NUMBER, "callId": result.call_id, "status": result.status, "awaitingCallback": True})
                        last_result = {"status": result.status, "attempts": attempt_number, "callId": result.call_id, "recipient": settings.SOS_RECIPIENT_NUMBER}
                        return last_result
                    except Exception as exc:
                        attempt.status = "FAILED"
                        attempt.retryable = attempt_number < settings.VOICE_CALL_MAX_ATTEMPTS
                        attempt.error_detail = str(exc)[:500]
                        await _audit(db, alert_id, "SOS_VOICE_CALL_ATTEMPT_FAILED", "VOICE_CALL_SERVICE", {"recipient": settings.SOS_RECIPIENT_NUMBER, "attempt": attempt_number, "error": str(exc)[:200]})
                        last_result = {"status": "FAILED", "attempts": attempt_number, "error": str(exc)[:200], "recipient": settings.SOS_RECIPIENT_NUMBER}
                    if attempt_number < settings.VOICE_CALL_MAX_ATTEMPTS:
                        await asyncio.sleep(max(0, settings.VOICE_CALL_RETRY_DELAY_SECONDS))
                await _audit(db, alert_id, "SOS_VOICE_CALL_RETRIES_EXHAUSTED", "VOICE_CALL_SERVICE", last_result)
                return last_result

    async def confirm_callback(self, occurrence_id: str, call_id: str, callback_status: str, metadata: dict[str, Any]) -> dict[str, Any]:
        factory = get_session_factory()
        async with factory() as db:
            async with db.begin():
                attempt = await db.scalar(select(VoiceCallAttempt).where(VoiceCallAttempt.occurrence_id == occurrence_id, VoiceCallAttempt.provider_call_id == call_id).order_by(VoiceCallAttempt.attempt_number.desc()))
                if attempt is None:
                    raise ValueError("Call attempt not found")
                normalized = callback_status.upper()
                attempt.delivery_status = normalized
                attempt.status = normalized
                attempt.callback_metadata = metadata
                attempt.completed_at = datetime.now(timezone.utc)
                attempt.retryable = normalized not in ("COMPLETED", "ANSWERED", "DELIVERED")
                if normalized in ("COMPLETED", "ANSWERED", "DELIVERED"):
                    occurrence = await db.get(EmergencyOccurrence, occurrence_id)
                    if occurrence:
                        occurrence.workflow_stage = "AI_VOICE_CALL_DELIVERED"
                        occurrence.status = "IN_PROGRESS"
                await _audit(db, occurrence_id, "VOICE_CALL_CALLBACK_RECEIVED", "TELEPHONY_CALLBACK", {"callId": call_id, "status": normalized})
                return {"ok": True, "occurrenceId": occurrence_id, "callId": call_id, "status": normalized}


voice_call_service = VoiceCallService()
