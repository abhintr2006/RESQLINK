from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EmergencyOccurrence(Base):
    """Auditable emergency event created after patient identity validation."""

    __tablename__ = "emergency_occurrences"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    event_name: Mapped[str] = mapped_column(String(64), nullable=False, default="emergency_event")
    patient_username: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    patient_profile_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    source: Mapped[str] = mapped_column(String(64), nullable=False, default="clap_detection_service")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="RECEIVED")
    workflow_stage: Mapped[str] = mapped_column(String(64), nullable=False, default="AI_VOICE_CALL_PENDING")
    workflow_stages: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    launch_signal_id: Mapped[str] = mapped_column(String(64), nullable=False)
    handoff_token_hash: Mapped[str] = mapped_column(String(128), nullable=False)
    handoff_expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    signal_metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
