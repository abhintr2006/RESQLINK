# Emergency Event Workflow

The clap detector now feeds an authenticated emergency workflow. After the third accepted clap within five seconds, the server validates the patient identity against `PatientProfile.username`, stores a sanitized patient snapshot, writes compliance audit entries, and prepares a short-lived signed handoff for the next stages.

## Flow

```text
clap detector
  -> emergency_event
  -> stored PatientProfile identity validation
  -> EmergencyOccurrence + hash-chained AuditLog rows
  -> authenticated WebSocket: emergency_event
  -> authenticated WebSocket: resqlink_launch
  -> AI_VOICE_CALL
  -> HOSPITAL_LOCATOR
```

The frontend opens the authenticated WebSocket at `/api/ws?token=<JWT>`. On `resqlink_launch`, the React context raises a `resqlink:launch` browser event, focuses the window, plays the emergency alert tone, and displays an immediate launch banner.

## Persisted records

`EmergencyOccurrence` stores the occurrence ID, patient username, minimized profile snapshot, source, lifecycle status, workflow stage statuses, a hash of the handoff capability, its expiry, and signal metadata. The raw handoff token is never stored in the database. The following audit events are written with the existing SHA-256 chained audit format:

| Event | Purpose |
| --- | --- |
| `EMERGENCY_EVENT_RECEIVED` | Records the authenticated source event and clap count |
| `PATIENT_IDENTITY_VALIDATED` | Records that the stored profile matched the requested identity |
| `WORKFLOW_HANDOFF_ISSUED` | Records the launch signal, stages, and expiry |
| `WORKFLOW_STAGE_COMPLETED` | Records completion of AI voice or hospital locator work |

## Workflow APIs

The clap frame endpoint is authenticated and triggers the consumer when the third clap is accepted:

```http
POST /api/audio/claps/frame
Authorization: Bearer <JWT>
```

An administrator must include `patientUsername` in the request if acting for a stored patient. A patient can only trigger their own stored profile. Hospital-only users cannot trigger the workflow.

The next stage redeems the signed short-lived capability through:

```http
POST /api/emergency-occurrences/{occurrenceId}/advance
Authorization: Bearer <JWT>
Content-Type: application/json

{
  "handoffToken": "<signed-token-from-resqlink_launch>",
  "stage": "AI_VOICE_CALL"
}
```

Valid stages are `AI_VOICE_CALL` and `HOSPITAL_LOCATOR`. The server verifies the JWT signature, issuer, expiry, occurrence binding, patient binding, and stored token hash before advancing the stage.

The current implementation queues and tracks these two stages; it does not place a real phone call or query a live hospital network until those providers are configured. This prevents accidental real-world dispatch during development.

## Stage 3 AI voice call

The Stage 2 consumer automatically queues `POST /api/emergency-occurrences/{occurrenceId}/voice-call` internally after it creates a validated occurrence. The service re-reads the patient profile and the occurrence GPS coordinates, selects the preferred hospital when configured or otherwise chooses the nearest configured hospital using the Haversine distance, and composes a dynamic message containing the patient condition, allergies, medications, occurrence ID, coordinates, accuracy, and destination hospital.

TTS is selected through `TTS_PROVIDER`, `TTS_API_KEY`, and `TTS_API_URL`. When these values are not configured, the local simulator records a TTS operation without making a network request. The telephony adapter similarly uses a local simulator unless Twilio credentials are configured. Real Twilio calls require `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VOICE_FROM_NUMBER` or `TWILIO_FROM_NUMBER`.

Each attempt is stored in `VoiceCallAttempt`. Provider failures retry up to `VOICE_CALL_MAX_ATTEMPTS` with `VOICE_CALL_RETRY_DELAY_SECONDS` between attempts. A queued call waits for a provider callback rather than being duplicated. Delivery callbacks must be signed with HMAC-SHA256 using `TELEPHONY_CALLBACK_SECRET` and are accepted at:

```http
POST /api/emergency-occurrences/{occurrenceId}/voice-call/callback
X-Resqlink-Signature: <hex-hmac>
Content-Type: application/json

{"callId":"<provider-call-id>","status":"completed","metadata":{}}
```

The callback confirms delivery, updates the call attempt and occurrence state, and appends a compliance audit entry. Provider credentials and callback secrets must be stored in environment configuration or a secret manager and must never be committed to source control. Do not enable real telephony until the destination number, consent/authorization policy, callback URL, and emergency operations process have been reviewed.
