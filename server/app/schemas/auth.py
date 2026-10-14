from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Role = Literal["admin", "hospital", "patient"]


class CurrentUser(BaseModel):
    username: str
    role: Role
    displayName: str
    hospitalId: str | None = None


class LoginRequest(BaseModel):
    username: str
    password: str


class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=6, max_length=128)
    displayName: str = Field(..., min_length=2, max_length=128)
    role: Role = "patient"
    hospitalId: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: CurrentUser
