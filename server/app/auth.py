from __future__ import annotations

import base64
import hashlib
import hmac
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Annotated, Callable, Literal

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel

Role = Literal["admin", "hospital", "patient"]

JWT_ALGORITHM = "HS256"
JWT_ISSUER = "resqlink-api"
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "resqlink-development-secret-change-me")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "30"))
PBKDF2_ITERATIONS = 310_000


class User(BaseModel):
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
    user: User


def hash_password(password: str) -> str:
    """Hash a password with a per-password random salt using PBKDF2-HMAC-SHA256."""
    salt = secrets.token_bytes(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(derived).decode()}"


def verify_password(password: str, encoded_hash: str) -> bool:
    try:
        algorithm, iterations, encoded_salt, encoded_digest = encoded_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        salt = base64.urlsafe_b64decode(encoded_salt.encode())
        expected = base64.urlsafe_b64decode(encoded_digest.encode())
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, int(iterations))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


# Development-only accounts. Replace this dictionary with a database-backed user store in production.
_DEMO_PASSWORDS = {
    "admin": "admin123",
    "hospital": "hospital123",
    "patient": "patient123",
}
DEMO_USERS: dict[str, dict[str, object]] = {
    "admin": {"passwordHash": hash_password(_DEMO_PASSWORDS["admin"]), "role": "admin", "displayName": "RESQLINK Administrator", "hospitalId": None},
    "hospital": {"passwordHash": hash_password(_DEMO_PASSWORDS["hospital"]), "role": "hospital", "displayName": "KSSEM Hospital Control Room", "hospitalId": "HOSP-01"},
    "patient": {"passwordHash": hash_password(_DEMO_PASSWORDS["patient"]), "role": "patient", "displayName": "Ananya Sharma", "hospitalId": None},
}


def authenticate_user(username: str, password: str) -> User | None:
    record = DEMO_USERS.get(username.strip().lower())
    if not record or not verify_password(password, str(record["passwordHash"])):
        return None
    return User(username=username.strip().lower(), role=record["role"], displayName=record["displayName"], hospitalId=record["hospitalId"])


def create_access_token(user: User) -> TokenResponse:
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=JWT_EXPIRE_MINUTES)
    claims = {
        "sub": user.username,
        "username": user.username,
        "role": user.role,
        "displayName": user.displayName,
        "hospitalId": user.hospitalId,
        "iss": JWT_ISSUER,
        "iat": now,
        "exp": expires,
    }
    token = jwt.encode(claims, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return TokenResponse(access_token=token, expires_in=JWT_EXPIRE_MINUTES * 60, user=user)


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)]) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise unauthorized
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM], issuer=JWT_ISSUER)
        username = payload.get("sub")
        role = payload.get("role")
        display_name = payload.get("displayName")
        if not isinstance(username, str) or role not in ("admin", "hospital", "patient") or not isinstance(display_name, str):
            raise unauthorized
        return User(username=username, role=role, displayName=display_name, hospitalId=payload.get("hospitalId"))
    except (jwt.PyJWTError, TypeError, ValueError):
        raise unauthorized


def require_roles(*allowed_roles: Role) -> Callable:
    def dependency(user: Annotated[User, Depends(get_current_user)]) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role for this operation")
        return user

    return dependency


CurrentUser = Annotated[User, Depends(get_current_user)]
AdminUser = Annotated[User, Depends(require_roles("admin"))]
AdminOrHospitalUser = Annotated[User, Depends(require_roles("admin", "hospital"))]
AdminOrPatientUser = Annotated[User, Depends(require_roles("admin", "patient"))]
AnyAuthenticatedUser = Annotated[User, Depends(get_current_user)]
