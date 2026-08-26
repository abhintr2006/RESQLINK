# RESQLINK Python Server

This directory contains the Python server for the RESQLINK Bengaluru emergency-response frontend. It is implemented with **FastAPI** and stores the demo state in an atomic JSON data file so the existing evaluation workflow works without requiring a database server.

## Run locally

From the repository root:

```bash
cd server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is available at `http://localhost:8000`. Interactive OpenAPI documentation is available at [`http://localhost:8000/docs`](http://localhost:8000/docs). Start the Vite frontend in another terminal with `npm run dev`; the frontend automatically uses `http://localhost:8000/api` unless `VITE_API_BASE_URL` is provided.

## Configuration

The server accepts `PORT` for the listening port and `RESQLINK_DATA_FILE` for the state file location. For example:

```bash
RESQLINK_DATA_FILE=/var/lib/resqlink/state.json PORT=8000 uvicorn app.main:app --host 0.0.0.0
```

The current implementation intentionally simulates the location-lock, AI triage, dispatch scoring, and 2G SMS delivery paths that were previously implemented in the browser. The SMS adapter returns the same compact `RESQ#...` payload shape used by the frontend. The code includes a clear seam for replacing that simulation with Twilio credentials and a production persistence layer later.

## Main endpoints

| Area | Endpoints |
| --- | --- |
| Health and bootstrap | `GET /api/health`, `GET /api/bootstrap` |
| Citizen SOS | `POST /api/sos`, `POST /api/alerts/{id}/cancel`, `GET /api/alerts` |
| Dispatcher | `PATCH /api/alerts/{id}/status`, `POST /api/simulate/incident` |
| Audit and EEG | `GET /api/audit-logs`, `GET /api/eeg-metrics` |
| Fleet and hospitals | `GET /api/responders`, `GET /api/hospitals`, `PATCH /api/hospitals/{id}/beds`, hospital toggle endpoints |
| Hospital workflow | `GET /api/hospital-statuses`, `GET /api/hospital-admissions`, acknowledge and trauma-bay endpoints |
| Patient | `GET /api/patient-profile`, `PATCH /api/patient-profile` |
| Demo reset | `POST /api/reset` |

All API payloads use the camelCase field names already defined in the TypeScript frontend types, which avoids a frontend-wide rename during integration.

## Testing

After installing the requirements, run:

```bash
python -m pytest -q
```

The tests exercise the core SOS flow, responder release on cancellation, audit entries, hospital controls, and patient profile persistence.

## Production notes

The demo data is Bengaluru-specific and intentionally seeded from the frontend's original simulation. Before production deployment, replace the demo authentication accounts with a database-backed identity provider and add, move state into PostgreSQL or another transactional database, encrypt sensitive medical data, validate consent and retention policies, and replace the simulated SMS adapter with a configured provider. The current API is suitable for local development and evaluation, not for unattended emergency operations.
