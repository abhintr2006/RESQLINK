from __future__ import annotations

from pydantic import BaseModel


class EEGMetrics(BaseModel):
    equity: dict
    efficacy: dict
    governance: dict
