from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

Role = Literal["admin", "hospital", "patient"]


class CurrentUser(BaseModel):
    username: str
    role: Role
    displayName: str
    hospitalId: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: CurrentUser
