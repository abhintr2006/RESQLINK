from __future__ import annotations

from typing import Annotated, Callable, Literal

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.base import get_db
from app.schemas.auth import CurrentUser

Role = Literal["admin", "hospital", "patient"]

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> CurrentUser:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise exc
    try:
        payload = decode_access_token(credentials.credentials)
        username = payload.get("sub")
        role = payload.get("role")
        display_name = payload.get("displayName")
        if not isinstance(username, str) or role not in ("admin", "hospital", "patient") or not isinstance(display_name, str):
            raise exc
        return CurrentUser(
            username=username,
            role=role,
            displayName=display_name,
            hospitalId=payload.get("hospitalId"),
        )
    except (jwt.PyJWTError, TypeError, ValueError):
        raise exc


def require_roles(*allowed_roles: Role) -> Callable:
    async def dependency(user: Annotated[CurrentUser, Depends(get_current_user)]) -> CurrentUser:
        if user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
        return user
    return dependency


# ── Typed dependency aliases ──────────────────────────────────────────────────
AnyUser = Annotated[CurrentUser, Depends(get_current_user)]
AdminUser = Annotated[CurrentUser, Depends(require_roles("admin"))]
AdminOrHospital = Annotated[CurrentUser, Depends(require_roles("admin", "hospital"))]
AdminOrPatient = Annotated[CurrentUser, Depends(require_roles("admin", "patient"))]

# DB session dependency re-exported for convenience
DbSession = Annotated[AsyncSession, Depends(get_db)]
