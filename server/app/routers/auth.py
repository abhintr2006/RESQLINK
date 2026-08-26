from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.core.deps import AnyUser, DbSession
from app.core.logging import get_logger
from app.core.security import create_access_token, verify_password
from app.db.models import User
from app.middleware.rate_limit import limiter
from app.schemas.auth import LoginRequest, TokenResponse

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, body: LoginRequest, db: DbSession) -> TokenResponse:
    user = await db.get(User, body.username.strip().lower())
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password", headers={"WWW-Authenticate": "Bearer"})
    token, expires_in = create_access_token(user.username, user.role, user.display_name, user.hospital_id)
    logger.info("user_login", username=user.username, role=user.role)
    return TokenResponse(
        access_token=token,
        expires_in=expires_in,
        user={
            "username": user.username,
            "role": user.role,
            "displayName": user.display_name,
            "hospitalId": user.hospital_id,
        },
    )


@router.get("/me")
async def auth_me(user: AnyUser):
    return user


@router.post("/logout")
async def logout(user: AnyUser):
    logger.info("user_logout", username=user.username)
    return {"ok": True, "username": user.username}
