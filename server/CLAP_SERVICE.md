# RESQLINK Clap Emergency Service

`app/services/clap_detector.py` provides a noise-resistant clap detector and Manus service facade. It accepts normalized mono PCM frames, applies amplitude gates, an FFT spectral check, a spectral-centroid check, a zero-crossing check, and a refractory period, then maintains a five-second rolling counter.

## Trigger rule

An `emergency_event` is emitted only after **three accepted claps within five seconds**. The counter resets when the five-second window expires or when a loud transient fails the clap spectral filter. Quiet background frames update the adaptive noise floor without incrementing the counter, which prevents ordinary ambient noise from interfering with a valid sequence.

## HTTP ingestion

The service is exposed through an authenticated endpoint:

```http
POST /api/audio/claps/frame
Authorization: Bearer <JWT>
Content-Type: application/json
```

Example body:

```json
{
  "samples": [0.0, 0.12, -0.31, 0.76, -0.42],
  "timestamp": 1234.50
}
```

In real use, send a frame of normalized PCM samples at 16 kHz. The response reports whether the frame was accepted as a clap, the current count, filter metrics, and the emitted event when the third clap is accepted.

## Real-time event output

When the trigger fires, the existing WebSocket broadcast bus sends:

```json
{
  "event": "emergency_event",
  "data": {
    "type": "emergency_event",
    "name": "emergency_event",
    "reason": "three_claps_within_five_seconds",
    "clapCount": 3,
    "windowSeconds": 5.0,
    "triggeredBy": "patient"
  }
}
```

Connect authenticated clients to `ws://localhost:8000/api/ws`. The current WebSocket endpoint accepts the connection and broadcasts the event to all connected clients.

## Detector defaults

| Check | Default |
| --- | ---: |
| Sample rate | 16,000 Hz |
| Minimum RMS amplitude | 0.08 |
| Minimum peak amplitude | 0.30 |
| Dominant-frequency range | 1,200–8,000 Hz |
| Minimum high-frequency energy ratio | 0.20 |
| Minimum spectral centroid | 1,500 Hz |
| Refractory period | 250 ms |
| Trigger window | 5 seconds |

This is an emergency-assistance prototype. It should be paired with a visible confirmation mechanism, authentication, rate limiting, and an operational fallback before being used in a real emergency dispatch workflow.
