from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class VoiceCallAttempt(Base):
    __tablename__ = "voice_call_attempts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    occurrence_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False)
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    provider_call_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    hospital_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    destination_number: Mapped[str] = mapped_column(String(32), nullable=False)
    message_text: Mapped[str] = mapped_column(Text, nullable=False)
    audio_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="CREATED")
    delivery_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    retryable: Mapped[bool] = mapped_column(nullable=False, default=True)
    error_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    callback_metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
