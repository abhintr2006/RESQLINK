from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

try:
    from sqlalchemy import JSON
except ImportError:
    from sqlalchemy import Text as JSON  # type: ignore[assignment]


class PatientProfile(Base):
    __tablename__ = "patient_profiles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # Linked to the User.username who owns this profile
    username: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    abha_id: Mapped[str | None] = mapped_column(String(64), nullable=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False, default="")
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(32), nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(16), nullable=True)
    allergies: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    chronic_conditions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    current_medications: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    emergency_contacts: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    organ_donor: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    preferred_hospital: Mapped[str | None] = mapped_column(String(16), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
