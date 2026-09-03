from __future__ import annotations

from pydantic import BaseModel, Field


class GPSCoordinates(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    accuracy: float | None = Field(default=None, ge=0)
    timestamp: float | None = None
    provider: str | None = Field(default=None, max_length=64)


class AudioFrame(BaseModel):
    """Mono normalized PCM frame, normally 160–2048 samples at 16 kHz."""

    samples: list[float] = Field(..., min_length=16, max_length=8192)
    timestamp: float | None = Field(default=None, description="Monotonic seconds; server time is used when omitted.")
    patientUsername: str | None = Field(default=None, min_length=1, max_length=64, description="Required for an administrator-triggered event; patients are bound to their own username.")
    location: GPSCoordinates | None = Field(default=None, description="Latest GPS fix associated with this audio frame.")


class ClapDetectionResponse(BaseModel):
    clapDetected: bool
    clapCount: int
    counterReset: bool
    emergencyEvent: dict | None
    amplitude: float
    amplitudeDb: float
    dominantFrequencyHz: float
    highFrequencyRatio: float
    spectralCentroidHz: float
    reason: str
    workflow: dict | None = None
