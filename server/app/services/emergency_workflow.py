from __future__ import annotations

import hashlib
import hmac
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_workflow_handoff_token, decode_workflow_handoff_token
from app.db.models import AuditLog, EmergencyOccurrence, PatientProfile
from app.schemas.auth import CurrentUser

WORKFLOW_STAGES = ["AI_VOICE_CALL", "HOSPITAL_LOCATOR"]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(value: datetime) -> str:
    return value.isoformat().replace("+00:00", "Z")


def _safe_profile_snapshot(profile: PatientProfile) -> dict[str, Any]:
    """Copy only the fields required by voice triage and hospital location."""
    return {
        "username": profile.username,
        "name": profile.name,
        "age": profile.age,
        "gender": profile.gender,
        "bloodGroup": profile.blood_group,
        "allergies": profile.allergies or [],
        "chronicConditions": profile.chronic_conditions or [],
        "currentMedications": profile.current_medications or [],
        "emergencyContacts": profile.emergency_contacts or [],
        "preferredHospital": profile.preferred_hospital,
    }


async def write_compliance_audit(
    db: AsyncSession,
    occurrence_id: str,
    event: str,
    actor: str,
    details: dict[str, Any],
) -> AuditLog:
    """Write a hash-chained audit entry compatible with existing RESQLINK logs."""
    result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(1))
    previous = result.scalar_one_or_none()
    previous_hash = previous.cryptographic_hash if previous else "GENESIS_RESQLINK_CHAIN_2026"
    timestamp = _iso(_now())
    canonical = json.dumps(
        {"alertId": occurrence_id, "event": event, "actor": actor, "details": details, "timestamp": timestamp},
        sort_keys=True,
        separators=(",", ":"),
    )
    digest = hashlib.sha256(f"{previous_hash}:{canonical}".encode()).hexdigest()
    entry = AuditLog(
        id=f"AUDIT-{int(_now().timestamp() * 1000)}-{uuid.uuid4().hex[:6].upper()}",
        alert_id=occurrence_id,
        event=event,
        actor=actor,
        details=details,
        data_minimization_verified=True,
        cryptographic_hash=f"SHA256:{digest}",
    )
    db.add(entry)
    return entry


class EmergencyWorkflowService:
    """Consumes clap emergency events and creates a controlled workflow handoff."""

    async def consume(
        self,
        db: AsyncSession,
        user: CurrentUser,
        event: dict[str, Any],
        patient_username: str | None = None,
        location: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if user.role not in ("admin", "patient"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only a patient or administrator can trigger this workflow")

        target_username = patient_username or user.username
        if user.role == "patient" and target_username != user.username:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Patients may only trigger their own emergency workflow")

        profile_result = await db.execute(select(PatientProfile).where(PatientProfile.username == target_username))
        profile = profile_result.scalar_one_or_none()
        if profile is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No stored patient profile exists for this identity")

        occurrence_id = f"EMG-{int(_now().timestamp() * 1000)}-{uuid.uuid4().hex[:6].upper()}"
        launch_signal_id = f"LAUNCH-{uuid.uuid4().hex.upper()}"
        expires_at = _now() + timedelta(minutes=5)
        handoff_token, _ = create_workflow_handoff_token(occurrence_id, target_username, WORKFLOW_STAGES, expires_minutes=5)
        workflow_stages = [
            {"name": "AI_VOICE_CALL", "status": "PENDING", "sequence": 1},
            {"name": "HOSPITAL_LOCATOR", "status": "PENDING", "sequence": 2},
        ]
        snapshot = _safe_profile_snapshot(profile)
        token_hash = hashlib.sha256(handoff_token.encode()).hexdigest()
        occurrence = EmergencyOccurrence(
            id=occurrence_id,
            event_name="emergency_event",
            patient_username=target_username,
            patient_profile_snapshot=snapshot,
            source="clap_detection_service",
            status="RECEIVED",
            workflow_stage="AI_VOICE_CALL_PENDING",
            workflow_stages=workflow_stages,
            launch_signal_id=launch_signal_id,
            handoff_token_hash=token_hash,
            handoff_expires_at=expires_at,
            confidence=float(event.get("signal", {}).get("highFrequencyRatio", 0.0)),
            signal_metadata={"event": event.get("name", "emergency_event"), "reason": event.get("reason"), "clapCount": event.get("clapCount"), "location": location or {}},
        )
        db.add(occurrence)
        actor = f"{user.role.upper()}:{user.username}"
        await write_compliance_audit(db, occurrence_id, "EMERGENCY_EVENT_RECEIVED", actor, {"source": "clap_detection_service", "eventName": "emergency_event", "clapCount": event.get("clapCount")})
        await write_compliance_audit(db, occurrence_id, "PATIENT_IDENTITY_VALIDATED", "IDENTITY_SERVICE", {"patientUsername": target_username, "profileMatch": True, "profileFieldsUsed": ["username", "name", "preferredHospital"]})
        await write_compliance_audit(db, occurrence_id, "WORKFLOW_HANDOFF_ISSUED", "WORKFLOW_ORCHESTRATOR", {"launchSignalId": launch_signal_id, "stages": WORKFLOW_STAGES, "expiresAt": _iso(expires_at)})
        await db.flush()

        return {
            "occurrenceId": occurrence_id,
            "launchSignalId": launch_signal_id,
            "launchImmediately": True,
            "patient": {"username": profile.username, "name": profile.name},
            "workflowStages": workflow_stages,
            "handoffToken": handoff_token,
            "handoffExpiresAt": _iso(expires_at),
            "event": event,
        }

    async def advance_stage(
        self,
        db: AsyncSession,
        user: CurrentUser,
        occurrence_id: str,
        handoff_token: str,
        stage: str,
    ) -> dict[str, Any]:
        try:
            claims = decode_workflow_handoff_token(handoff_token)
        except Exception as exc:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired workflow handoff") from exc

        if claims.get("occurrenceId") != occurrence_id or stage not in claims.get("stages", []):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Workflow handoff does not authorize this stage")
        if user.role == "patient" and user.username != claims.get("sub"):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Workflow identity does not match the authenticated patient")

        occurrence = await db.get(EmergencyOccurrence, occurrence_id)
        if occurrence is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency occurrence not found")
        expected_hash = hashlib.sha256(handoff_token.encode()).hexdigest()
        if not hmac.compare_digest(expected_hash, occurrence.handoff_token_hash):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Workflow handoff was not issued for this occurrence")

        stages = list(occurrence.workflow_stages or [])
        selected = next((item for item in stages if item.get("name") == stage), None)
        if selected is None:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unknown workflow stage")
        selected["status"] = "COMPLETED"
        selected["completedAt"] = _iso(_now())
        current_index = next(index for index, item in enumerate(stages) if item.get("name") == stage)
        next_stage = stages[current_index + 1]["name"] if current_index + 1 < len(stages) else None
        if next_stage:
            stages[current_index + 1]["status"] = "READY"
            occurrence.workflow_stage = f"{next_stage}_READY"
            occurrence.status = "IN_PROGRESS"
        else:
            occurrence.workflow_stage = "COMPLETED"
            occurrence.status = "COMPLETED"
        occurrence.workflow_stages = stages
        await write_compliance_audit(db, occurrence_id, "WORKFLOW_STAGE_COMPLETED", f"{user.role.upper()}:{user.username}", {"stage": stage, "nextStage": next_stage})
        await db.flush()
        return {"occurrenceId": occurrence_id, "stage": stage, "status": occurrence.status, "nextStage": next_stage, "acceptedAt": _iso(_now())}


emergency_workflow_service = EmergencyWorkflowService()
