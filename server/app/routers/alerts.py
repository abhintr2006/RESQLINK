from __future__ import annotations

import hashlib
import json
import random
import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from sqlalchemy import select

from app.core.deps import AdminOrPatient, AdminUser, AnyUser, DbSession
from app.core.logging import get_logger
from app.db.models import Alert, AuditLog, Hospital, Responder
from app.middleware.rate_limit import limiter
from app.routers.ws import manager as ws_manager
from app.schemas.alert import SosRequest, StatusUpdate
from app.services.dispatch import (
    HospitalSnapshot,
    ResponderSnapshot,
    get_guidance,
    run_dispatch,
)
from app.services.location import lock_location
from app.services.sms import get_sms_adapter
from app.services.voice_call import voice_call_service

logger = get_logger(__name__)
router = APIRouter(prefix="/api", tags=["alerts"])


async def _start_fixed_sos_call_safe(alert_id: str, location: dict[str, Any], category: str, actor_username: str) -> None:
    try:
        await voice_call_service.initiate_fixed_sos_call(alert_id, location, category, actor_username)
    except Exception as exc:
        logger.error("fixed_sos_voice_call_failed", alert_id=alert_id, error=str(exc))

_PRESETS = [
    {"name": "KSSEM Campus, Kanakapura Road", "ward": "Vajrahalli / Mallasandra (Outer Ward)", "latitude": 12.8715, "longitude": 77.5452, "isPeripheral": True, "pincode": "560109"},
    {"name": "Jayanagar 4th Block Complex", "ward": "Jayanagar (Central Ward)", "latitude": 12.9298, "longitude": 77.5833, "isPeripheral": False, "pincode": "560041"},
    {"name": "Koramangala Sony World Signal", "ward": "Koramangala (Central Ward)", "latitude": 12.9344, "longitude": 77.6256, "isPeripheral": False, "pincode": "560034"},
    {"name": "Electronic City Phase 1 Toll Gate", "ward": "Electronic City (Outer Ward)", "latitude": 12.8452, "longitude": 77.6602, "isPeripheral": True, "pincode": "560100"},
    {"name": "Majestic KSRTC Central Bus Stand", "ward": "Gandhinagar / Majestic (Core Urban)", "latitude": 12.9778, "longitude": 77.5726, "isPeripheral": False, "pincode": "560009"},
    {"name": "Whitefield ITPL Main Gate", "ward": "Whitefield (Peripheral Ward)", "latitude": 12.9857, "longitude": 77.7318, "isPeripheral": True, "pincode": "560066"},
]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _alert_to_dict(alert: Alert) -> dict[str, Any]:
    return {
        "id": alert.id,
        "shortCode": alert.short_code,
        "timestamp": alert.created_at.isoformat().replace("+00:00", "Z"),
        "category": alert.category,
        "description": alert.description,
        "citizenName": alert.citizen_name,
        "citizenPhone": alert.citizen_phone,
        "location": alert.location,
        "locationLockState": alert.location_lock_state,
        "status": alert.status,
        "statusTimestamps": alert.status_timestamps,
        "networkUsed": alert.network_used,
        "fallbackSMSUsed": alert.fallback_sms_used,
        "smsPayloadRaw": alert.sms_payload_raw,
        "assignedResponder": alert.assigned_responder,
        "assignedHospital": alert.assigned_hospital,
        "estimatedArrivalMinutes": alert.estimated_arrival_minutes,
        "aiTriage": alert.ai_triage,
        "equityMetadata": alert.equity_metadata,
    }


async def _write_audit(
    db: DbSession,
    alert_id: str,
    event: str,
    actor: str,
    details: dict[str, Any],
) -> AuditLog:
    # Get previous hash for chaining
    result = await db.execute(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(1)
    )
    last = result.scalar_one_or_none()
    previous_hash = last.cryptographic_hash if last else "GENESIS_RESQLINK_CHAIN_2026"

    timestamp = _now_iso()
    raw = json.dumps(
        {"alertId": alert_id, "event": event, "actor": actor, "details": details, "timestamp": timestamp},
        ensure_ascii=False, sort_keys=True, separators=(",", ":"),
    )
    digest = hashlib.sha256(f"{previous_hash}:{raw}".encode()).hexdigest()
    entry = AuditLog(
        id=f"AUDIT-{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:4].upper()}",
        alert_id=alert_id,
        event=event,
        actor=actor,
        details=details,
        cryptographic_hash=f"SHA256:{digest}",
    )
    db.add(entry)
    return entry


async def _load_responder_snapshots(db: DbSession) -> list[ResponderSnapshot]:
    result = await db.execute(select(Responder))
    return [
        ResponderSnapshot(
            id=r.id, name=r.name, type=r.type, vehicle_number=r.vehicle_number,
            driver_name=r.driver_name, contact_number=r.contact_number,
            base_hospital=r.base_hospital, current_lat=r.current_lat,
            current_lng=r.current_lng, is_available=r.is_available,
            speed_kmh=r.speed_kmh, eta_minutes=r.eta_minutes,
        )
        for r in result.scalars()
    ]


async def _load_hospital_snapshots(db: DbSession) -> list[HospitalSnapshot]:
    result = await db.execute(select(Hospital))
    return [
        HospitalSnapshot(
            id=h.id, name=h.name, area=h.area, latitude=h.latitude,
            longitude=h.longitude, trauma_level=h.trauma_level,
            icu_beds_available=h.icu_beds_available, oxygen_available=h.oxygen_available,
            contact_number=h.contact_number,
        )
        for h in result.scalars()
    ]


@router.get("/presets")
async def get_presets(user: AnyUser) -> list[dict]:
    return _PRESETS


@router.get("/alerts")
async def list_alerts(user: AnyUser, db: DbSession) -> dict[str, Any]:
    result = await db.execute(select(Alert).order_by(Alert.created_at.desc()))
    all_alerts = [_alert_to_dict(a) for a in result.scalars()]
    active = next((a for a in all_alerts if a["status"] not in ("RESOLVED", "CANCELLED")), None)
    return {"activeAlert": active, "alertHistory": all_alerts}


@router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str, user: AnyUser, db: DbSession) -> dict[str, Any]:
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return _alert_to_dict(alert)


@router.post("/sos", status_code=201)
@limiter.limit("5/minute")
async def trigger_sos(request: Request, body: SosRequest, user: AdminOrPatient, db: DbSession, background_tasks: BackgroundTasks) -> dict[str, Any]:
    preset = body.selectedPreset.model_dump() if body.selectedPreset else _PRESETS[0]
    alert_id = f"BLR-{random.randint(1000, 9999)}"
    short_code = f"RQ-{uuid.uuid4().hex[:4].upper()}"
    triggered_at = _now_iso()

    supplied = body.currentLocation.model_dump() if body.currentLocation else None
    final_coord, lock_result = lock_location(
        preset["latitude"], preset["longitude"], body.networkTier, supplied
    )

    triage = get_guidance(body.category)
    responders = await _load_responder_snapshots(db)
    hospitals = await _load_hospital_snapshots(db)
    decision = run_dispatch(final_coord, body.category, preset.get("isPeripheral", False), responders, hospitals)

    adapter = get_sms_adapter()
    sms_result = adapter.send(alert_id, final_coord, body.category, body.citizenName)
    sms_payload: str | None = sms_result.raw_payload

    alert = Alert(
        id=alert_id,
        short_code=short_code,
        category=body.category,
        description=f"Immediate emergency assistance requested at {preset['name']}",
        citizen_name=body.citizenName,
        citizen_phone=body.citizenPhone,
        location=final_coord,
        location_lock_state=lock_result.to_dict(),
        status="DISPATCHED",
        status_timestamps={"triggeredAt": triggered_at, "confirmedAt": triggered_at, "dispatchedAt": triggered_at},
        network_used=body.networkTier,
        fallback_sms_used=body.networkTier == "2G_SMS_FALLBACK",
        sms_payload_raw=sms_payload,
        assigned_responder=decision.matched_responder,
        assigned_hospital=decision.matched_hospital,
        estimated_arrival_minutes=decision.estimated_arrival_minutes,
        ai_triage={**triage, "aiRationale": decision.ai_rationale, "urgencyLevel": decision.urgency_level, "triageScore": decision.triage_score},
        equity_metadata={
            "deviceTier": "FEATURE_2G" if body.networkTier == "2G_SMS_FALLBACK" else "SMARTPHONE",
            "wardName": preset.get("ward", ""),
            "isPeripheralWard": preset.get("isPeripheral", False),
            "userDemographic": "GENERAL",
        },
    )
    db.add(alert)

    # Mark responder busy
    resp_row = await db.get(Responder, decision.matched_responder["id"])
    if resp_row:
        resp_row.is_available = False
        resp_row.assigned_incident_id = alert_id
        resp_row.eta_minutes = decision.estimated_arrival_minutes

    await _write_audit(db, alert_id, "SOS_TRIGGERED", "CITIZEN", {"category": body.category, "networkTier": body.networkTier, "ward": preset.get("ward", ""), "language": body.language})
    await _write_audit(db, alert_id, "LOCATION_LOCK_VERIFIED", "GEOLOCATION_ENGINE", {"confidenceScore": lock_result.confidence_score, "isLocked": lock_result.is_locked})
    await _write_audit(db, alert_id, "AI_TRIAGE_COMPUTED", "AI_DISPATCH_ENGINE", {"triageScore": decision.triage_score, "urgencyLevel": decision.urgency_level})
    await _write_audit(db, alert_id, "RESPONDER_ALLOCATED", "AI_DISPATCH_ENGINE", {"responderId": decision.matched_responder["id"], "etaMinutes": decision.estimated_arrival_minutes})
    await _write_audit(db, alert_id, "LOCATION_SMS_QUEUED", "SMS_SERVICE", {"recipient": sms_result.recipient_number, "providerStatus": sms_result.status, "locationIncluded": True})

    await db.flush()
    result_dict = _alert_to_dict(alert)
    await ws_manager.broadcast("alert_created", result_dict)
    background_tasks.add_task(_start_fixed_sos_call_safe, alert_id, final_coord, body.category, user.username)
    logger.info("sos_triggered", alert_id=alert_id, category=body.category, sms_recipient=sms_result.recipient_number)
    return result_dict


@router.post("/alerts/{alert_id}/cancel")
async def cancel_sos(alert_id: str, user: AdminOrPatient, db: DbSession) -> dict[str, Any]:
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = "CANCELLED"
    alert.status_timestamps = {**alert.status_timestamps, "cancelledAt": _now_iso()}
    if alert.assigned_responder:
        resp_row = await db.get(Responder, alert.assigned_responder.get("id", ""))
        if resp_row:
            resp_row.is_available = True
            resp_row.assigned_incident_id = None
    await _write_audit(db, alert_id, "INCIDENT_RESOLVED", "CITIZEN", {"action": "CANCELLED_BY_USER"})
    await db.flush()
    await ws_manager.broadcast("alert_status_updated", {"alertId": alert_id, "status": "CANCELLED"})
    return {"ok": True, "alertId": alert_id}


@router.patch("/alerts/{alert_id}/status")
async def update_alert_status(alert_id: str, body: StatusUpdate, user: AnyUser, db: DbSession) -> dict[str, Any]:
    alert = await db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.status = body.status
    key = f"{body.status.lower()}At"
    alert.status_timestamps = {**alert.status_timestamps, key: _now_iso()}
    await _write_audit(db, alert_id, "STATUS_UPDATED", "DISPATCHER_CAD", {"newStatus": body.status})
    await db.flush()
    result_dict = _alert_to_dict(alert)
    await ws_manager.broadcast("alert_status_updated", {"alertId": alert_id, "status": body.status})
    return result_dict


@router.post("/simulate/incident", status_code=201)
async def simulate_incident(user: AdminUser, db: DbSession) -> dict[str, Any]:
    preset = random.choice(_PRESETS)
    category = random.choice(["TRAUMA_ACCIDENT", "CARDIAC", "STROKE", "RESPIRATORY", "ELDERLY_FALL"])
    location = {
        "latitude": preset["latitude"] + random.uniform(-0.005, 0.005),
        "longitude": preset["longitude"] + random.uniform(-0.005, 0.005),
        "accuracy": 10,
        "timestamp": int(datetime.now().timestamp() * 1000),
        "provider": "GPS_HARDWARE",
    }
    responders = await _load_responder_snapshots(db)
    hospitals = await _load_hospital_snapshots(db)
    decision = run_dispatch(location, category, preset["isPeripheral"], responders, hospitals)
    alert_id = f"EXT-{random.randint(2000, 9999)}"
    triage = get_guidance(category)
    alert = Alert(
        id=alert_id,
        short_code=f"EXT-{uuid.uuid4().hex[:4].upper()}",
        category=category,
        description=f"Emergency reported in {preset['ward']}",
        citizen_name="Bengaluru Citizen",
        citizen_phone="+91 99887 66554",
        location=location,
        location_lock_state={"isLocked": True, "samples": [], "finalCoordinate": location, "confidenceScore": 94, "lockDurationMs": 1200, "attemptCount": 2},
        status="CONFIRMED",
        status_timestamps={"triggeredAt": _now_iso(), "confirmedAt": _now_iso()},
        network_used="5G_HIGH_SPEED",
        fallback_sms_used=False,
        assigned_responder=decision.matched_responder,
        assigned_hospital=decision.matched_hospital,
        estimated_arrival_minutes=decision.estimated_arrival_minutes,
        ai_triage=triage,
        equity_metadata={"deviceTier": "SMARTPHONE", "wardName": preset["ward"], "isPeripheralWard": preset["isPeripheral"], "userDemographic": "GENERAL"},
    )
    db.add(alert)
    await _write_audit(db, alert_id, "SOS_TRIGGERED", "CITIZEN", {"simulated": True, "ward": preset["ward"], "category": category})
    await db.flush()
    result_dict = _alert_to_dict(alert)
    await ws_manager.broadcast("alert_created", result_dict)
    return result_dict


@router.get("/bootstrap")
async def bootstrap(user: AnyUser, db: DbSession) -> dict[str, Any]:
    from app.db.models import (
        Hospital,
        HospitalAdmission,
        HospitalStatus,
        PatientProfile,
    )

    alerts_result = await db.execute(select(Alert).order_by(Alert.created_at.desc()))
    all_alerts = [_alert_to_dict(a) for a in alerts_result.scalars()]
    active = next((a for a in all_alerts if a["status"] not in ("RESOLVED", "CANCELLED")), None)

    resp_result = await db.execute(select(Responder))
    responders = [
        {"id": r.id, "name": r.name, "type": r.type, "vehicleNumber": r.vehicle_number,
         "driverName": r.driver_name, "contactNumber": r.contact_number,
         "baseHospital": r.base_hospital,
         "currentLocation": {"latitude": r.current_lat, "longitude": r.current_lng},
         "isAvailable": r.is_available, "speedKmh": r.speed_kmh, "etaMinutes": r.eta_minutes,
         "assignedIncidentId": r.assigned_incident_id}
        for r in resp_result.scalars()
    ]

    hosp_result = await db.execute(select(Hospital))
    hospitals = [
        {"id": h.id, "name": h.name, "area": h.area, "latitude": h.latitude, "longitude": h.longitude,
         "traumaLevel": h.trauma_level, "icuBedsAvailable": h.icu_beds_available,
         "oxygenAvailable": h.oxygen_available, "contactNumber": h.contact_number}
        for h in hosp_result.scalars()
    ]

    status_result = await db.execute(select(HospitalStatus))
    statuses = {
        s.hospital_id: {
            "hospitalId": s.hospital_id, "emergencyDepartmentOpen": s.emergency_department_open,
            "traumaTeamStandby": s.trauma_team_standby, "otReady": s.ot_ready,
            "divertStatus": s.divert_status, "activeAdmissionsCount": s.active_admissions_count,
        }
        for s in status_result.scalars()
    }

    adm_result = await db.execute(select(HospitalAdmission).order_by(HospitalAdmission.created_at.desc()))
    admissions = [
        {"id": a.id, "alertId": a.alert_id, "patientName": a.patient_name, "category": a.category,
         "urgencyLevel": a.urgency_level, "arrivedAt": a.arrived_at, "bedAssigned": a.bed_assigned,
         "doctorInCharge": a.doctor_in_charge, "status": a.status}
        for a in adm_result.scalars()
    ]

    prof_result = await db.execute(select(PatientProfile).where(PatientProfile.username == user.username))
    profile = prof_result.scalar_one_or_none()
    profile_dict = {}
    if profile:
        profile_dict = {
            "abhaId": profile.abha_id, "name": profile.name, "age": profile.age,
            "gender": profile.gender, "bloodGroup": profile.blood_group,
            "allergies": profile.allergies, "chronicConditions": profile.chronic_conditions,
            "currentMedications": profile.current_medications,
            "emergencyContacts": profile.emergency_contacts,
            "organDonor": profile.organ_donor, "preferredHospital": profile.preferred_hospital,
        }

    audit_result = await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100))
    audit_logs = [
        {"id": e.id, "timestamp": e.created_at.isoformat().replace("+00:00", "Z"),
         "alertId": e.alert_id, "event": e.event, "actor": e.actor, "details": e.details,
         "dataMinimizationVerified": e.data_minimization_verified,
         "cryptographicHash": e.cryptographic_hash}
        for e in audit_result.scalars()
    ]

    return {
        "activeAlert": active,
        "alertHistory": all_alerts,
        "currentLocation": active["location"] if active else None,
        "selectedPreset": _PRESETS[0],
        "networkTier": "5G_HIGH_SPEED",
        "language": "en",
        "assistiveHighContrast": False,
        "voiceGuidanceEnabled": True,
        "responders": responders,
        "hospitals": hospitals,
        "auditLogs": audit_logs,
        "eegMetrics": {
            "equity": {"accessParity2Gvs5G": {"rate2G": 96.8, "rate5G": 99.4}, "peripheralWardCoverageRate": 94.2, "multiLanguageUsagePct": {"en": 38, "kn": 46, "hi": 16}, "vulnerableUserSuccessRate": 98.1, "affordabilityAvgCostRs": 0.0},
            "efficacy": {"avgSosToConfirmSeconds": 8.4, "traditionalCadComparisonSeconds": 195.0, "gpsAcquisitionMeanSeconds": 2.1, "falseDispatchRejectionRatePct": 99.2, "smsFallbackDeliverySuccessPct": 98.7, "totalIncidentsHandled": len(all_alerts)},
            "governance": {"dpdpConsentCompliancePct": 100.0, "auditTrailCompletenessPct": 100.0, "algorithmicBiasAuditScorePct": 97.5, "institutionalAccountabilityMapped": True},
        },
        "isSimulating": False,
        "hospitalStatuses": statuses,
        "hospitalAdmissions": admissions,
        "patientProfile": profile_dict,
        "userRole": user.role,
        "adminViewTab": "admin" if user.role == "admin" else user.role,
        "selectedHospitalId": user.hospitalId or "HOSP-01",
        "presets": _PRESETS,
    }


@router.post("/reset")
async def reset_system(user: AnyUser, db: DbSession) -> dict[str, Any]:
    """Resets active alerts, sets all responders to available, and cleans up emergency state."""
    from app.db.models import Alert, HospitalStatus, Responder

    # Resolve all open alerts
    alerts_result = await db.execute(select(Alert).where(Alert.status.notin_(["RESOLVED", "CANCELLED"])))
    for alert in alerts_result.scalars():
        alert.status = "RESOLVED"
        alert.status_timestamps = {**alert.status_timestamps, "resolvedAt": _now_iso()}

    # Free all responders
    resp_result = await db.execute(select(Responder))
    for r in resp_result.scalars():
        r.is_available = True
        r.assigned_incident_id = None

    await db.flush()
    await ws_manager.broadcast("system_reset", {"message": "All emergency states have been reset"})
    logger.info("system_reset", actor=user.username)
    return {"ok": True, "message": "System successfully reset"}

