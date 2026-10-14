from __future__ import annotations

import re

from fastapi import APIRouter, HTTPException, Request

from app.core.deps import AnyUser, DbSession
from app.core.logging import get_logger
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models import User
from app.middleware.rate_limit import limiter
from app.schemas.auth import CurrentUser, LoginRequest, SignupRequest, TokenResponse

logger = get_logger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
@limiter.limit("10/minute")
async def signup(request: Request, body: SignupRequest, db: DbSession) -> TokenResponse:
    username = body.username.strip().lower()
    if not re.match(r"^[a-zA-Z0-9_.-]{3,64}$", username):
        raise HTTPException(
            status_code=400,
            detail="Username must be 3-64 characters and contain only letters, numbers, dots, hyphens, or underscores.",
        )
    if len(body.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    display_name = body.displayName.strip()
    if not display_name:
        raise HTTPException(status_code=400, detail="Display name is required.")

    existing = await db.get(User, username)
    if existing:
        raise HTTPException(status_code=409, detail="Username is already registered. Please sign in or choose another.")

    user = User(
        username=username,
        password_hash=hash_password(body.password),
        role=body.role,
        display_name=display_name,
        hospital_id=body.hospitalId if body.role == "hospital" else None,
    )
    db.add(user)
    await db.flush()

    token, expires_in = create_access_token(user.username, user.role, user.display_name, user.hospital_id)
    logger.info("user_signup", username=user.username, role=user.role)
    return TokenResponse(
        access_token=token,
        expires_in=expires_in,
        user=CurrentUser(
            username=user.username,
            role=user.role,
            displayName=user.display_name,
            hospitalId=user.hospital_id,
        ),
    )


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
