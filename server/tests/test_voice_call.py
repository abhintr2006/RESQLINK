from __future__ import annotations

import pytest

from app.core.config import get_settings
from app.services.voice_call import (
    SimulatedVoiceAdapter,
    get_voice_adapter,
    place_fixed_sos_call,
)


@pytest.mark.asyncio
async def test_simulated_voice_adapter():
    adapter = get_voice_adapter()
    assert isinstance(adapter, SimulatedVoiceAdapter)

    result = await adapter.place_call("Test emergency call")
    assert result.status == "SIMULATED"
    assert result.provider == "simulated"
    assert result.call_sid.startswith("SIM-CA-")
    assert result.recipient_number == get_settings().TWILIO_TO_NUMBER


@pytest.mark.asyncio
async def test_place_fixed_sos_call():
    result = await place_fixed_sos_call(
        alert_id="ALT-12345",
        location={"lat": 12.9716, "lng": 77.5946},
        category="CARDIAC",
    )
    assert result.status == "SIMULATED"
    assert result.provider == "simulated"
    assert result.call_sid.startswith("SIM-CA-")
