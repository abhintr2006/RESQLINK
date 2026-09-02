export type EmergencyCategory = 
  | 'CARDIAC' 
  | 'TRAUMA_ACCIDENT' 
  | 'STROKE' 
  | 'RESPIRATORY' 
  | 'ELDERLY_FALL' 
  | 'MATERNAL_CRITICAL' 
  | 'GENERAL_MEDICAL';

export type AlertStatus = 
  | 'IDLE'
  | 'ACQUIRING_LOCATION'
  | 'LOCATION_LOCKED'
  | 'ALERTING'
  | 'CONFIRMED'
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ON_SCENE'
  | 'RESOLVED'
  | 'CANCELLED';

export type NetworkTier = '5G_HIGH_SPEED' | '3G_SPOTTY' | '2G_SMS_FALLBACK';

export type LanguageCode =
  | 'en' // English
  | 'kn' // Kannada (ಕನ್ನಡ)
  | 'hi' // Hindi (हिन्दी)
  | 'ta' // Tamil (தமிழ்)
  | 'te' // Telugu (తెలుగు)
  | 'ml' // Malayalam (മലയാളം)
  | 'mr' // Marathi (मराठी)
  | 'bn' // Bengali (বাংলা)
  | 'gu' // Gujarati (ગુજરાતી)
  | 'pa' // Punjabi (ਪੰਜਾਬੀ)
  | 'or' // Odia (ଓଡ଼ିଆ)
  | 'as' // Assamese (অসমীয়া)
  | 'ur' // Urdu (اردو)
  | 'sa' // Sanskrit (संस्कृतम्)
  | 'kok' // Konkani (कोंकणी)
  | 'mai' // Maithili (मैथिली)
  | 'doi' // Dogri (डोगरी)
  | 'ks' // Kashmiri (کٲشُر / कश्मीरी)
  | 'ne' // Nepali (नेपाली)
  | 'sd' // Sindhi (سنڌي / सिन्धी)
  | 'sat' // Santhali (ᱥᱟᱱᱛᱟᱲᱤ)
  | 'brx' // Bodo (बड़ो)
  | 'mni'; // Manipuri (মৈতৈলোন্)

export interface PresetLocation {
  name: string;
  ward: string;
  latitude: number;
  longitude: number;
  isPeripheral: boolean;
  pincode: string;
}

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters
  timestamp: number;
  provider: 'GPS_HARDWARE' | 'CELL_TRIANGULATION' | 'WIFI_NETWORK' | 'MANUAL_PRESET';
}

export interface LocationLockSample {
  sampleIndex: number;
  coordinate: GeoCoordinate;
  deltaFromPrevious?: number; // in meters
  passedConsistency: boolean;
  timeAcquired: string;
}

export interface LocationLockState {
  isLocked: boolean;
  samples: LocationLockSample[];
  finalCoordinate: GeoCoordinate | null;
  confidenceScore: number; // 0 to 100%
  lockDurationMs: number;
  attemptCount: number;
}

export interface Responder {
  id: string;
  name: string;
  type: 'ALS_AMBULANCE' | 'BLS_AMBULANCE' | 'FIRST_RESPONDER_BIKE' | 'TRAUMA_MOBILE_ICU';
  vehicleNumber: string;
  driverName: string;
  contactNumber: string;
  baseHospital: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  isAvailable: boolean;
  assignedIncidentId?: string;
  speedKmh: number;
  etaMinutes: number;
}

export interface Hospital {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
  traumaLevel: 1 | 2 | 3;
  icuBedsAvailable: number;
  oxygenAvailable: boolean;
  contactNumber: string;
}

export interface EmergencyAlert {
  id: string;
  shortCode: string;
  timestamp: string;
  category: EmergencyCategory;
  description: string;
  citizenName?: string;
  citizenPhone?: string;
  location: GeoCoordinate;
  locationLockState: LocationLockState;
  status: AlertStatus;
  statusTimestamps: {
    triggeredAt: string;
    lockedAt?: string;
    confirmedAt?: string;
    dispatchedAt?: string;
    enRouteAt?: string;
    onSceneAt?: string;
    resolvedAt?: string;
  };
  networkUsed: NetworkTier;
  fallbackSMSUsed: boolean;
  smsPayloadRaw?: string;
  assignedResponder?: Responder;
  assignedHospital?: Hospital;
  estimatedArrivalMinutes: number;
  aiTriage: {
    urgencyLevel: 'CRITICAL_RED' | 'HIGH_AMBER' | 'MODERATE_YELLOW';
    triageScore: number; // 1-100
    suggestedALS: boolean;
    firstAidInstructions: string[];
    speechSummary: Record<string, string>;

  };
  equityMetadata: {
    deviceTier: 'SMARTPHONE' | 'FEATURE_2G';
    wardName: string;
    isPeripheralWard: boolean;
    userDemographic: 'ELDERLY' | 'DIFFERENTLY_ABLED' | 'GENERAL' | 'LOW_LITERACY';
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  alertId: string;
  event: 
    | 'SOS_TRIGGERED'
    | 'GPS_SAMPLE_ACQUIRED'
    | 'LOCATION_LOCK_VERIFIED'
    | 'LOCATION_FALLBACK_TRIGGERED'
    | 'AI_TRIAGE_COMPUTED'
    | 'RESPONDER_ALLOCATED'
    | 'SMS_FALLBACK_DISPATCHED'
    | 'SMS_DELIVERY_CONFIRMED'
    | 'STATUS_UPDATED'
    | 'CONSENT_GRANTED'
    | 'INCIDENT_RESOLVED';
  actor: 'CITIZEN' | 'GEOLOCATION_ENGINE' | 'AI_DISPATCH_ENGINE' | 'TWILIO_GATEWAY' | 'DISPATCHER_CAD' | 'RESPONDER_CREW';
  details: Record<string, any>;
  dataMinimizationVerified: boolean;
  cryptographicHash: string;
}

export interface EEGMetrics {
  equity: {
    accessParity2Gvs5G: { rate2G: number; rate5G: number };
    peripheralWardCoverageRate: number;
    multiLanguageUsagePct: { en: number; kn: number; hi: number };
    vulnerableUserSuccessRate: number;
    affordabilityAvgCostRs: number;
  };
  efficacy: {
    avgSosToConfirmSeconds: number;
    traditionalCadComparisonSeconds: number;
    gpsAcquisitionMeanSeconds: number;
    falseDispatchRejectionRatePct: number;
    smsFallbackDeliverySuccessPct: number;
    totalIncidentsHandled: number;
  };
  governance: {
    dpdpConsentCompliancePct: number;
    auditTrailCompletenessPct: number;
    algorithmicBiasAuditScorePct: number;
    institutionalAccountabilityMapped: boolean;
  };
}

export type UserRole = 'admin' | 'hospital' | 'patient';

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  notifyOnSOS: boolean;
}

export interface PatientMedicalProfile {
  abhaId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContacts: EmergencyContact[];
  organDonor: boolean;
  preferredHospital?: string;
}

export interface HospitalEmergencyStatus {
  hospitalId: string;
  emergencyDepartmentOpen: boolean;
  traumaTeamStandby: boolean;
  otReady: boolean;
  divertStatus: boolean; // if true, ER is diverting due to overload
  activeAdmissionsCount: number;
}

export interface HospitalAdmissionRecord {
  id: string;
  alertId: string;
  patientName: string;
  category: EmergencyCategory;
  urgencyLevel: 'CRITICAL_RED' | 'HIGH_AMBER' | 'MODERATE_YELLOW';
  arrivedAt: string;
  bedAssigned: string;
  doctorInCharge: string;
  status: 'IN_TRANSIT' | 'BAY_PREPPED' | 'ADMITTED' | 'DISCHARGED';
}

