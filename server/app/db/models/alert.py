from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

try:
    from sqlalchemy import JSON
except ImportError:
    from sqlalchemy import Text as JSON  # type: ignore[assignment]


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    short_code: Mapped[str] = mapped_column(String(16), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    citizen_name: Mapped[str] = mapped_column(String(128), nullable=False)
    citizen_phone: Mapped[str] = mapped_column(String(32), nullable=False)

    # Location stored as JSON blob for portability
    location: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    location_lock_state: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ACQUIRING_LOCATION")
    status_timestamps: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    network_used: Mapped[str] = mapped_column(String(32), nullable=False, default="5G_HIGH_SPEED")
    fallback_sms_used: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sms_payload_raw: Mapped[str | None] = mapped_column(Text, nullable=True)

    assigned_responder: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    assigned_hospital: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    estimated_arrival_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    ai_triage: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    equity_metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AlertStatusTimestamps(Base):
    """Separate table for fine-grained status-change timestamps (used by EEG latency metrics)."""
    __tablename__ = "alert_status_timestamps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    alert_id: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
