from __future__ import annotations

from pydantic import BaseModel, Field


class BedUpdate(BaseModel):
    delta: int = Field(..., ge=-100, le=100)
