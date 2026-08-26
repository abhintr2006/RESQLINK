from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

try:
    from sqlalchemy import JSON
except ImportError:
    from sqlalchemy import Text as JSON  # type: ignore[assignment]


class Responder(Base):
    __tablename__ = "responders"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False)
    vehicle_number: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    driver_name: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    contact_number: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    base_hospital: Mapped[str] = mapped_column(String(256), nullable=False, default="")
    current_lat: Mapped[float] = mapped_column(Float, nullable=False)
    current_lng: Mapped[float] = mapped_column(Float, nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    speed_kmh: Mapped[int] = mapped_column(Integer, nullable=False, default=40)
    eta_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=5)
    assigned_incident_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
