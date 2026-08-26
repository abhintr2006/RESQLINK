from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    data: dict[str, Any]
