from __future__ import annotations

import copy
import hashlib
import json
import math
import os
import random
import tempfile
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.auth import AdminOrHospitalUser, AdminOrPatientUser, AdminUser, AnyAuthenticatedUser, LoginRequest, TokenResponse, User, authenticate_user, create_access_token

EmergencyCategory = Literal[
    "CARDIAC",
    "TRAUMA_ACCIDENT",
    "STROKE",
    "RESPIRATORY",
    "ELDERLY_FALL",
    "MATERNAL_CRITICAL",
    "GENERAL_MEDICAL",
]
AlertStatus = Literal[
    "IDLE",
    "ACQUIRING_LOCATION",
    "LOCATION_LOCKED",
    "ALERTING",
    "CONFIRMED",
    "DISPATCHED",
    "EN_ROUTE",
    "ON_SCENE",
    "RESOLVED",
    "CANCELLED",
]
NetworkTier = Literal["5G_HIGH_SPEED", "3G_SPOTTY", "2G_SMS_FALLBACK"]
LanguageCode = Literal["en", "kn", "hi"]


class GeoCoordinate(BaseModel):
    latitude: float
    longitude: float
    accuracy: float = 15.0
    timestamp: int = Field(default_factory=lambda: int(datetime.now().timestamp() * 1000))
    provider: Literal["GPS_HARDWARE", "CELL_TRIANGULATION", "WIFI_NETWORK", "MANUAL_PRESET"] = "GPS_HARDWARE"


class PresetLocation(BaseModel):
    name: str
    ward: str
    latitude: float
    longitude: float
    isPeripheral: bool
    pincode: str


class SosRequest(BaseModel):
    category: EmergencyCategory = "CARDIAC"
    networkTier: NetworkTier = "5G_HIGH_SPEED"
    language: LanguageCode = "en"
    selectedPreset: PresetLocation | None = None
    currentLocation: GeoCoordinate | None = None
    citizenName: str = "Pavan Kumar (KSSEM Citizen Pilot)"
    citizenPhone: str = "+91 98450 99881"


class StatusUpdate(BaseModel):
    status: AlertStatus


class BedUpdate(BaseModel):
    delta: int = Field(..., ge=-100, le=100)


class ProfileUpdate(BaseModel):
    data: dict[str, Any]


HOSPITALS: list[dict[str, Any]] = [
    {"id": "HOSP-01", "name": "KSSEM Medical & Emergency Center (Kanakapura Rd)", "area": "Vajrahalli / Mallasandra", "latitude": 12.8715, "longitude": 77.5452, "traumaLevel": 1, "icuBedsAvailable": 8, "oxygenAvailable": True, "contactNumber": "+91 80 2842 5012"},
    {"id": "HOSP-02", "name": "Aster RV Hospital", "area": "JP Nagar 1st Phase", "latitude": 12.9150, "longitude": 77.5857, "traumaLevel": 1, "icuBedsAvailable": 14, "oxygenAvailable": True, "contactNumber": "+91 80 6604 0400"},
    {"id": "HOSP-03", "name": "Fortis Hospital Bannerghatta", "area": "Bannerghatta Road", "latitude": 12.8943, "longitude": 77.5986, "traumaLevel": 1, "icuBedsAvailable": 12, "oxygenAvailable": True, "contactNumber": "+91 80 6621 4444"},
    {"id": "HOSP-04", "name": "St. John’s Medical College Hospital", "area": "Koramangala", "latitude": 12.9345, "longitude": 77.6206, "traumaLevel": 1, "icuBedsAvailable": 22, "oxygenAvailable": True, "contactNumber": "+91 80 2206 5000"},
    {"id": "HOSP-05", "name": "Manipal Hospital Jayanagar", "area": "Jayanagar 9th Block", "latitude": 12.9248, "longitude": 77.5929, "traumaLevel": 2, "icuBedsAvailable": 9, "oxygenAvailable": True, "contactNumber": "+91 80 2695 1000"},
    {"id": "HOSP-06", "name": "Victoria Emergency & Trauma Care (Govt)", "area": "KR Market / Fort", "latitude": 12.9634, "longitude": 77.5752, "traumaLevel": 1, "icuBedsAvailable": 30, "oxygenAvailable": True, "contactNumber": "+91 80 2670 1150"},
    {"id": "HOSP-07", "name": "Manipal Hospital Whitefield", "area": "Whitefield", "latitude": 12.9866, "longitude": 77.7289, "traumaLevel": 1, "icuBedsAvailable": 16, "oxygenAvailable": True, "contactNumber": "+91 80 2502 4444"},
    {"id": "HOSP-08", "name": "BGS Gleneagles Global Hospital", "area": "Kengeri", "latitude": 12.8988, "longitude": 77.5028, "traumaLevel": 2, "icuBedsAvailable": 11, "oxygenAvailable": True, "contactNumber": "+91 80 2625 5555"},
]

RESPONDERS: list[dict[str, Any]] = [
    {"id": "RESP-ALS-101", "name": "Apollo ALS Emergency Unit #01", "type": "ALS_AMBULANCE", "vehicleNumber": "KA-05-EM-9921", "driverName": "Ramesh Gowda", "contactNumber": "+91 98450 12345", "baseHospital": "KSSEM Medical & Emergency Center", "currentLocation": {"latitude": 12.8765, "longitude": 77.5498}, "isAvailable": True, "speedKmh": 42, "etaMinutes": 4},
    {"id": "RESP-BLS-202", "name": "108 GVK Rapid Ambulance #14", "type": "BLS_AMBULANCE", "vehicleNumber": "KA-01-G-4412", "driverName": "Syed Mansoor", "contactNumber": "+91 98860 55432", "baseHospital": "Aster RV Hospital", "currentLocation": {"latitude": 12.9122, "longitude": 77.5812}, "isAvailable": True, "speedKmh": 38, "etaMinutes": 6},
    {"id": "RESP-BIKE-303", "name": "First Responder Bike Medic #07", "type": "FIRST_RESPONDER_BIKE", "vehicleNumber": "KA-04-FR-1109", "driverName": "Prashanth Kumar", "contactNumber": "+91 97412 88765", "baseHospital": "Fortis Hospital Bannerghatta", "currentLocation": {"latitude": 12.8980, "longitude": 77.5920}, "isAvailable": True, "speedKmh": 55, "etaMinutes": 3},
    {"id": "RESP-ALS-104", "name": "St. John’s Trauma Mobile ICU #03", "type": "TRAUMA_MOBILE_ICU", "vehicleNumber": "KA-02-ICU-8822", "driverName": "Anthony Das", "contactNumber": "+91 94480 33119", "baseHospital": "St. John’s Medical College Hospital", "currentLocation": {"latitude": 12.9360, "longitude": 77.6180}, "isAvailable": True, "speedKmh": 40, "etaMinutes": 8},
    {"id": "RESP-BLS-205", "name": "Kengeri BBMP Rescue Unit #09", "type": "BLS_AMBULANCE", "vehicleNumber": "KA-41-EM-3301", "driverName": "Manjunath B", "contactNumber": "+91 99001 77621", "baseHospital": "BGS Gleneagles Global Hospital", "currentLocation": {"latitude": 12.9015, "longitude": 77.5090}, "isAvailable": True, "speedKmh": 45, "etaMinutes": 5},
]

PRESETS: list[dict[str, Any]] = [
    {"name": "KSSEM Campus, Kanakapura Road", "ward": "Vajrahalli / Mallasandra (Outer Ward)", "latitude": 12.8715, "longitude": 77.5452, "isPeripheral": True, "pincode": "560109"},
    {"name": "Jayanagar 4th Block Complex", "ward": "Jayanagar (Central Ward)", "latitude": 12.9298, "longitude": 77.5833, "isPeripheral": False, "pincode": "560041"},
    {"name": "Koramangala Sony World Signal", "ward": "Koramangala (Central Ward)", "latitude": 12.9344, "longitude": 77.6256, "isPeripheral": False, "pincode": "560034"},
    {"name": "Electronic City Phase 1 Toll Gate", "ward": "Electronic City (Outer Ward)", "latitude": 12.8452, "longitude": 77.6602, "isPeripheral": True, "pincode": "560100"},
    {"name": "Majestic KSRTC Central Bus Stand", "ward": "Gandhinagar / Majestic (Core Urban)", "latitude": 12.9778, "longitude": 77.5726, "isPeripheral": False, "pincode": "560009"},
    {"name": "Whitefield ITPL Main Gate", "ward": "Whitefield (Peripheral Ward)", "latitude": 12.9857, "longitude": 77.7318, "isPeripheral": True, "pincode": "560066"},
]

INITIAL_EEG = {
    "equity": {"accessParity2Gvs5G": {"rate2G": 96.8, "rate5G": 99.4}, "peripheralWardCoverageRate": 94.2, "multiLanguageUsagePct": {"en": 38, "kn": 46, "hi": 16}, "vulnerableUserSuccessRate": 98.1, "affordabilityAvgCostRs": 0.0},
    "efficacy": {"avgSosToConfirmSeconds": 8.4, "traditionalCadComparisonSeconds": 195.0, "gpsAcquisitionMeanSeconds": 2.1, "falseDispatchRejectionRatePct": 99.2, "smsFallbackDeliverySuccessPct": 98.7, "totalIncidentsHandled": 1428},
    "governance": {"dpdpConsentCompliancePct": 100.0, "auditTrailCompletenessPct": 100.0, "algorithmicBiasAuditScorePct": 97.5, "institutionalAccountabilityMapped": True},
}

INITIAL_PROFILE = {
    "abhaId": "91-4521-8890-3312", "name": "Ananya Sharma", "age": 34, "gender": "Female", "bloodGroup": "O+ Positive", "allergies": ["Penicillin", "Sulfa Drugs"], "chronicConditions": ["Mild Asthma", "Hypertension (Controlled)"], "currentMedications": ["Salbutamol Inhaler (PRN)", "Amlodipine 5mg OD"], "emergencyContacts": [{"id": "EC-01", "name": "Dr. Rajesh Sharma", "relation": "Spouse / Next of Kin", "phone": "+91 98450 12345", "notifyOnSOS": True}, {"id": "EC-02", "name": "Sunita Sharma", "relation": "Mother", "phone": "+91 94480 67890", "notifyOnSOS": True}], "organDonor": True, "preferredHospital": "HOSP-01",
}

INITIAL_ADMISSIONS = [
    {"id": "ADM-2026-081", "alertId": "INC-8812", "patientName": "Kishore Kumar (58M)", "category": "CARDIAC", "urgencyLevel": "CRITICAL_RED", "arrivedAt": "12:45 PM", "bedAssigned": "ICU Bed #04 (Cath Lab)", "doctorInCharge": "Dr. Vivek Murthy (Cardiologist)", "status": "ADMITTED"},
    {"id": "ADM-2026-079", "alertId": "INC-8804", "patientName": "Ravi Shankar (29M)", "category": "TRAUMA_ACCIDENT", "urgencyLevel": "HIGH_AMBER", "arrivedAt": "11:20 AM", "bedAssigned": "ER Trauma Bay 2", "doctorInCharge": "Dr. Preeti Gowda (Trauma Lead)", "status": "ADMITTED"},
    {"id": "ADM-2026-074", "alertId": "INC-8791", "patientName": "Meenakshi Iyer (72F)", "category": "ELDERLY_FALL", "urgencyLevel": "MODERATE_YELLOW", "arrivedAt": "09:15 AM", "bedAssigned": "Observation Bed 07", "doctorInCharge": "Dr. Arvind Rao", "status": "DISCHARGED"},
]

GUIDANCE: dict[str, dict[str, Any]] = {
    "CARDIAC": {"urgencyLevel": "CRITICAL_RED", "triageScore": 98, "suggestedALS": True, "firstAidInstructions": ["Keep patient calm, resting comfortably in sitting position.", "Loosen tight clothing around neck and chest.", "If patient becomes unresponsive, begin CPR: 100-120 chest compressions per minute at center of chest.", "Do NOT give solid foods or water. Have Aspirin (300mg) ready if prescribed."], "speechSummary": {"en": "Help is dispatched! Keep patient sitting comfortably. Loosen tight clothing. If unconscious, begin chest compressions immediately.", "kn": "ತುರ್ತು ವಾಹನ ರವಾನಿಸಲಾಗಿದೆ! ರೋಗಿಯನ್ನು ಆರಾಮವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಲು ಬಿಡಿ. ಪ್ರಜ್ಞೆ ತಪ್ಪಿದರೆ ತಕ್ಷಣ ಎದೆಯ ಮೇಲೆ ಒತ್ತಡ ಹಾಕಿ.", "hi": "एम्बुलेंस रवाना हो चुकी है! मरीज को आराम से बैठाएं। कपड़े ढीले करें। यदि बेहोश हों तो तुरंत छाती दबाकर CPR शुरू करें।"}},
    "TRAUMA_ACCIDENT": {"urgencyLevel": "CRITICAL_RED", "triageScore": 92, "suggestedALS": True, "firstAidInstructions": ["Apply firm, direct pressure to any active bleeding wound with a clean cloth.", "Do NOT move patient if neck or spinal injury is suspected unless in immediate danger.", "Keep patient warm with a jacket or blanket to prevent trauma shock.", "Check breathing and keep airway clear."], "speechSummary": {"en": "Ambulance is en route! Apply firm pressure on bleeding areas. Do not move patient neck or spine.", "kn": "ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುತ್ತಿದೆ! ರಕ್ತಸ್ರಾವವಿರುವ ಜಾಗಕ್ಕೆ ಬಟ್ಟೆಯಿಂದ ಗಟ್ಟಿಯಾಗಿ ಒತ್ತಿ ಹಿಡಿಯಿರಿ. ರೋಗಿಯನ್ನು ಅಲುಗಾಡಿಸಬೇಡಿ.", "hi": "एम्बुलेंस आ रही है! बहते खून पर साफ कपड़े से दबाव बनाएं। मरीज की गर्दन या रीढ़ को बिल्कुल न हिलाएं।"}},
    "STROKE": {"urgencyLevel": "CRITICAL_RED", "triageScore": 95, "suggestedALS": True, "firstAidInstructions": ["Check FAST symptoms: Face drooping, Arm weakness, Speech difficulty, Time.", "Keep patient lying down on their side (recovery position) with head slightly raised.", "Do NOT give aspirin, medication, food, or drink.", "Note the exact time symptoms started."], "speechSummary": {"en": "Stroke response activated! Keep patient on their side with head elevated. Do not give any food or liquids.", "kn": "ಪಾರ್ಶ್ವವಾಯು ತುರ್ತು ಸ್ಪಂದನೆ ಸಕ್ರಿಯವಾಗಿದೆ! ರೋಗಿಯನ್ನು ಒಂದು ಬದಿಗೆ ಮಲಗಿಸಿ, ತಲೆಯನ್ನು ಸ್ವಲ್ಪ ಎತ್ತರದಲ್ಲಿಡಿ. ನೀರು ಅಥವಾ ಆಹಾರ ಕೊಡಬೇಡಿ.", "hi": "स्ट्रोक प्रोटोकॉल सक्रिय है! मरीज को करवट के बल लिटाएं और सिर थोड़ा ऊपर रखें। कुछ भी खाने या पीने को न दें।"}},
    "RESPIRATORY": {"urgencyLevel": "HIGH_AMBER", "triageScore": 86, "suggestedALS": True, "firstAidInstructions": ["Help patient sit upright, leaning slightly forward with hands on knees (tripod position).", "Ensure fresh airflow; open windows or loosen tight collars.", "Assist with prescribed asthma inhaler or oxygen if immediately available.", "Encourage slow, pursed-lip breathing."], "speechSummary": {"en": "Paramedics on the way. Sit upright and lean slightly forward. Use inhaler if prescribed.", "kn": "ಆಂಬ್ಯುಲೆನ್ಸ್ ಬರುತ್ತಿದೆ. ರೋಗಿ ನೇರವಾಗಿ ಕುಳಿತು ಸ್ವಲ್ಪ ಮುಂದಕ್ಕೆ ಬಾಗಲು ಸಹಾಯ ಮಾಡಿ. ಇನ್ಹೇಲರ್ ಇದ್ದರೆ ಬಳಸಿ.", "hi": "मदद रास्ते में है। मरीज को सीधा बैठाकर आगे झुकने दें। यदि इनहेलर है तो तुरंत उपयोग कराएं।"}},
    "ELDERLY_FALL": {"urgencyLevel": "HIGH_AMBER", "triageScore": 80, "suggestedALS": False, "firstAidInstructions": ["Do NOT rush to pull the person up immediately; check for hip or head pain.", "Support the head and limbs with cushions or folded blankets.", "Cover with a warm blanket and reassure calmly.", "First responder unit is equipped with geriatric immobilization support."], "speechSummary": {"en": "Help is dispatched. Do not lift the person up quickly. Keep them warm and supported.", "kn": "ಸಹಾಯ ಬರುತ್ತಿದೆ. ಬಿದ್ದಿರುವ ವ್ಯಕ್ತಿಯನ್ನು ತಕ್ಷಣ ಎತ್ತಬೇಡಿ. ಬೆಚ್ಚಗಿರಿಸಿ ಸಮಾಧಾನಪಡಿಸಿ.", "hi": "सहायता आ रही है। व्यक्ति को एकदम से न उठाएं। उन्हें कंबल से ढकें और शांत रखें।"}},
    "MATERNAL_CRITICAL": {"urgencyLevel": "CRITICAL_RED", "triageScore": 95, "suggestedALS": True, "firstAidInstructions": ["Keep the patient lying on their left side and reassure them.", "Do not give food or drink if urgent surgery may be needed.", "Keep emergency documents and blood group information ready.", "Monitor breathing and severe bleeding while waiting for paramedics."], "speechSummary": {"en": "Maternity emergency response activated. Keep the patient on their left side and stay calm.", "kn": "ಮಾತೃತ್ವ ತುರ್ತು ಸ್ಪಂದನೆ ಸಕ್ರಿಯವಾಗಿದೆ. ರೋಗಿಯನ್ನು ಎಡಭಾಗಕ್ಕೆ ಮಲಗಿಸಿ ಶಾಂತವಾಗಿರಿ.", "hi": "मातृत्व आपातकालीन सहायता सक्रिय है। मरीज को बाईं करवट लिटाएं और शांत रहें।"}},
    "GENERAL_MEDICAL": {"urgencyLevel": "MODERATE_YELLOW", "triageScore": 72, "suggestedALS": False, "firstAidInstructions": ["Stay with the patient in a safe, shaded location.", "Keep emergency phone line clear for dispatcher calls.", "Prepare patient medical history and current prescription details for the crew."], "speechSummary": {"en": "Emergency request registered. Stay calm and keep phone line open.", "kn": "ತುರ್ತು ವಿನಂತಿ ದಾಖಲಾಗಿದೆ. ಶಾಂತವಾಗಿರಿ, ತುರ್ತು ತಂಡ ತಕ್ಷಣ ತಲುಪಲಿದೆ.", "hi": "आपातकालीन अनुरोध दर्ज कर लिया गया है। शांत रहें, बचाव दल जल्द पहुंच रहा है।"}},
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def haversine_meters(a_lat: float, a_lng: float, b_lat: float, b_lng: float) -> float:
    radius = 6_371_000
    d_lat = math.radians(b_lat - a_lat)
    d_lng = math.radians(b_lng - a_lng)
    part = math.sin(d_lat / 2) ** 2 + math.cos(math.radians(a_lat)) * math.cos(math.radians(b_lat)) * math.sin(d_lng / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(part), math.sqrt(1 - part))


def make_coordinate(preset: dict[str, Any], tier: NetworkTier, supplied: GeoCoordinate | None = None) -> dict[str, Any]:
    if supplied:
        return supplied.model_dump()
    jitter = 0.00004 if tier != "2G_SMS_FALLBACK" else 0.000025
    provider = "GPS_HARDWARE" if tier == "5G_HIGH_SPEED" else "CELL_TRIANGULATION" if tier == "3G_SPOTTY" else "MANUAL_PRESET"
    accuracy = 12.0 if tier == "5G_HIGH_SPEED" else 38.5 if tier == "3G_SPOTTY" else 42.0
    return {"latitude": preset["latitude"] + random.uniform(-jitter, jitter), "longitude": preset["longitude"] + random.uniform(-jitter, jitter), "accuracy": accuracy, "timestamp": int(datetime.now().timestamp() * 1000), "provider": provider}


def location_lock(first: dict[str, Any], second: dict[str, Any]) -> dict[str, Any]:
    delta = haversine_meters(first["latitude"], first["longitude"], second["latitude"], second["longitude"])
    first_pass = first["accuracy"] <= 40
    second_pass = delta <= 25
    locked = first_pass and second_pass
    confidence = max(85, min(99, round(100 - min(first["accuracy"], second["accuracy"]) * 0.8))) if locked else 65
    samples = [
        {"sampleIndex": 1, "coordinate": first, "passedConsistency": first_pass, "timeAcquired": now_iso()},
        {"sampleIndex": 2, "coordinate": second, "deltaFromPrevious": round(delta, 2), "passedConsistency": second_pass, "timeAcquired": now_iso()},
    ]
    return {"isLocked": locked, "samples": samples, "finalCoordinate": second if locked else None, "confidenceScore": confidence, "lockDurationMs": 1450, "attemptCount": 2}


def guidance(category: EmergencyCategory) -> dict[str, Any]:
    return copy.deepcopy(GUIDANCE[category])


def dispatch_decision(location: dict[str, Any], category: EmergencyCategory, peripheral: bool, fleet: list[dict[str, Any]]) -> dict[str, Any]:
    requires_als = category in ("CARDIAC", "STROKE", "TRAUMA_ACCIDENT", "MATERNAL_CRITICAL")
    hospital = min(HOSPITALS, key=lambda h: haversine_meters(location["latitude"], location["longitude"], h["latitude"], h["longitude"]))
    available = [responder for responder in fleet if responder.get("isAvailable", True)] or fleet
    best: dict[str, Any] | None = None
    highest = float("-inf")
    best_distance_km = 0.0
    best_eta = 6
    for responder in available:
        distance_km = haversine_meters(location["latitude"], location["longitude"], responder["currentLocation"]["latitude"], responder["currentLocation"]["longitude"]) / 1000
        capability = 100 if requires_als and responder["type"] in ("ALS_AMBULANCE", "TRAUMA_MOBILE_ICU") else 95 if not requires_als and responder["type"] == "FIRST_RESPONDER_BIKE" else 70
        distance_score = max(0, 100 - distance_km * 10)
        eta = max(2, round((distance_km / (responder.get("speedKmh") or 35)) * 60 * 1.3))
        equity_bonus = 15 if peripheral else 0
        score = distance_score * 0.45 + capability * 0.35 + (100 - eta * 5) * 0.1 + equity_bonus
        if score > highest:
            best, highest, best_distance_km, best_eta = responder, score, distance_km, eta
    assert best is not None
    assigned = copy.deepcopy(best)
    assigned["etaMinutes"] = best_eta
    triage = guidance(category)
    return {"matchedResponder": assigned, "matchedHospital": copy.deepcopy(hospital), "distanceKm": round(best_distance_km, 1), "estimatedArrivalMinutes": best_eta, "urgencyLevel": triage["urgencyLevel"], "triageScore": triage["triageScore"], "suggestedALS": triage["suggestedALS"], "equityPriorityApplied": peripheral, "aiRationale": f"Assigned {best['name']} ({best['type']}) based on proximity ({best_distance_km:.1f} km, ETA ~{best_eta} min) & nearest trauma center {hospital['name']}. {'Peripheral Ward equity weighting applied.' if peripheral else ''}"}


def encode_sms(alert_id: str, coordinate: dict[str, Any], category: str, name: str = "CITIZEN") -> str:
    safe_name = (name or "CITIZEN")[:10]
    timestamp = datetime.now(timezone.utc).strftime("%H:%M:%S")
    return f"RESQ#{alert_id}#LOC:{coordinate['latitude']:.5f},{coordinate['longitude']:.5f}#ACC:{round(coordinate['accuracy'])}m#TYPE:{category}#USR:{safe_name}#TIME:{timestamp}#URGENT_108_DISPATCH"


class StateStore:
    def __init__(self) -> None:
        self.lock = threading.RLock()
        self.path = Path(os.getenv("RESQLINK_DATA_FILE", Path(__file__).resolve().parents[1] / "data" / "resqlink.json"))
        self.state = self._load()

    def _default(self) -> dict[str, Any]:
        statuses = {h["id"]: {"hospitalId": h["id"], "emergencyDepartmentOpen": True, "traumaTeamStandby": True, "otReady": True, "divertStatus": False, "activeAdmissionsCount": random.randint(3, 6)} for h in HOSPITALS}
        return {"activeAlert": None, "alertHistory": [], "responders": copy.deepcopy(RESPONDERS), "hospitals": copy.deepcopy(HOSPITALS), "presets": copy.deepcopy(PRESETS), "auditLogs": [], "eegMetrics": copy.deepcopy(INITIAL_EEG), "hospitalStatuses": statuses, "hospitalAdmissions": copy.deepcopy(INITIAL_ADMISSIONS), "patientProfile": copy.deepcopy(INITIAL_PROFILE)}

    def _load(self) -> dict[str, Any]:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if self.path.exists():
            try:
                return json.loads(self.path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                pass
        state = self._default()
        self._save(state)
        return state

    def _save(self, state: dict[str, Any] | None = None) -> None:
        payload = state if state is not None else self.state
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fd, temp_name = tempfile.mkstemp(prefix="resqlink-", suffix=".json", dir=self.path.parent)
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, ensure_ascii=False, indent=2)
            os.replace(temp_name, self.path)
        finally:
            if os.path.exists(temp_name):
                os.unlink(temp_name)

    def snapshot(self) -> dict[str, Any]:
        with self.lock:
            return copy.deepcopy(self.state)

    def save(self) -> None:
        with self.lock:
            self._save()

    def reset(self) -> None:
        with self.lock:
            self.state = self._default()
            self._save()


store = StateStore()


def audit(alert_id: str, event: str, actor: str, details: dict[str, Any]) -> dict[str, Any]:
    with store.lock:
        timestamp = now_iso()
        previous_hash = store.state["auditLogs"][-1]["cryptographicHash"] if store.state["auditLogs"] else "GENESIS_RESQLINK_CHAIN_2026"
        raw = json.dumps({"alertId": alert_id, "event": event, "actor": actor, "details": details, "timestamp": timestamp}, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        digest = hashlib.sha256(f"{previous_hash}:{raw}".encode("utf-8")).hexdigest()
        entry = {"id": f"AUDIT-{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:4].upper()}", "timestamp": timestamp, "alertId": alert_id, "event": event, "actor": actor, "details": details, "dataMinimizationVerified": True, "cryptographicHash": f"SHA256:{digest}"}
        store.state["auditLogs"].insert(0, entry)
        store.save()
        return entry


def choose_preset(requested: PresetLocation | None) -> dict[str, Any]:
    if requested:
        return requested.model_dump()
    return copy.deepcopy(PRESETS[0])


def create_alert(request: SosRequest) -> dict[str, Any]:
    preset = choose_preset(request.selectedPreset)
    alert_id = f"BLR-{random.randint(1000, 9999)}"
    short_code = f"RQ-{uuid.uuid4().hex[:4].upper()}"
    triggered_at = now_iso()
    first = make_coordinate(preset, request.networkTier, request.currentLocation)
    second = make_coordinate(preset, request.networkTier)
    locked_state = location_lock(first, second)
    location = locked_state["finalCoordinate"] or second
    triage = guidance(request.category)
    with store.lock:
        initial_alert = {"id": alert_id, "shortCode": short_code, "timestamp": triggered_at, "category": request.category, "description": f"Immediate emergency assistance requested at {preset['name']}", "citizenName": request.citizenName, "citizenPhone": request.citizenPhone, "location": first, "locationLockState": {"isLocked": False, "samples": [], "finalCoordinate": None, "confidenceScore": 40, "lockDurationMs": 0, "attemptCount": 1}, "status": "ACQUIRING_LOCATION", "statusTimestamps": {"triggeredAt": triggered_at}, "networkUsed": request.networkTier, "fallbackSMSUsed": request.networkTier == "2G_SMS_FALLBACK", "estimatedArrivalMinutes": 5, "aiTriage": triage, "equityMetadata": {"deviceTier": "FEATURE_2G" if request.networkTier == "2G_SMS_FALLBACK" else "SMARTPHONE", "wardName": preset["ward"], "isPeripheralWard": preset["isPeripheral"], "userDemographic": "GENERAL"}}
        store.state["activeAlert"] = initial_alert
    audit(alert_id, "SOS_TRIGGERED", "CITIZEN", {"category": request.category, "networkTier": request.networkTier, "ward": preset["ward"], "language": request.language})
    audit(alert_id, "GPS_SAMPLE_ACQUIRED", "GEOLOCATION_ENGINE", {"sampleIndex": 1, "lat": first["latitude"], "lng": first["longitude"], "accuracy": first["accuracy"], "provider": first["provider"]})
    audit(alert_id, "LOCATION_LOCK_VERIFIED", "GEOLOCATION_ENGINE", {"sampleCount": 2, "finalAccuracyMeters": location["accuracy"], "confidenceScore": locked_state["confidenceScore"], "consistencyPassed": locked_state["isLocked"]})
    with store.lock:
        decision = dispatch_decision(location, request.category, preset["isPeripheral"], store.state["responders"])
    audit(alert_id, "AI_TRIAGE_COMPUTED", "AI_DISPATCH_ENGINE", {"triageScore": decision["triageScore"], "urgencyLevel": decision["urgencyLevel"], "suggestedALS": decision["suggestedALS"], "aiRationale": decision["aiRationale"]})
    audit(alert_id, "RESPONDER_ALLOCATED", "AI_DISPATCH_ENGINE", {"responderId": decision["matchedResponder"]["id"], "responderName": decision["matchedResponder"]["name"], "etaMinutes": decision["estimatedArrivalMinutes"], "hospital": decision["matchedHospital"]["name"]})
    sms_payload = None
    if request.networkTier == "2G_SMS_FALLBACK":
        sms_payload = encode_sms(alert_id, location, request.category, request.citizenName)
        audit(alert_id, "SMS_FALLBACK_DISPATCHED", "TWILIO_GATEWAY", {"messageSid": f"SM{uuid.uuid4().hex[:10]}", "rawPayload": sms_payload, "latencyMs": random.randint(1200, 2000), "status": "DELIVERED"})
    confirmed_at = now_iso()
    with store.lock:
        final_alert = {**initial_alert, "location": location, "locationLockState": locked_state, "status": "DISPATCHED", "statusTimestamps": {"triggeredAt": triggered_at, "lockedAt": confirmed_at, "confirmedAt": confirmed_at, "dispatchedAt": confirmed_at}, "assignedResponder": decision["matchedResponder"], "assignedHospital": decision["matchedHospital"], "estimatedArrivalMinutes": decision["estimatedArrivalMinutes"], "smsPayloadRaw": sms_payload}
        store.state["activeAlert"] = final_alert
        store.state["alertHistory"].insert(0, final_alert)
        for responder in store.state["responders"]:
            if responder["id"] == decision["matchedResponder"]["id"]:
                responder["isAvailable"] = False
                responder["assignedIncidentId"] = alert_id
                responder["etaMinutes"] = decision["estimatedArrivalMinutes"]
        store.state["eegMetrics"]["efficacy"]["totalIncidentsHandled"] += 1
        store.save()
    return final_alert


def get_alert(alert_id: str) -> dict[str, Any]:
    state = store.snapshot()
    if state["activeAlert"] and state["activeAlert"]["id"] == alert_id:
        return state["activeAlert"]
    for alert in state["alertHistory"]:
        if alert["id"] == alert_id:
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")


app = FastAPI(title="RESQLINK Emergency Dispatch API", version="1.0.0", description="Python backend for the RESQLINK Bengaluru emergency-response frontend.")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])


@app.post("/api/auth/login", response_model=TokenResponse)
def login(request: LoginRequest) -> TokenResponse:
    user = authenticate_user(request.username, request.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid username or password", headers={"WWW-Authenticate": "Bearer"})
    return create_access_token(user)


@app.get("/api/auth/me", response_model=User)
def auth_me(user: AnyAuthenticatedUser) -> User:
    return user


@app.post("/api/auth/logout")
def logout(user: AnyAuthenticatedUser) -> dict[str, Any]:
    return {"ok": True, "username": user.username}


@app.get("/api/health")
def health() -> dict[str, Any]:
    return {"status": "ok", "service": "resqlink-backend", "timestamp": now_iso()}


@app.get("/api/bootstrap")
def bootstrap(user: AnyAuthenticatedUser) -> dict[str, Any]:
    state = store.snapshot()
    return {**state, "currentLocation": state["activeAlert"]["location"] if state["activeAlert"] else None, "selectedPreset": state["presets"][0], "networkTier": "5G_HIGH_SPEED", "language": "en", "assistiveHighContrast": False, "voiceGuidanceEnabled": True, "isSimulating": False, "userRole": user.role, "adminViewTab": "admin" if user.role == "admin" else user.role, "selectedHospitalId": user.hospitalId or "HOSP-01"}


@app.get("/api/hospitals")
def hospitals(user: AnyAuthenticatedUser) -> list[dict[str, Any]]:
    return store.snapshot()["hospitals"]


@app.get("/api/responders")
def responders(user: AnyAuthenticatedUser) -> list[dict[str, Any]]:
    return store.snapshot()["responders"]


@app.get("/api/presets")
def presets(user: AnyAuthenticatedUser) -> list[dict[str, Any]]:
    return store.snapshot()["presets"]


@app.get("/api/alerts")
def alerts(user: AnyAuthenticatedUser) -> dict[str, Any]:
    state = store.snapshot()
    return {"activeAlert": state["activeAlert"], "alertHistory": state["alertHistory"]}


@app.get("/api/alerts/{alert_id}")
def alert_detail(alert_id: str, user: AnyAuthenticatedUser) -> dict[str, Any]:
    return get_alert(alert_id)


@app.post("/api/sos", status_code=201)
def trigger_sos(request: SosRequest, user: AdminOrPatientUser) -> dict[str, Any]:
    return create_alert(request)


@app.post("/api/alerts/{alert_id}/cancel")
def cancel_sos(alert_id: str, user: AdminOrPatientUser) -> dict[str, Any]:
    alert = get_alert(alert_id)
    with store.lock:
        responder_id = (alert.get("assignedResponder") or {}).get("id")
        if responder_id:
            for responder in store.state["responders"]:
                if responder["id"] == responder_id:
                    responder["isAvailable"] = True
                    responder.pop("assignedIncidentId", None)
        if store.state["activeAlert"] and store.state["activeAlert"]["id"] == alert_id:
            store.state["activeAlert"] = None
        store.save()
    audit(alert_id, "INCIDENT_RESOLVED", "CITIZEN", {"action": "CANCELLED_BY_USER", "reason": "TEST_COMPLETED_OR_FALSE_ALARM"})
    return {"ok": True, "alertId": alert_id}


@app.patch("/api/alerts/{alert_id}/status")
def update_alert_status(alert_id: str, request: StatusUpdate, user: AdminOrHospitalUser) -> dict[str, Any]:
    with store.lock:
        alert = get_alert(alert_id)
        timestamp = now_iso()
        alert["status"] = request.status
        key = f"{request.status.lower()}At"
        alert.setdefault("statusTimestamps", {})[key] = timestamp
        for collection in (store.state["alertHistory"],):
            for candidate in collection:
                if candidate["id"] == alert_id:
                    candidate.update(copy.deepcopy(alert))
        if store.state["activeAlert"] and store.state["activeAlert"]["id"] == alert_id:
            store.state["activeAlert"] = copy.deepcopy(alert)
        store.save()
    audit(alert_id, "STATUS_UPDATED", "DISPATCHER_CAD", {"newStatus": request.status, "timestamp": timestamp})
    return alert


@app.post("/api/simulate/incident", status_code=201)
def simulate_external_incident(user: AdminUser) -> dict[str, Any]:
    preset = random.choice(PRESETS)
    category: EmergencyCategory = random.choice(["TRAUMA_ACCIDENT", "CARDIAC", "STROKE", "RESPIRATORY", "ELDERLY_FALL"])
    location = {"latitude": preset["latitude"] + random.uniform(-0.005, 0.005), "longitude": preset["longitude"] + random.uniform(-0.005, 0.005), "accuracy": 10, "timestamp": int(datetime.now().timestamp() * 1000), "provider": "GPS_HARDWARE"}
    with store.lock:
        decision = dispatch_decision(location, category, preset["isPeripheral"], store.state["responders"])
    alert_id = f"EXT-{random.randint(2000, 9999)}"
    timestamp = now_iso()
    alert = {"id": alert_id, "shortCode": f"EXT-{uuid.uuid4().hex[:4].upper()}", "timestamp": timestamp, "category": category, "description": f"Emergency reported in {preset['ward']}", "citizenName": "Bengaluru Citizen", "citizenPhone": "+91 99887 66554", "location": location, "locationLockState": {"isLocked": True, "samples": [], "finalCoordinate": location, "confidenceScore": 94, "lockDurationMs": 1200, "attemptCount": 2}, "status": "CONFIRMED", "statusTimestamps": {"triggeredAt": timestamp, "confirmedAt": timestamp}, "networkUsed": "5G_HIGH_SPEED", "fallbackSMSUsed": False, "assignedResponder": decision["matchedResponder"], "assignedHospital": decision["matchedHospital"], "estimatedArrivalMinutes": decision["estimatedArrivalMinutes"], "aiTriage": guidance(category), "equityMetadata": {"deviceTier": "SMARTPHONE", "wardName": preset["ward"], "isPeripheralWard": preset["isPeripheral"], "userDemographic": "GENERAL"}}
    with store.lock:
        store.state["alertHistory"].insert(0, alert)
        store.save()
    audit(alert_id, "SOS_TRIGGERED", "CITIZEN", {"simulated": True, "ward": preset["ward"], "category": category})
    return alert


@app.get("/api/audit-logs")
def audit_logs(user: AdminOrHospitalUser, alertId: str | None = None) -> list[dict[str, Any]]:
    logs = store.snapshot()["auditLogs"]
    return [log for log in logs if not alertId or log["alertId"] == alertId]


@app.get("/api/eeg-metrics")
def eeg_metrics(user: AdminUser) -> dict[str, Any]:
    return store.snapshot()["eegMetrics"]


@app.get("/api/hospital-statuses")
def hospital_statuses(user: AdminOrHospitalUser) -> dict[str, Any]:
    return store.snapshot()["hospitalStatuses"]


@app.get("/api/hospital-admissions")
def hospital_admissions(user: AdminOrHospitalUser) -> list[dict[str, Any]]:
    return store.snapshot()["hospitalAdmissions"]


@app.patch("/api/hospitals/{hospital_id}/beds")
def update_hospital_beds(hospital_id: str, request: BedUpdate, user: AdminOrHospitalUser) -> dict[str, Any]:
    with store.lock:
        hospital = next((h for h in store.state["hospitals"] if h["id"] == hospital_id), None)
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")
        hospital["icuBedsAvailable"] = max(0, hospital["icuBedsAvailable"] + request.delta)
        store.save()
        return hospital


def toggle_status(hospital_id: str, field: str) -> dict[str, Any]:
    with store.lock:
        status = store.state["hospitalStatuses"].get(hospital_id)
        if not status:
            raise HTTPException(status_code=404, detail="Hospital status not found")
        status[field] = not status[field]
        store.save()
        return copy.deepcopy(status)


@app.post("/api/hospitals/{hospital_id}/oxygen/toggle")
def toggle_oxygen(hospital_id: str, user: AdminOrHospitalUser) -> dict[str, Any]:
    with store.lock:
        hospital = next((h for h in store.state["hospitals"] if h["id"] == hospital_id), None)
        if not hospital:
            raise HTTPException(status_code=404, detail="Hospital not found")
        hospital["oxygenAvailable"] = not hospital["oxygenAvailable"]
        store.save()
        return hospital


@app.post("/api/hospitals/{hospital_id}/trauma-team/toggle")
def toggle_trauma_team(hospital_id: str, user: AdminOrHospitalUser) -> dict[str, Any]:
    return toggle_status(hospital_id, "traumaTeamStandby")


@app.post("/api/hospitals/{hospital_id}/divert/toggle")
def toggle_divert(hospital_id: str, user: AdminOrHospitalUser) -> dict[str, Any]:
    return toggle_status(hospital_id, "divertStatus")


@app.post("/api/hospitals/inbound/{alert_id}/acknowledge")
def acknowledge_inbound(alert_id: str, user: AdminOrHospitalUser) -> dict[str, Any]:
    audit(alert_id, "STATUS_UPDATED", "DISPATCHER_CAD", {"action": "HOSPITAL_ACKNOWLEDGED", "note": "Hospital ER team acknowledged incoming transport"})
    return {"ok": True, "alertId": alert_id, "action": "HOSPITAL_ACKNOWLEDGED"}


@app.post("/api/hospitals/inbound/{alert_id}/prepare-trauma-bay")
def prepare_trauma_bay(alert_id: str, user: AdminOrHospitalUser) -> dict[str, Any]:
    audit(alert_id, "STATUS_UPDATED", "DISPATCHER_CAD", {"action": "TRAUMA_BAY_PREPPED", "note": "Emergency Trauma Bay prepped and life-support ready"})
    return {"ok": True, "alertId": alert_id, "action": "TRAUMA_BAY_PREPPED"}


@app.get("/api/patient-profile")
def patient_profile(user: AdminOrPatientUser) -> dict[str, Any]:
    return store.snapshot()["patientProfile"]


@app.patch("/api/patient-profile")
def update_patient_profile(request: ProfileUpdate, user: AdminOrPatientUser) -> dict[str, Any]:
    with store.lock:
        store.state["patientProfile"].update(request.data)
        store.save()
        return copy.deepcopy(store.state["patientProfile"])


@app.post("/api/reset")
def reset_data(user: AdminUser) -> dict[str, Any]:
    store.reset()
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=False)
