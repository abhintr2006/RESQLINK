from __future__ import annotations

from typing import Any

from fastapi import APIRouter
from sqlalchemy import select

from app.core.deps import AdminOrHospital, DbSession
from app.db.models import AuditLog

router = APIRouter(prefix="/api", tags=["audit"])


@router.get("/audit-logs")
async def list_audit_logs(
    user: AdminOrHospital,
    db: DbSession,
    alertId: str | None = None,
    limit: int = 200,
    offset: int = 0,
) -> list[dict[str, Any]]:
    query = select(AuditLog).order_by(AuditLog.created_at.desc())
    if alertId:
        query = query.where(AuditLog.alert_id == alertId)
    query = query.limit(limit).offset(offset)
    result = await db.execute(query)
    return [
        {
            "id": e.id,
            "timestamp": e.created_at.isoformat().replace("+00:00", "Z"),
            "alertId": e.alert_id,
            "event": e.event,
            "actor": e.actor,
            "details": e.details,
            "dataMinimizationVerified": e.data_minimization_verified,
            "cryptographicHash": e.cryptographic_hash,
        }
        for e in result.scalars()
    ]
