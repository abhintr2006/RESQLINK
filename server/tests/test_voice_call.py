from __future__ import annotations

import pytest

from app.core.security import create_workflow_handoff_token
from app.db.models import Hospital, PatientProfile
from app.core.config import get_settings
from app.services.sms import get_sms_adapter
from app.services.voice_call import SimulatedTTSAdapter, SimulatedTelephonyAdapter, compose_emergency_message, voice_call_service

pytestmark = pytest.mark.asyncio


async def test_dynamic_message_contains_condition_and_location():
    profile = PatientProfile(
        username="patient",
        name="Ananya Sharma",
        age=34,
        gender="Female",
        blood_group="O+ Positive",
        allergies=["Penicillin"],
        chronic_conditions=["Mild Asthma"],
        current_medications=["Salbutamol Inhaler"],
        emergency_contacts=[],
        organ_donor=True,
        preferred_hospital="HOSP-01",
    )
    hospital = Hospital(id="HOSP-01", name="Test Emergency Hospital", area="Bengaluru", latitude=12.9, longitude=77.6, trauma_level=1, icu_beds_available=5, oxygen_available=True, contact_number="+918000000000")
    message = compose_emergency_message(profile, {"latitude": 12.9716, "longitude": 77.5946, "accuracy": 8}, "EMG-TEST", hospital)
    assert "Mild Asthma" in message
    assert "Penicillin" in message
    assert "12.971600" in message
    assert "Test Emergency Hospital" in message


async def test_simulators_are_network_free_and_report_success():
    tts = await SimulatedTTSAdapter().synthesize("Emergency test")
    call = await SimulatedTelephonyAdapter().place_call("+918000000000", "Emergency test", tts.audio_url, None)
    assert tts.provider == "simulated"
    assert call.provider == "simulated"
    assert call.delivery_status == "SIMULATED"


async def test_sos_recipient_and_payloads_are_configured():
    settings = get_settings()
    assert settings.SOS_RECIPIENT_NUMBER == "+917013753816"
    assert settings.SOS_VOICE_MESSAGE == "The patient is having emergency. Please provide emergency assistance."

    sms = get_sms_adapter().send("BLR-TEST", {"latitude": 12.9716, "longitude": 77.5946, "accuracy": 8}, "CARDIAC", "Ananya Sharma")
    assert sms.recipient_number == "+917013753816"
    assert "LOC:12.97160,77.59460" in sms.raw_payload


async def test_workflow_handoff_is_bound_to_occurrence():
    token, _ = create_workflow_handoff_token("EMG-TEST", "patient", ["AI_VOICE_CALL"])
    claims = await voice_call_service.validate_handoff("EMG-TEST", token)
    assert claims["occurrenceId"] == "EMG-TEST"
    with pytest.raises(ValueError):
        await voice_call_service.validate_handoff("EMG-OTHER", token)
