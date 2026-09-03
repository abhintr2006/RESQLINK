from __future__ import annotations

import cmath
import math
import time
from collections import deque
from dataclasses import dataclass
from typing import Any, Deque, Sequence


@dataclass(frozen=True)
class ClapDetection:
    """Result of classifying one PCM audio frame."""

    is_clap: bool
    clap_count: int
    counter_reset: bool
    emergency_event: dict[str, Any] | None
    amplitude: float
    amplitude_db: float
    dominant_frequency_hz: float
    high_frequency_ratio: float
    spectral_centroid_hz: float
    reason: str


class ClapDetector:
    """Detect short, loud, broadband clap transients from mono PCM frames.

    The detector expects normalized float samples in [-1, 1]. It combines:
    - an adaptive RMS noise floor and absolute amplitude gates;
    - a fast FFT spectral check for clap-like broadband energy;
    - a zero-crossing check to reject low-frequency speech/hum;
    - a 250 ms refractory period to avoid counting one clap repeatedly; and
    - a deque of accepted clap timestamps for the exact three-in-five-seconds rule.

    Normal quiet/background frames update the noise floor. A loud transient that
    fails the spectral validation resets the current clap sequence, which reduces
    false positives from bangs, speech bursts, and narrow-band machinery noise.
    """

    def __init__(
        self,
        sample_rate: int = 16_000,
        window_seconds: float = 5.0,
        min_clap_hz: float = 1_200.0,
        max_clap_hz: float = 8_000.0,
        min_rms: float = 0.08,
        min_peak: float = 0.30,
        min_high_frequency_ratio: float = 0.20,
        min_spectral_centroid_hz: float = 1_500.0,
        refractory_seconds: float = 0.25,
    ) -> None:
        self.sample_rate = sample_rate
        self.window_seconds = window_seconds
        self.min_clap_hz = min_clap_hz
        self.max_clap_hz = min(max_clap_hz, sample_rate / 2)
        self.min_rms = min_rms
        self.min_peak = min_peak
        self.min_high_frequency_ratio = min_high_frequency_ratio
        self.min_spectral_centroid_hz = min_spectral_centroid_hz
        self.refractory_seconds = refractory_seconds
        self.noise_rms = 0.012
        self._clap_timestamps: Deque[float] = deque(maxlen=3)
        self._last_clap_at: float | None = None

    @property
    def clap_count(self) -> int:
        return len(self._clap_timestamps)

    def reset(self) -> None:
        self._clap_timestamps.clear()
        self._last_clap_at = None

    def _fft(self, samples: Sequence[float]) -> list[complex]:
        """Return a radix-2 FFT, zero-padding to the next power of two."""
        size = 1
        while size < len(samples):
            size <<= 1
        values = [complex(float(sample), 0.0) for sample in samples]
        values.extend([0j] * (size - len(values)))

        j = 0
        for i in range(1, size):
            bit = size >> 1
            while j & bit:
                j ^= bit
                bit >>= 1
            j ^= bit
            if i < j:
                values[i], values[j] = values[j], values[i]

        length = 2
        while length <= size:
            angle = -2.0 * math.pi / length
            root = complex(math.cos(angle), math.sin(angle))
            for start in range(0, size, length):
                factor = 1 + 0j
                half = length // 2
                for offset in range(half):
                    even = values[start + offset]
                    odd = factor * values[start + offset + half]
                    values[start + offset] = even + odd
                    values[start + offset + half] = even - odd
                    factor *= root
            length <<= 1
        return values

    def _spectral_features(self, samples: Sequence[float]) -> tuple[float, float, float]:
        spectrum = self._fft(samples)
        half = len(spectrum) // 2
        magnitudes = [abs(value) for value in spectrum[:half]]
        if not magnitudes or max(magnitudes) == 0:
            return 0.0, 0.0, 0.0

        def bin_for(frequency: float) -> int:
            return max(0, min(half - 1, round(frequency * len(spectrum) / self.sample_rate)))

        peak_bin = max(range(1, half), key=magnitudes.__getitem__)
        dominant_hz = peak_bin * self.sample_rate / len(spectrum)
        high_start = bin_for(1_800.0)
        high_end = bin_for(self.max_clap_hz)
        high_energy = sum(value * value for value in magnitudes[high_start : high_end + 1])
        total_energy = sum(value * value for value in magnitudes[1:]) or 1.0
        high_ratio = high_energy / total_energy
        weighted_energy = sum(index * self.sample_rate / len(spectrum) * value for index, value in enumerate(magnitudes[1:], 1))
        centroid_hz = weighted_energy / (sum(magnitudes[1:]) or 1.0)
        return dominant_hz, high_ratio, centroid_hz

    def process_frame(self, samples: Sequence[float], timestamp: float | None = None) -> ClapDetection:
        """Classify a frame and return an event payload when clap three is accepted."""
        current_time = time.monotonic() if timestamp is None else float(timestamp)
        clean_samples = [max(-1.0, min(1.0, float(sample))) for sample in samples]
        if not clean_samples:
            self.reset()
            return ClapDetection(False, 0, True, None, 0.0, -120.0, 0.0, 0.0, 0.0, "empty_frame")

        rms = math.sqrt(sum(sample * sample for sample in clean_samples) / len(clean_samples))
        peak = max(abs(sample) for sample in clean_samples)
        amplitude_db = 20.0 * math.log10(max(rms, 1e-9))
        dominant_hz, high_ratio, centroid_hz = self._spectral_features(clean_samples)
        loud_transient = rms >= max(self.min_rms, self.noise_rms * 8.0) and peak >= self.min_peak
        spectral_match = (
            self.min_clap_hz <= dominant_hz <= self.max_clap_hz
            and high_ratio >= self.min_high_frequency_ratio
            and centroid_hz >= self.min_spectral_centroid_hz
        )
        zero_crossings = sum(1 for left, right in zip(clean_samples, clean_samples[1:]) if (left < 0 <= right) or (right < 0 <= left))
        zero_crossing_rate = zero_crossings / max(1, len(clean_samples) - 1)
        clap_match = loud_transient and spectral_match and zero_crossing_rate >= 0.04

        if not loud_transient:
            self.noise_rms = 0.98 * self.noise_rms + 0.02 * max(rms, 1e-5)
            expired = bool(self._clap_timestamps and current_time - self._clap_timestamps[0] > self.window_seconds)
            if expired:
                self.reset()
            return ClapDetection(False, self.clap_count, expired, None, peak, amplitude_db, dominant_hz, high_ratio, centroid_hz, "background_noise")

        if not clap_match:
            self.reset()
            return ClapDetection(False, 0, True, None, peak, amplitude_db, dominant_hz, high_ratio, centroid_hz, "loud_transient_failed_clap_filter")

        if self._last_clap_at is not None and current_time - self._last_clap_at < self.refractory_seconds:
            return ClapDetection(False, self.clap_count, False, None, peak, amplitude_db, dominant_hz, high_ratio, centroid_hz, "refractory_window")

        if self._clap_timestamps and current_time - self._clap_timestamps[0] > self.window_seconds:
            self.reset()
        self._clap_timestamps.append(current_time)
        self._last_clap_at = current_time
        count = self.clap_count
        event = None
        if count == 3:
            event = {
                "type": "emergency_event",
                "name": "emergency_event",
                "reason": "three_claps_within_five_seconds",
                "clapCount": 3,
                "windowSeconds": self.window_seconds,
                "detectedAt": time.time(),
                "signal": {
                    "amplitude": round(peak, 4),
                    "amplitudeDb": round(amplitude_db, 2),
                    "dominantFrequencyHz": round(dominant_hz, 2),
                    "highFrequencyRatio": round(high_ratio, 4),
                    "spectralCentroidHz": round(centroid_hz, 2),
                },
            }
            self.reset()
        return ClapDetection(True, count, False, event, peak, amplitude_db, dominant_hz, high_ratio, centroid_hz, "clap_accepted")


class ClapDetectionService:
    """Manus service facade that emits `emergency_event` through a callback."""

    def __init__(self, detector: ClapDetector | None = None) -> None:
        self.detector = detector or ClapDetector()

    async def ingest_frame(
        self,
        samples: Sequence[float],
        timestamp: float | None = None,
        emit: Any | None = None,
    ) -> ClapDetection:
        detection = self.detector.process_frame(samples, timestamp)
        if detection.emergency_event is not None and emit is not None:
            result = emit("emergency_event", detection.emergency_event)
            if hasattr(result, "__await__"):
                await result
        return detection


clap_service = ClapDetectionService()
