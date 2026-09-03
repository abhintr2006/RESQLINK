from __future__ import annotations

from functools import lru_cache
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
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ── Rate limiting ─────────────────────────────────────────────────────────
    RATE_LIMIT_SOS: str = "5/minute"
    RATE_LIMIT_LOGIN: str = "10/minute"

    # ── Twilio SMS / Voice (optional) ───────────────────────────────────────────
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""
    TWILIO_VOICE_FROM_NUMBER: str = ""
    TWILIO_VOICE_STATUS_CALLBACK_URL: str = ""
    TELEPHONY_CALLBACK_SECRET: str = ""
    SOS_RECIPIENT_NUMBER: str = "+917013753816"
    SOS_VOICE_MESSAGE: str = "The patient is having emergency. Please provide emergency assistance."

    # ── TTS (optional) ─────────────────────────────────────────────────────────
    TTS_PROVIDER: str = "simulated"
    TTS_API_KEY: str = ""
    TTS_API_URL: str = ""
    TTS_VOICE: str = "alloy"
    PUBLIC_MEDIA_BASE_URL: str = ""

    # ── Stage 3 retry policy ───────────────────────────────────────────────────
    VOICE_CALL_MAX_ATTEMPTS: int = 3
    VOICE_CALL_RETRY_DELAY_SECONDS: int = 10

    # ── Logging ───────────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    @property
    def twilio_configured(self) -> bool:
        return bool(self.TWILIO_ACCOUNT_SID and self.TWILIO_AUTH_TOKEN and self.TWILIO_FROM_NUMBER)

    @property
    def twilio_voice_configured(self) -> bool:
        return bool(self.TWILIO_ACCOUNT_SID and self.TWILIO_AUTH_TOKEN and (self.TWILIO_VOICE_FROM_NUMBER or self.TWILIO_FROM_NUMBER))

    @property
    def tts_configured(self) -> bool:
        return self.TTS_PROVIDER != "simulated" and bool(self.TTS_API_KEY and self.TTS_API_URL)


@lru_cache
def get_settings() -> Settings:
    return Settings()
