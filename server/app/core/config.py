from __future__ import annotations

from functools import lru_cache
import re
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ── Application ──────────────────────────────────────────────────────────
    APP_TITLE: str = "RESQLINK Emergency Dispatch API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False

    # ── Database ──────────────────────────────────────────────────────────────
    # Default: SQLite (zero-infrastructure local dev).
    # Production: postgresql+asyncpg://user:pass@host/db
    DATABASE_URL: str = "sqlite+aiosqlite:///./resqlink.db"

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = "resqlink-development-secret-CHANGE-ME-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    JWT_ISSUER: str = "resqlink-api"

    # ── CORS (comma-separated string for easy env var override) ───────────────
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ── Rate limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_SOS: str = "5/minute"
    RATE_LIMIT_LOGIN: str = "10/minute"

    # ── Twilio SMS & Voice (optional) ─────────────────────────────────────────
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    # Separate emergency-call recipient; hospital records remain independent.
    TWILIO_TO_NUMBER: str = "+917013753816"
    TWILIO_VOICE_FROM_NUMBER: str = ""
    SOS_VOICE_MESSAGE: str = "The patient is having emergency. Please provide emergency assistance."

    # ── Logging ───────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    @property
    def twilio_configured(self) -> bool:
        return bool(self.TWILIO_ACCOUNT_SID and self.TWILIO_AUTH_TOKEN and self.TWILIO_FROM_NUMBER)

    @property
    def emergency_contact_number(self) -> str:
        """Return a canonical E.164 recipient or an empty value when invalid."""
        normalized = re.sub(r"[\s().-]", "", self.TWILIO_TO_NUMBER)
        return normalized if re.fullmatch(r"\+[1-9]\d{7,14}", normalized) else ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
