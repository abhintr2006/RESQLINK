from __future__ import annotations

import random

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.models import Hospital, HospitalAdmission, HospitalStatus, PatientProfile, Responder, User

# ── Seed data (Bengaluru-specific) ────────────────────────────────────────────

_HOSPITALS = [
    {"id": "HOSP-01", "name": "KSSEM Medical & Emergency Center (Kanakapura Rd)", "area": "Vajrahalli / Mallasandra", "latitude": 12.8715, "longitude": 77.5452, "trauma_level": 1, "icu_beds_available": 8, "oxygen_available": True, "contact_number": "+91 80 2842 5012"},
    {"id": "HOSP-02", "name": "Aster RV Hospital", "area": "JP Nagar 1st Phase", "latitude": 12.9150, "longitude": 77.5857, "trauma_level": 1, "icu_beds_available": 14, "oxygen_available": True, "contact_number": "+91 80 6604 0400"},
    {"id": "HOSP-03", "name": "Fortis Hospital Bannerghatta", "area": "Bannerghatta Road", "latitude": 12.8943, "longitude": 77.5986, "trauma_level": 1, "icu_beds_available": 12, "oxygen_available": True, "contact_number": "+91 80 6621 4444"},
    {"id": "HOSP-04", "name": "St. John's Medical College Hospital", "area": "Koramangala", "latitude": 12.9345, "longitude": 77.6206, "trauma_level": 1, "icu_beds_available": 22, "oxygen_available": True, "contact_number": "+91 80 2206 5000"},
    {"id": "HOSP-05", "name": "Manipal Hospital Jayanagar", "area": "Jayanagar 9th Block", "latitude": 12.9248, "longitude": 77.5929, "trauma_level": 2, "icu_beds_available": 9, "oxygen_available": True, "contact_number": "+91 80 2695 1000"},
    {"id": "HOSP-06", "name": "Victoria Emergency & Trauma Care (Govt)", "area": "KR Market / Fort", "latitude": 12.9634, "longitude": 77.5752, "trauma_level": 1, "icu_beds_available": 30, "oxygen_available": True, "contact_number": "+91 80 2670 1150"},
    {"id": "HOSP-07", "name": "Manipal Hospital Whitefield", "area": "Whitefield", "latitude": 12.9866, "longitude": 77.7289, "trauma_level": 1, "icu_beds_available": 16, "oxygen_available": True, "contact_number": "+91 80 2502 4444"},
    {"id": "HOSP-08", "name": "BGS Gleneagles Global Hospital", "area": "Kengeri", "latitude": 12.8988, "longitude": 77.5028, "trauma_level": 2, "icu_beds_available": 11, "oxygen_available": True, "contact_number": "+91 80 2625 5555"},
]

_RESPONDERS = [
    {"id": "RESP-ALS-101", "name": "Apollo ALS Emergency Unit #01", "type": "ALS_AMBULANCE", "vehicle_number": "KA-05-EM-9921", "driver_name": "Ramesh Gowda", "contact_number": "+91 98450 12345", "base_hospital": "KSSEM Medical & Emergency Center", "current_lat": 12.8765, "current_lng": 77.5498, "is_available": True, "speed_kmh": 42, "eta_minutes": 4},
    {"id": "RESP-BLS-202", "name": "108 GVK Rapid Ambulance #14", "type": "BLS_AMBULANCE", "vehicle_number": "KA-01-G-4412", "driver_name": "Syed Mansoor", "contact_number": "+91 98860 55432", "base_hospital": "Aster RV Hospital", "current_lat": 12.9122, "current_lng": 77.5812, "is_available": True, "speed_kmh": 38, "eta_minutes": 6},
    {"id": "RESP-BIKE-303", "name": "First Responder Bike Medic #07", "type": "FIRST_RESPONDER_BIKE", "vehicle_number": "KA-04-FR-1109", "driver_name": "Prashanth Kumar", "contact_number": "+91 97412 88765", "base_hospital": "Fortis Hospital Bannerghatta", "current_lat": 12.8980, "current_lng": 77.5920, "is_available": True, "speed_kmh": 55, "eta_minutes": 3},
    {"id": "RESP-ALS-104", "name": "St. John's Trauma Mobile ICU #03", "type": "TRAUMA_MOBILE_ICU", "vehicle_number": "KA-02-ICU-8822", "driver_name": "Anthony Das", "contact_number": "+91 94480 33119", "base_hospital": "St. John's Medical College Hospital", "current_lat": 12.9360, "current_lng": 77.6180, "is_available": True, "speed_kmh": 40, "eta_minutes": 8},
    {"id": "RESP-BLS-205", "name": "Kengeri BBMP Rescue Unit #09", "type": "BLS_AMBULANCE", "vehicle_number": "KA-41-EM-3301", "driver_name": "Manjunath B", "contact_number": "+91 99001 77621", "base_hospital": "BGS Gleneagles Global Hospital", "current_lat": 12.9015, "current_lng": 77.5090, "is_available": True, "speed_kmh": 45, "eta_minutes": 5},
]

_DEMO_USERS = [
    {"username": "admin", "password": "admin123", "role": "admin", "display_name": "RESQLINK Administrator", "hospital_id": None},
    {"username": "hospital", "password": "hospital123", "role": "hospital", "display_name": "KSSEM Hospital Control Room", "hospital_id": "HOSP-01"},
    {"username": "patient", "password": "patient123", "role": "patient", "display_name": "Ananya Sharma", "hospital_id": None},
]

_ADMISSIONS = [
    {"id": "ADM-2026-081", "alert_id": "INC-8812", "patient_name": "Kishore Kumar (58M)", "category": "CARDIAC", "urgency_level": "CRITICAL_RED", "arrived_at": "12:45 PM", "bed_assigned": "ICU Bed #04 (Cath Lab)", "doctor_in_charge": "Dr. Vivek Murthy (Cardiologist)", "status": "ADMITTED", "hospital_id": "HOSP-01"},
    {"id": "ADM-2026-079", "alert_id": "INC-8804", "patient_name": "Ravi Shankar (29M)", "category": "TRAUMA_ACCIDENT", "urgency_level": "HIGH_AMBER", "arrived_at": "11:20 AM", "bed_assigned": "ER Trauma Bay 2", "doctor_in_charge": "Dr. Preeti Gowda (Trauma Lead)", "status": "ADMITTED", "hospital_id": "HOSP-01"},
    {"id": "ADM-2026-074", "alert_id": "INC-8791", "patient_name": "Meenakshi Iyer (72F)", "category": "ELDERLY_FALL", "urgency_level": "MODERATE_YELLOW", "arrived_at": "09:15 AM", "bed_assigned": "Observation Bed 07", "doctor_in_charge": "Dr. Arvind Rao", "status": "DISCHARGED", "hospital_id": "HOSP-01"},
]

_PATIENT_PROFILE = {
    "username": "patient",
    "abha_id": "91-4521-8890-3312",
    "name": "Ananya Sharma",
    "age": 34,
    "gender": "Female",
    "blood_group": "O+ Positive",
    "allergies": ["Penicillin", "Sulfa Drugs"],
    "chronic_conditions": ["Mild Asthma", "Hypertension (Controlled)"],
    "current_medications": ["Salbutamol Inhaler (PRN)", "Amlodipine 5mg OD"],
    "emergency_contacts": [
        {"id": "EC-01", "name": "Dr. Rajesh Sharma", "relation": "Spouse / Next of Kin", "phone": "+91 98450 12345", "notifyOnSOS": True},
        {"id": "EC-02", "name": "Sunita Sharma", "relation": "Mother", "phone": "+91 94480 67890", "notifyOnSOS": True},
    ],
    "organ_donor": True,
    "preferred_hospital": "HOSP-01",
}


async def seed_database(session: AsyncSession) -> None:
    """Idempotent seed: only inserts rows that don't already exist."""

    # Users
    for u in _DEMO_USERS:
        existing = await session.get(User, u["username"])
        if not existing:
            session.add(User(
                username=u["username"],
                password_hash=hash_password(u["password"]),
                role=u["role"],
                display_name=u["display_name"],
                hospital_id=u["hospital_id"],
            ))

    # Hospitals + statuses
    for h in _HOSPITALS:
        existing = await session.get(Hospital, h["id"])
        if not existing:
            session.add(Hospital(**{k: v for k, v in h.items()}))
        status = await session.get(HospitalStatus, h["id"])
        if not status:
            session.add(HospitalStatus(
                hospital_id=h["id"],
                active_admissions_count=random.randint(3, 6),
            ))

    # Responders
    for r in _RESPONDERS:
        existing = await session.get(Responder, r["id"])
        if not existing:
            session.add(Responder(**{k: v for k, v in r.items()}))

    # Admissions
    for a in _ADMISSIONS:
        existing = await session.get(HospitalAdmission, a["id"])
        if not existing:
            session.add(HospitalAdmission(**{k: v for k, v in a.items()}))

    # Patient profile
    result = await session.execute(
        select(PatientProfile).where(PatientProfile.username == "patient")
    )
    if not result.scalar_one_or_none():
        session.add(PatientProfile(**{k: v for k, v in _PATIENT_PROFILE.items()}))

    await session.flush()
