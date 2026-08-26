from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

EmergencyCategory = Literal[
    "CARDIAC", "TRAUMA_ACCIDENT", "STROKE", "RESPIRATORY",
    "ELDERLY_FALL", "MATERNAL_CRITICAL", "GENERAL_MEDICAL",
]
AlertStatus = Literal[
    "IDLE", "ACQUIRING_LOCATION", "LOCATION_LOCKED", "ALERTING",
    "CONFIRMED", "DISPATCHED", "EN_ROUTE", "ON_SCENE", "RESOLVED", "CANCELLED",
]
NetworkTier = Literal["5G_HIGH_SPEED", "3G_SPOTTY", "2G_SMS_FALLBACK"]
LanguageCode = Literal["en", "kn", "hi"]


class GeoCoordinate(BaseModel):
    latitude: float
    longitude: float
    accuracy: float = 15.0
    timestamp: int = 0
    provider: Literal["GPS_HARDWARE", "CELL_TRIANGULATION", "WIFI_NETWORK", "MANUAL_PRESET"] = "GPS_HARDWARE"


class PresetLocation(BaseModel):
    name: str
    ward: str
    latitude: float
    longitude: float
    isPeripheral: bool
    pincode: str


class SosRequest(BaseModel):
    category: EmergencyCategory = "CARDIAC"
    networkTier: NetworkTier = "5G_HIGH_SPEED"
    language: LanguageCode = "en"
    selectedPreset: PresetLocation | None = None
    currentLocation: GeoCoordinate | None = None
    citizenName: str = "Citizen"
    citizenPhone: str = ""


class StatusUpdate(BaseModel):
    status: AlertStatus


class AlertOut(BaseModel):
    """Serialised alert returned to the frontend — keeps camelCase field names."""
    id: str
    shortCode: str
    timestamp: str
    category: str
    description: str
    citizenName: str
    citizenPhone: str
    location: dict[str, Any]
    locationLockState: dict[str, Any]
    status: str
    statusTimestamps: dict[str, Any]
    networkUsed: str
    fallbackSMSUsed: bool
    smsPayloadRaw: str | None = None
    assignedResponder: dict[str, Any] | None = None
    assignedHospital: dict[str, Any] | None = None
    estimatedArrivalMinutes: int
    aiTriage: dict[str, Any]
    equityMetadata: dict[str, Any]
