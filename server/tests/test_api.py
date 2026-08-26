from fastapi.testclient import TestClient

from app.main import app, store

client = TestClient(app)


def setup_function() -> None:
    store.reset()


def login(username: str = 'admin', password: str = 'admin123') -> dict[str, str]:
    response = client.post('/api/auth/login', json={'username': username, 'password': password})
    assert response.status_code == 200
    return {'Authorization': f"Bearer {response.json()['access_token']}"}


def test_authentication_and_role_claims() -> None:
    assert client.get('/api/bootstrap').status_code == 401
    assert client.post('/api/auth/login', json={'username': 'admin', 'password': 'wrong'}).status_code == 401

    headers = login('hospital', 'hospital123')
    me = client.get('/api/auth/me', headers=headers)
    assert me.status_code == 200
    assert me.json()['role'] == 'hospital'
    assert me.json()['hospitalId'] == 'HOSP-01'

    assert client.get('/api/eeg-metrics', headers=headers).status_code == 403
    assert client.post('/api/simulate/incident', headers=headers).status_code == 403


def test_health_and_bootstrap() -> None:
    assert client.get('/api/health').status_code == 200
    payload = client.get('/api/bootstrap', headers=login()).json()
    assert len(payload['hospitals']) == 8
    assert len(payload['responders']) == 5
    assert payload['patientProfile']['name'] == 'Ananya Sharma'


def test_sos_dispatch_and_audit_chain() -> None:
    headers = login('patient', 'patient123')
    response = client.post('/api/sos', headers=headers, json={
        'category': 'CARDIAC',
        'networkTier': '2G_SMS_FALLBACK',
        'language': 'en',
        'selectedPreset': client.get('/api/presets', headers=headers).json()[0],
    })
    assert response.status_code == 201
    alert = response.json()
    assert alert['status'] == 'DISPATCHED'
    assert alert['assignedResponder']['id']
    assert alert['assignedHospital']['id']
    assert alert['smsPayloadRaw'].startswith('RESQ#')
    assert len(alert['smsPayloadRaw']) < 160

    logs = client.get('/api/audit-logs', headers=login()).json()
    assert len(logs) >= 5
    assert all(log['dataMinimizationVerified'] is True for log in logs)
    assert all(log['cryptographicHash'].startswith('SHA256:') for log in logs)


def test_dispatcher_status_and_cancel_release_responder() -> None:
    headers = login()
    alert = client.post('/api/sos', headers=headers, json={'category': 'ELDERLY_FALL'}).json()
    responder_id = alert['assignedResponder']['id']
    update = client.patch(f"/api/alerts/{alert['id']}/status", headers=headers, json={'status': 'EN_ROUTE'})
    assert update.status_code == 200
    assert update.json()['status'] == 'EN_ROUTE'

    cancel = client.post(f"/api/alerts/{alert['id']}/cancel", headers=headers)
    assert cancel.status_code == 200
    responders = client.get('/api/responders', headers=headers).json()
    assert next(item for item in responders if item['id'] == responder_id)['isAvailable'] is True


def test_hospital_and_profile_mutations() -> None:
    admin_headers = login()
    hospital = client.patch('/api/hospitals/HOSP-01/beds', headers=admin_headers, json={'delta': -2}).json()
    assert hospital['icuBedsAvailable'] == 6
    status = client.post('/api/hospitals/HOSP-01/divert/toggle', headers=admin_headers).json()
    assert status['divertStatus'] is True

    patient_headers = login('patient', 'patient123')
    profile = client.patch('/api/patient-profile', headers=patient_headers, json={'data': {'age': 35}}).json()
    assert profile['age'] == 35
