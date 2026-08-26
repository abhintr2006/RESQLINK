from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from sqlalchemy import select

from app.core.deps import AnyUser, DbSession
from app.db.models import Responder

router = APIRouter(prefix="/api", tags=["responders"])


@router.get("/responders")
async def list_responders(user: AnyUser, db: DbSession) -> list[dict[str, Any]]:
    result = await db.execute(select(Responder))
    return [
        {
            "id": r.id, "name": r.name, "type": r.type,
            "vehicleNumber": r.vehicle_number, "driverName": r.driver_name,
            "contactNumber": r.contact_number, "baseHospital": r.base_hospital,
            "currentLocation": {"latitude": r.current_lat, "longitude": r.current_lng},
            "isAvailable": r.is_available, "speedKmh": r.speed_kmh,
            "etaMinutes": r.eta_minutes, "assignedIncidentId": r.assigned_incident_id,
        }
        for r in result.scalars()
    ]
