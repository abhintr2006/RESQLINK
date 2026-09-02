from __future__ import annotations

import math

import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


SAMPLE_RATE = 16_000


def clap_frame(size: int = 1024) -> list[float]:
    samples = []
    for index in range(size):
        t = index / SAMPLE_RATE
        envelope = math.exp(-t * 55.0) * min(1.0, index / 12.0)
        broadband = sum(math.sin(2 * math.pi * frequency * t) for frequency in (1800, 2600, 3400, 4700, 6100, 7300))
        samples.append(0.25 * envelope * broadband)
    scale = max(abs(sample) for sample in samples)
    return [sample / scale * 0.85 for sample in samples]


async def test_unauthenticated_clap_frame_is_rejected(client: AsyncClient):
    response = await client.post('/api/audio/claps/frame', json={'samples': clap_frame()})
    assert response.status_code == 401


async def test_three_claps_validate_identity_persist_and_launch(
    client: AsyncClient,
    patient_token: str,
    admin_token: str,
):
    headers = {'Authorization': f'Bearer {patient_token}'}
    await client.post('/api/audio/claps/reset', headers=headers)

    workflow = None
    for timestamp in (0.0, 1.0, 2.0):
        response = await client.post(
            '/api/audio/claps/frame',
            headers=headers,
            json={'samples': clap_frame(), 'timestamp': timestamp},
        )
        assert response.status_code == 200, response.text
        workflow = response.json().get('workflow') or workflow

    assert workflow is not None
    assert workflow['launchImmediately'] is True
    assert workflow['patient'] == {'username': 'patient', 'name': 'Ananya Sharma'}
    assert [stage['name'] for stage in workflow['workflowStages']] == ['AI_VOICE_CALL', 'HOSPITAL_LOCATOR']
    assert workflow['handoffToken']

    audit_response = await client.get(
        '/api/audit-logs',
        headers={'Authorization': f'Bearer {admin_token}'},
        params={'alertId': workflow['occurrenceId']},
    )
    assert audit_response.status_code == 200
    events = [entry['event'] for entry in audit_response.json()]
    assert events == ['WORKFLOW_HANDOFF_ISSUED', 'PATIENT_IDENTITY_VALIDATED', 'EMERGENCY_EVENT_RECEIVED']
    assert all(entry['dataMinimizationVerified'] for entry in audit_response.json())
    assert all(entry['cryptographicHash'].startswith('SHA256:') for entry in audit_response.json())

    advance_voice = await client.post(
        f"/api/emergency-occurrences/{workflow['occurrenceId']}/advance",
        headers=headers,
        json={'handoffToken': workflow['handoffToken'], 'stage': 'AI_VOICE_CALL'},
    )
    assert advance_voice.status_code == 200
    assert advance_voice.json()['nextStage'] == 'HOSPITAL_LOCATOR'

    advance_locator = await client.post(
        f"/api/emergency-occurrences/{workflow['occurrenceId']}/advance",
        headers=headers,
        json={'handoffToken': workflow['handoffToken'], 'stage': 'HOSPITAL_LOCATOR'},
    )
    assert advance_locator.status_code == 200
    assert advance_locator.json()['status'] == 'COMPLETED'


async def test_admin_cannot_impersonate_patient_without_existing_profile(client: AsyncClient, admin_token: str):
    await client.post('/api/audio/claps/reset', headers={'Authorization': f'Bearer {admin_token}'})
    for timestamp in (0.0, 1.0):
        response = await client.post(
            '/api/audio/claps/frame',
            headers={'Authorization': f'Bearer {admin_token}'},
            json={'samples': clap_frame(), 'timestamp': timestamp, 'patientUsername': 'unknown'},
        )
        assert response.status_code == 200

    response = await client.post(
        '/api/audio/claps/frame',
        headers={'Authorization': f'Bearer {admin_token}'},
        json={'samples': clap_frame(), 'timestamp': 2.0, 'patientUsername': 'unknown'},
    )
    assert response.status_code == 404
    assert response.json()['detail'] == 'No stored patient profile exists for this identity'
