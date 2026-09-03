from __future__ import annotations

from pydantic import BaseModel, Field


class VoiceCallRequest(BaseModel):
    handoffToken: str = Field(..., min_length=20)


class TelephonyCallback(BaseModel):
    callId: str = Field(..., min_length=1, max_length=128)
    status: str = Field(..., min_length=1, max_length=32)
    metadata: dict = Field(default_factory=dict)
    signature: str = Field(..., min_length=32, max_length=256)
