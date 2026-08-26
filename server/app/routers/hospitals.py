from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.deps import AdminOrHospital, AnyUser, DbSession
from app.db.models import Hospital, HospitalAdmission, HospitalStatus
from app.routers.ws import manager as ws_manager
from app.schemas.hospital import BedUpdate

router = APIRouter(prefix="/api", tags=["hospitals"])


def _h_dict(h: Hospital) -> dict[str, Any]:
    return {
        "id": h.id, "name": h.name, "area": h.area, "latitude": h.latitude,
        "longitude": h.longitude, "traumaLevel": h.trauma_level,
        "icuBedsAvailable": h.icu_beds_available, "oxygenAvailable": h.oxygen_available,
        "contactNumber": h.contact_number,
    }


def _s_dict(s: HospitalStatus) -> dict[str, Any]:
    return {
        "hospitalId": s.hospital_id, "emergencyDepartmentOpen": s.emergency_department_open,
        "traumaTeamStandby": s.trauma_team_standby, "otReady": s.ot_ready,
        "divertStatus": s.divert_status, "activeAdmissionsCount": s.active_admissions_count,
    }


@router.get("/hospitals")
async def list_hospitals(user: AnyUser, db: DbSession) -> list[dict]:
    result = await db.execute(select(Hospital))
    return [_h_dict(h) for h in result.scalars()]


@router.get("/hospital-statuses")
async def hospital_statuses(user: AdminOrHospital, db: DbSession) -> dict[str, Any]:
    result = await db.execute(select(HospitalStatus))
    return {s.hospital_id: _s_dict(s) for s in result.scalars()}


@router.get("/hospital-admissions")
async def hospital_admissions(user: AdminOrHospital, db: DbSession) -> list[dict]:
    result = await db.execute(select(HospitalAdmission).order_by(HospitalAdmission.created_at.desc()))
    return [
        {"id": a.id, "alertId": a.alert_id, "patientName": a.patient_name, "category": a.category,
         "urgencyLevel": a.urgency_level, "arrivedAt": a.arrived_at, "bedAssigned": a.bed_assigned,
         "doctorInCharge": a.doctor_in_charge, "status": a.status}
        for a in result.scalars()
    ]


@router.patch("/hospitals/{hospital_id}/beds")
async def update_beds(hospital_id: str, body: BedUpdate, user: AdminOrHospital, db: DbSession) -> dict:
    h = await db.get(Hospital, hospital_id)
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    h.icu_beds_available = max(0, h.icu_beds_available + body.delta)
    await db.flush()
    d = _h_dict(h)
    await ws_manager.broadcast("hospital_updated", d)
    return d


@router.post("/hospitals/{hospital_id}/oxygen/toggle")
async def toggle_oxygen(hospital_id: str, user: AdminOrHospital, db: DbSession) -> dict:
    h = await db.get(Hospital, hospital_id)
    if not h:
        raise HTTPException(status_code=404, detail="Hospital not found")
    h.oxygen_available = not h.oxygen_available
    await db.flush()
    return _h_dict(h)


@router.post("/hospitals/{hospital_id}/trauma-team/toggle")
async def toggle_trauma_team(hospital_id: str, user: AdminOrHospital, db: DbSession) -> dict:
    s = await db.get(HospitalStatus, hospital_id)
    if not s:
        raise HTTPException(status_code=404, detail="Hospital status not found")
    s.trauma_team_standby = not s.trauma_team_standby
    await db.flush()
    return _s_dict(s)


@router.post("/hospitals/{hospital_id}/divert/toggle")
async def toggle_divert(hospital_id: str, user: AdminOrHospital, db: DbSession) -> dict:
    s = await db.get(HospitalStatus, hospital_id)
    if not s:
        raise HTTPException(status_code=404, detail="Hospital status not found")
    s.divert_status = not s.divert_status
    await db.flush()
    return _s_dict(s)


@router.post("/hospitals/inbound/{alert_id}/acknowledge")
async def acknowledge_inbound(alert_id: str, user: AdminOrHospital) -> dict:
    return {"ok": True, "alertId": alert_id, "action": "HOSPITAL_ACKNOWLEDGED"}


@router.post("/hospitals/inbound/{alert_id}/prepare-trauma-bay")
async def prepare_trauma_bay(alert_id: str, user: AdminOrHospital) -> dict:
    return {"ok": True, "alertId": alert_id, "action": "TRAUMA_BAY_PREPPED"}
