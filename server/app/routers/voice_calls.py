from __future__ import annotations

import hashlib
import hmac
import json
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request, status

from app.core.config import get_settings
from app.core.deps import AnyUser, DbSession
from app.schemas.voice_call import VoiceCallRequest
from app.services.voice_call import voice_call_service

router = APIRouter(prefix="/api/emergency-occurrences", tags=["AI voice call"])


@router.post("/{occurrence_id}/voice-call", status_code=202)
async def initiate_voice_call(
    occurrence_id: str,
    body: VoiceCallRequest,
    background_tasks: BackgroundTasks,
    user: AnyUser,
) -> dict[str, Any]:
    try:
        claims = await voice_call_service.validate_handoff(occurrence_id, body.handoffToken)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    if user.role == "patient" and claims.get("sub") != user.username:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Handoff identity does not match authenticated user")
    background_tasks.add_task(voice_call_service.initiate_with_retries, occurrence_id, body.handoffToken, user.username)
    return {"accepted": True, "occurrenceId": occurrence_id, "stage": "AI_VOICE_CALL", "status": "QUEUED"}


@router.post("/{occurrence_id}/voice-call/callback")
async def telephony_callback(occurrence_id: str, request: Request) -> dict[str, Any]:
    """Receive a provider callback after verifying the shared callback signature.

    A telephony gateway should send JSON with `callId`, `status`, and optional
    `metadata`, plus `X-Resqlink-Signature` equal to HMAC-SHA256(secret,
    occurrence_id + ":" + call_id + ":" + status).
    """
    settings = get_settings()
    if not settings.TELEPHONY_CALLBACK_SECRET:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Telephony callbacks are not configured")
    try:
        payload = await request.json()
        call_id = str(payload["callId"])
        callback_status = str(payload["status"])
        metadata = payload.get("metadata") or {}
        provided_signature = request.headers.get("X-Resqlink-Signature", "")
    except (ValueError, KeyError, TypeError) as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid callback payload") from exc

    signed_value = f"{occurrence_id}:{call_id}:{callback_status}"
    expected_signature = hmac.new(settings.TELEPHONY_CALLBACK_SECRET.encode(), signed_value.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(provided_signature, expected_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid telephony callback signature")
    try:
        return await voice_call_service.confirm_callback(occurrence_id, call_id, callback_status, metadata)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
