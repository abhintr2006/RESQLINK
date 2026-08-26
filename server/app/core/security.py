from __future__ import annotations

import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import get_settings

_PBKDF2_ITERATIONS = 310_000


# ── Password hashing ──────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    """Hash a password with PBKDF2-HMAC-SHA256 and a per-call random salt."""
    salt = secrets.token_bytes(16)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _PBKDF2_ITERATIONS)
    return (
        f"pbkdf2_sha256${_PBKDF2_ITERATIONS}"
        f"${base64.urlsafe_b64encode(salt).decode()}"
        f"${base64.urlsafe_b64encode(derived).decode()}"
    )


def verify_password(plain: str, encoded: str) -> bool:
    """Constant-time comparison against a stored PBKDF2 hash."""
    try:
        _alg, iters_str, encoded_salt, encoded_digest = encoded.split("$", 3)
        salt = base64.urlsafe_b64decode(encoded_salt)
        expected = base64.urlsafe_b64decode(encoded_digest)
        actual = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt, int(iters_str))
        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError):
        return False


# ── JWT ───────────────────────────────────────────────────────────────────────

def create_access_token(
    username: str,
    role: str,
    display_name: str,
    hospital_id: str | None = None,
) -> tuple[str, int]:
    """Return (encoded_jwt, expires_in_seconds)."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    expire_seconds = settings.JWT_EXPIRE_MINUTES * 60
    expires = now + timedelta(seconds=expire_seconds)
    claims = {
        "sub": username,
        "username": username,
        "role": role,
        "displayName": display_name,
        "hospitalId": hospital_id,
        "iss": settings.JWT_ISSUER,
        "iat": now,
        "exp": expires,
    }
    token = jwt.encode(claims, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expire_seconds


def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT, raising jwt.PyJWTError on failure."""
    settings = get_settings()
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
        issuer=settings.JWT_ISSUER,
    )
