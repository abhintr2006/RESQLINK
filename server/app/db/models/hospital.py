from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Hospital(Base):
    __tablename__ = "hospitals"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    area: Mapped[str] = mapped_column(String(128), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    trauma_level: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    icu_beds_available: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    oxygen_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    contact_number: Mapped[str] = mapped_column(String(32), nullable=False, default="")


class HospitalStatus(Base):
    __tablename__ = "hospital_statuses"

    hospital_id: Mapped[str] = mapped_column(String(16), primary_key=True)
    emergency_department_open: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    trauma_team_standby: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    ot_ready: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    divert_status: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    active_admissions_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class HospitalAdmission(Base):
    __tablename__ = "hospital_admissions"

    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    alert_id: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    patient_name: Mapped[str] = mapped_column(String(128), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    urgency_level: Mapped[str] = mapped_column(String(32), nullable=False)
    arrived_at: Mapped[str] = mapped_column(String(32), nullable=False, default="")
    bed_assigned: Mapped[str | None] = mapped_column(String(64), nullable=True)
    doctor_in_charge: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="ADMITTED")
    hospital_id: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
