from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


WorkflowStage = Literal["AI_VOICE_CALL", "HOSPITAL_LOCATOR"]


class WorkflowAdvanceRequest(BaseModel):
    handoffToken: str = Field(..., min_length=20)
    stage: WorkflowStage


class WorkflowAdvanceResponse(BaseModel):
    occurrenceId: str
    stage: WorkflowStage
    status: str
    nextStage: WorkflowStage | None
    acceptedAt: str
