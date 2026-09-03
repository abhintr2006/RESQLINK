from __future__ import annotations

from fastapi import APIRouter

from app.core.deps import AnyUser, DbSession
from app.schemas.emergency import WorkflowAdvanceRequest, WorkflowAdvanceResponse
from app.services.emergency_workflow import emergency_workflow_service

router = APIRouter(prefix="/api/emergency-occurrences", tags=["emergency workflow"])


@router.post("/{occurrence_id}/advance", response_model=WorkflowAdvanceResponse)
async def advance_workflow_stage(
    occurrence_id: str,
    body: WorkflowAdvanceRequest,
    user: AnyUser,
    db: DbSession,
) -> WorkflowAdvanceResponse:
    return await emergency_workflow_service.advance_stage(
        db=db,
        user=user,
        occurrence_id=occurrence_id,
        handoff_token=body.handoffToken,
        stage=body.stage,
    )
