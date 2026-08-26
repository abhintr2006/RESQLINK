from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any


def haversine_meters(a_lat: float, a_lng: float, b_lat: float, b_lng: float) -> float:
    """Return great-circle distance in metres between two WGS-84 coordinates."""
    R = 6_371_000
    d_lat = math.radians(b_lat - a_lat)
    d_lng = math.radians(b_lng - a_lng)
    a = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(a_lat)) * math.cos(math.radians(b_lat)) * math.sin(d_lng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


_ALS_CATEGORIES = frozenset({"CARDIAC", "STROKE", "TRAUMA_ACCIDENT", "MATERNAL_CRITICAL"})

# First-aid guidance per category
GUIDANCE: dict[str, dict[str, Any]] = {
    "CARDIAC": {
        "urgencyLevel": "CRITICAL_RED", "triageScore": 98, "suggestedALS": True,
        "firstAidInstructions": [
            "Keep patient calm, resting comfortably in sitting position.",
            "Loosen tight clothing around neck and chest.",
            "If patient becomes unresponsive, begin CPR: 100-120 chest compressions per minute.",
            "Do NOT give solid foods or water.",
        ],
        "speechSummary": {
            "en": "Help is dispatched! Keep patient sitting comfortably. If unconscious, begin chest compressions immediately.",
            "kn": "ತುರ್ತು ವಾಹನ ರವಾನಿಸಲಾಗಿದೆ! ರೋಗಿಯನ್ನು ಆರಾಮವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಲು ಬಿಡಿ.",
            "hi": "एम्बुलेंस रवाना हो चुकी है! मरीज को आराम से बैठाएं।",
        },
    },
    "TRAUMA_ACCIDENT": {
        "urgencyLevel": "CRITICAL_RED", "triageScore": 92, "suggestedALS": True,
        "firstAidInstructions": [
            "Apply firm, direct pressure to any active bleeding wound.",
            "Do NOT move patient if neck or spinal injury is suspected.",
            "Keep patient warm to prevent trauma shock.",
        ],
        "speechSummary": {
            "en": "Ambulance is en route! Apply firm pressure on bleeding areas. Do not move patient neck or spine.",
            "kn": "ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುತ್ತಿದೆ! ರಕ್ತಸ್ರಾವದ ಜಾಗಕ್ಕೆ ಗಟ್ಟಿಯಾಗಿ ಒತ್ತಿ ಹಿಡಿಯಿರಿ.",
            "hi": "एम्बुलेंस आ रही है! खून रोकने के लिए कपड़े से दबाव बनाएं।",
        },
    },
    "STROKE": {
        "urgencyLevel": "CRITICAL_RED", "triageScore": 95, "suggestedALS": True,
        "firstAidInstructions": [
            "Check FAST symptoms: Face drooping, Arm weakness, Speech difficulty, Time.",
            "Keep patient lying on their side with head slightly raised.",
            "Do NOT give aspirin, medication, food, or drink.",
        ],
        "speechSummary": {
            "en": "Stroke response activated! Keep patient on their side with head elevated.",
            "kn": "ಪಾರ್ಶ್ವವಾಯು ತುರ್ತು ಸ್ಪಂದನೆ ಸಕ್ರಿಯ. ರೋಗಿಯನ್ನು ಒಂದು ಬದಿಗೆ ಮಲಗಿಸಿ.",
            "hi": "स्ट्रोक प्रोटोकॉल सक्रिय है! मरीज को करवट के बल लिटाएं।",
        },
    },
    "RESPIRATORY": {
        "urgencyLevel": "HIGH_AMBER", "triageScore": 86, "suggestedALS": True,
        "firstAidInstructions": [
            "Help patient sit upright, leaning slightly forward (tripod position).",
            "Ensure fresh airflow; open windows or loosen tight collars.",
            "Assist with prescribed asthma inhaler if available.",
        ],
        "speechSummary": {
            "en": "Paramedics on the way. Sit upright and lean slightly forward.",
            "kn": "ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುತ್ತಿದೆ. ನೇರವಾಗಿ ಕುಳಿತು ಮುಂದಕ್ಕೆ ಬಾಗಿ.",
            "hi": "मदद रास्ते में है। मरीज को सीधा बैठाकर आगे झुकने दें।",
        },
    },
    "ELDERLY_FALL": {
        "urgencyLevel": "HIGH_AMBER", "triageScore": 80, "suggestedALS": False,
        "firstAidInstructions": [
            "Do NOT rush to pull the person up; check for hip or head pain.",
            "Support head and limbs with cushions or folded blankets.",
            "Cover with a warm blanket and reassure calmly.",
        ],
        "speechSummary": {
            "en": "Help is dispatched. Do not lift the person quickly. Keep them warm.",
            "kn": "ಸಹಾಯ ಬರುತ್ತಿದೆ. ಬಿದ್ದಿರುವ ವ್ಯಕ್ತಿಯನ್ನು ಎತ್ತಬೇಡಿ.",
            "hi": "सहायता आ रही है। व्यक्ति को एकदम से न उठाएं।",
        },
    },
    "MATERNAL_CRITICAL": {
        "urgencyLevel": "CRITICAL_RED", "triageScore": 95, "suggestedALS": True,
        "firstAidInstructions": [
            "Keep the patient lying on their left side and reassure them.",
            "Do not give food or drink if urgent surgery may be needed.",
            "Keep emergency documents and blood group information ready.",
        ],
        "speechSummary": {
            "en": "Maternity emergency response activated. Keep the patient on their left side.",
            "kn": "ಮಾತೃತ್ವ ತುರ್ತು ಸ್ಪಂದನೆ ಸಕ್ರಿಯ. ರೋಗಿಯನ್ನು ಎಡಭಾಗಕ್ಕೆ ಮಲಗಿಸಿ.",
            "hi": "मातृत्व आपातकाल सक्रिय। मरीज को बाईं करवट लिटाएं।",
        },
    },
    "GENERAL_MEDICAL": {
        "urgencyLevel": "MODERATE_YELLOW", "triageScore": 72, "suggestedALS": False,
        "firstAidInstructions": [
            "Stay with the patient in a safe, shaded location.",
            "Keep emergency phone line clear for dispatcher calls.",
        ],
        "speechSummary": {
            "en": "Emergency request registered. Stay calm and keep phone line open.",
            "kn": "ತುರ್ತು ವಿನಂತಿ ದಾಖಲಾಗಿದೆ. ಶಾಂತವಾಗಿರಿ.",
            "hi": "आपातकालीन अनुरोध दर्ज हो गया। शांत रहें।",
        },
    },
}


@dataclass
class ResponderSnapshot:
    id: str
    name: str
    type: str
    vehicle_number: str
    driver_name: str
    contact_number: str
    base_hospital: str
    current_lat: float
    current_lng: float
    is_available: bool
    speed_kmh: int
    eta_minutes: int


@dataclass
class HospitalSnapshot:
    id: str
    name: str
    area: str
    latitude: float
    longitude: float
    trauma_level: int
    icu_beds_available: int
    oxygen_available: bool
    contact_number: str


@dataclass
class DispatchDecision:
    matched_responder: dict[str, Any]
    matched_hospital: dict[str, Any]
    distance_km: float
    estimated_arrival_minutes: int
    urgency_level: str
    triage_score: int
    suggested_als: bool
    equity_priority_applied: bool
    ai_rationale: str


def get_guidance(category: str) -> dict[str, Any]:
    import copy
    return copy.deepcopy(GUIDANCE.get(category, GUIDANCE["GENERAL_MEDICAL"]))


def run_dispatch(
    location: dict[str, Any],
    category: str,
    is_peripheral: bool,
    responders: list[ResponderSnapshot],
    hospitals: list[HospitalSnapshot],
) -> DispatchDecision:
    """
    Stateless AI dispatch scorer.
    Weights: proximity 45 %, ALS capability 35 %, ETA 10 %, equity bonus 10 %.
    """
    requires_als = category in _ALS_CATEGORIES

    # Nearest hospital by Haversine distance
    nearest_h = min(
        hospitals,
        key=lambda h: haversine_meters(location["latitude"], location["longitude"], h.latitude, h.longitude),
    )

    available = [r for r in responders if r.is_available] or list(responders)
    best: ResponderSnapshot | None = None
    best_score = float("-inf")
    best_distance_km = 0.0
    best_eta = 6

    for r in available:
        dist_m = haversine_meters(location["latitude"], location["longitude"], r.current_lat, r.current_lng)
        dist_km = dist_m / 1000

        capability = (
            100 if requires_als and r.type in ("ALS_AMBULANCE", "TRAUMA_MOBILE_ICU")
            else 95 if not requires_als and r.type == "FIRST_RESPONDER_BIKE"
            else 70
        )
        distance_score = max(0.0, 100.0 - dist_km * 10)
        eta = max(2, round((dist_km / (r.speed_kmh or 35)) * 60 * 1.3))
        equity_bonus = 15 if is_peripheral else 0
        score = distance_score * 0.45 + capability * 0.35 + (100 - eta * 5) * 0.10 + equity_bonus

        if score > best_score:
            best, best_score, best_distance_km, best_eta = r, score, dist_km, eta

    assert best is not None

    triage = get_guidance(category)
    responder_dict = {
        "id": best.id,
        "name": best.name,
        "type": best.type,
        "vehicleNumber": best.vehicle_number,
        "driverName": best.driver_name,
        "contactNumber": best.contact_number,
        "baseHospital": best.base_hospital,
        "currentLocation": {"latitude": best.current_lat, "longitude": best.current_lng},
        "isAvailable": False,
        "speedKmh": best.speed_kmh,
        "etaMinutes": best_eta,
    }
    hospital_dict = {
        "id": nearest_h.id,
        "name": nearest_h.name,
        "area": nearest_h.area,
        "latitude": nearest_h.latitude,
        "longitude": nearest_h.longitude,
        "traumaLevel": nearest_h.trauma_level,
        "icuBedsAvailable": nearest_h.icu_beds_available,
        "oxygenAvailable": nearest_h.oxygen_available,
        "contactNumber": nearest_h.contact_number,
    }
    return DispatchDecision(
        matched_responder=responder_dict,
        matched_hospital=hospital_dict,
        distance_km=round(best_distance_km, 1),
        estimated_arrival_minutes=best_eta,
        urgency_level=triage["urgencyLevel"],
        triage_score=triage["triageScore"],
        suggested_als=triage["suggestedALS"],
        equity_priority_applied=is_peripheral,
        ai_rationale=(
            f"Assigned {best.name} ({best.type}) based on proximity "
            f"({best_distance_km:.1f} km, ETA ~{best_eta} min) & nearest trauma center "
            f"{nearest_h.name}."
            + (" Peripheral Ward equity weighting applied." if is_peripheral else "")
        ),
    )
