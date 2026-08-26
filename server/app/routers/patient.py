from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from sqlalchemy import select

from app.core.deps import AdminOrPatient, AnyUser, DbSession
from app.db.models import PatientProfile
from app.schemas.patient import ProfileUpdate

router = APIRouter(prefix="/api", tags=["patient"])


def _profile_dict(p: PatientProfile) -> dict[str, Any]:
    return {
        "abhaId": p.abha_id, "name": p.name, "age": p.age, "gender": p.gender,
        "bloodGroup": p.blood_group, "allergies": p.allergies,
        "chronicConditions": p.chronic_conditions, "currentMedications": p.current_medications,
        "emergencyContacts": p.emergency_contacts, "organDonor": p.organ_donor,
        "preferredHospital": p.preferred_hospital,
    }


_FIELD_MAP = {
    "abhaId": "abha_id", "bloodGroup": "blood_group",
    "chronicConditions": "chronic_conditions", "currentMedications": "current_medications",
    "emergencyContacts": "emergency_contacts", "organDonor": "organ_donor",
    "preferredHospital": "preferred_hospital",
}


@router.get("/patient-profile")
async def get_profile(user: AdminOrPatient, db: DbSession) -> dict[str, Any]:
    result = await db.execute(select(PatientProfile).where(PatientProfile.username == user.username))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    return _profile_dict(profile)


@router.patch("/patient-profile")
async def update_profile(body: ProfileUpdate, user: AdminOrPatient, db: DbSession) -> dict[str, Any]:
    result = await db.execute(select(PatientProfile).where(PatientProfile.username == user.username))
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    for key, value in body.data.items():
        orm_attr = _FIELD_MAP.get(key, key)
        if hasattr(profile, orm_attr):
            setattr(profile, orm_attr, value)
    await db.flush()
    return _profile_dict(profile)


@router.post("/reset")
async def reset_data(user: AnyUser, db: DbSession) -> dict[str, Any]:
    """Re-seed the database to a clean demo state (admin convenience)."""
    from app.services.seed import seed_database
    await seed_database(db)
    return {"ok": True}
