from __future__ import annotations

import math

import pytest

from app.services.clap_detector import ClapDetector, ClapDetectionService


SAMPLE_RATE = 16_000


def make_clap(size: int = 1024) -> list[float]:
    samples: list[float] = []
    for index in range(size):
        time_seconds = index / SAMPLE_RATE
        envelope = math.exp(-time_seconds * 55.0) * min(1.0, index / 12.0)
        broadband = sum(math.sin(2 * math.pi * frequency * time_seconds) for frequency in (1800, 2600, 3400, 4700, 6100, 7300))
        samples.append(0.25 * envelope * broadband)
    scale = max(abs(sample) for sample in samples) or 1.0
    return [sample / scale * 0.85 for sample in samples]


def make_low_frequency_noise(size: int = 1024) -> list[float]:
    return [0.5 * math.sin(2 * math.pi * 180 * index / SAMPLE_RATE) for index in range(size)]


def test_clap_passes_amplitude_and_frequency_filters() -> None:
    detector = ClapDetector(sample_rate=SAMPLE_RATE)
    result = detector.process_frame(make_clap(), timestamp=0.0)
    assert result.is_clap is True
    assert result.clap_count == 1
    assert result.reason == 'clap_accepted'
    assert result.dominant_frequency_hz >= 1200
    assert result.high_frequency_ratio >= 0.20


def test_low_frequency_noise_is_rejected_and_resets_counter() -> None:
    detector = ClapDetector(sample_rate=SAMPLE_RATE)
    assert detector.process_frame(make_clap(), timestamp=0.0).clap_count == 1
    result = detector.process_frame(make_low_frequency_noise(), timestamp=0.5)
    assert result.is_clap is False
    assert result.counter_reset is True
    assert result.clap_count == 0
    assert result.reason == 'loud_transient_failed_clap_filter'


def test_three_claps_in_five_seconds_emits_emergency_event() -> None:
    detector = ClapDetector(sample_rate=SAMPLE_RATE)
    first = detector.process_frame(make_clap(), timestamp=0.0)
    second = detector.process_frame(make_clap(), timestamp=1.0)
    third = detector.process_frame(make_clap(), timestamp=2.0)
    assert first.emergency_event is None
    assert second.emergency_event is None
    assert third.emergency_event is not None
    assert third.emergency_event['name'] == 'emergency_event'
    assert third.emergency_event['clapCount'] == 3
    assert detector.clap_count == 0


def test_window_expiry_resets_before_next_clap() -> None:
    detector = ClapDetector(sample_rate=SAMPLE_RATE)
    assert detector.process_frame(make_clap(), timestamp=0.0).clap_count == 1
    expired = detector.process_frame([0.0] * 1024, timestamp=5.1)
    assert expired.counter_reset is True
    assert expired.clap_count == 0
    assert detector.process_frame(make_clap(), timestamp=5.2).clap_count == 1


def test_refractory_window_does_not_double_count_one_clap() -> None:
    detector = ClapDetector(sample_rate=SAMPLE_RATE)
    assert detector.process_frame(make_clap(), timestamp=0.0).clap_count == 1
    repeat = detector.process_frame(make_clap(), timestamp=0.1)
    assert repeat.is_clap is False
    assert repeat.clap_count == 1
    assert repeat.reason == 'refractory_window'


@pytest.mark.asyncio
async def test_service_emits_named_emergency_event() -> None:
    events: list[tuple[str, dict]] = []

    async def emit(name: str, payload: dict) -> None:
        events.append((name, payload))

    service = ClapDetectionService(ClapDetector(sample_rate=SAMPLE_RATE))
    for timestamp in (0.0, 1.0, 2.0):
        await service.ingest_frame(make_clap(), timestamp=timestamp, emit=emit)

    assert len(events) == 1
    assert events[0][0] == 'emergency_event'
    assert events[0][1]['reason'] == 'three_claps_within_five_seconds'
