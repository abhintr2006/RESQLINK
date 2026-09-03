from __future__ import annotations

from typing import Any

from fastapi import APIRouter, BackgroundTasks

from app.core.deps import AdminOrPatient, AnyUser, DbSession
from app.core.logging import get_logger
from app.routers.ws import manager as ws_manager
from app.schemas.clap import AudioFrame, ClapDetectionResponse
from app.services.clap_detector import clap_service
from app.services.emergency_workflow import emergency_workflow_service
from app.services.voice_call import voice_call_service

logger = get_logger(__name__)
router = APIRouter(prefix="/api/audio/claps", tags=["clap emergency trigger"])


async def _start_voice_call_safe(occurrence_id: str, handoff_token: str, actor_username: str) -> None:
    try:
        await voice_call_service.initiate_with_retries(occurrence_id, handoff_token, actor_username)
    except Exception as exc:
        logger.error("voice_call_worker_failed", occurrence_id=occurrence_id, error=str(exc))


async def _publish_emergency_workflow(event: dict[str, Any], workflow: dict[str, Any]) -> None:
    """Publish only after the route's DB transaction has been flushed."""
    await ws_manager.broadcast("emergency_event", {**event, "occurrenceId": workflow["occurrenceId"]})
    await ws_manager.broadcast("resqlink_launch", {
        "launchSignalId": workflow["launchSignalId"],
        "launchImmediately": True,
        "occurrenceId": workflow["occurrenceId"],
        "patient": workflow["patient"],
        "workflowStages": workflow["workflowStages"],
        "handoffToken": workflow["handoffToken"],
        "handoffExpiresAt": workflow["handoffExpiresAt"],
    })
    logger.warning("resqlink_launch_signal_emitted", occurrence_id=workflow["occurrenceId"], launch_signal_id=workflow["launchSignalId"])


@router.post("/frame", response_model=ClapDetectionResponse)
async def ingest_audio_frame(
    body: AudioFrame,
    background_tasks: BackgroundTasks,
    user: AdminOrPatient,
    db: DbSession,
) -> ClapDetectionResponse:
    # The clap detector is the event source; the workflow service is its consumer.
    detection = await clap_service.ingest_frame(body.samples, body.timestamp)
    workflow: dict[str, Any] | None = None
    if detection.emergency_event is not None:
        workflow = await emergency_workflow_service.consume(
            db=db,
            user=user,
            event=detection.emergency_event,
            patient_username=body.patientUsername,
            location=body.location.model_dump() if body.location else None,
        )
        background_tasks.add_task(_publish_emergency_workflow, detection.emergency_event, workflow)
        background_tasks.add_task(_start_voice_call_safe, workflow["occurrenceId"], workflow["handoffToken"], user.username)

    return ClapDetectionResponse(
        clapDetected=detection.is_clap,
        clapCount=detection.clap_count,
        counterReset=detection.counter_reset,
        emergencyEvent=detection.emergency_event,
        amplitude=round(detection.amplitude, 6),
        amplitudeDb=round(detection.amplitude_db, 2),
        dominantFrequencyHz=round(detection.dominant_frequency_hz, 2),
        highFrequencyRatio=round(detection.high_frequency_ratio, 4),
        spectralCentroidHz=round(detection.spectral_centroid_hz, 2),
        reason=detection.reason,
        workflow=workflow,
    )


@router.post("/reset")
async def reset_clap_counter(user: AnyUser) -> dict[str, bool]:
    clap_service.detector.reset()
    return {"ok": True}
