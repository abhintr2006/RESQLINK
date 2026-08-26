import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  EmergencyAlert,
  EmergencyCategory,
  GeoCoordinate,
  NetworkTier,
  LanguageCode,
  Responder,
  Hospital,
  AuditLogEntry,
  EEGMetrics,
  LocationLockState,
  AlertStatus,
  UserRole,
  PatientMedicalProfile,
  HospitalEmergencyStatus,
  HospitalAdmissionRecord,
} from '../types';
import {
  BENGALURU_HOSPITALS,
  INITIAL_RESPONDERS,
  BENGALURU_PRESET_LOCATIONS,
  INITIAL_EEG_DATA,
  INITIAL_PATIENT_PROFILE,
  INITIAL_ADMISSION_RECORDS,
} from '../data/bengaluruData';
import { LocationLockService } from '../services/locationLockService';
import { AIDispatchEngine } from '../services/aiDispatchEngine';
import { TwilioSmsService } from '../services/twilioSmsService';
import { AuditLogger } from '../services/auditLogger';
import { audioService } from '../services/audioService';
import { secureRandomInt, secureRandomFloat } from '../utils/secureRandom';


interface ResqLinkContextType {
  // Role & Dashboard switching
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  adminViewTab: 'admin' | 'hospital' | 'patient';
  setAdminViewTab: (tab: 'admin' | 'hospital' | 'patient') => void;
  selectedHospitalId: string;
  setSelectedHospitalId: (id: string) => void;

  activeAlert: EmergencyAlert | null;
  alertHistory: EmergencyAlert[];
  currentLocation: GeoCoordinate | null;
  selectedPreset: (typeof BENGALURU_PRESET_LOCATIONS)[0];
  networkTier: NetworkTier;
  language: LanguageCode;
  assistiveHighContrast: boolean;
  voiceGuidanceEnabled: boolean;
  responders: Responder[];
  hospitals: Hospital[];
  auditLogs: AuditLogEntry[];
  eegMetrics: EEGMetrics;
  isSimulating: boolean;

  // Hospital management state & actions
  hospitalStatuses: Record<string, HospitalEmergencyStatus>;
  hospitalAdmissions: HospitalAdmissionRecord[];
  updateHospitalBeds: (hospitalId: string, delta: number) => void;
  toggleHospitalOxygen: (hospitalId: string) => void;
  toggleTraumaTeamStandby: (hospitalId: string) => void;
  toggleEmergencyDivert: (hospitalId: string) => void;
  acknowledgeHospitalInbound: (alertId: string) => void;
  prepareTraumaBay: (alertId: string) => void;

  // Patient profile state & actions
  patientProfile: PatientMedicalProfile;
  updatePatientProfile: (profile: Partial<PatientMedicalProfile>) => void;

  // Actions
  triggerSOS: (category?: EmergencyCategory) => Promise<void>;
  cancelSOS: (alertId: string) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  setNetworkTier: (tier: NetworkTier) => void;
  setLanguage: (lang: LanguageCode) => void;
  setSelectedPreset: (preset: (typeof BENGALURU_PRESET_LOCATIONS)[0]) => void;
  toggleHighContrast: () => void;
  toggleVoiceGuidance: () => void;
  simulateExternalIncident: () => void;
  resetAllData: () => void;
}

const ResqLinkContext = createContext<ResqLinkContextType | undefined>(undefined);

export const ResqLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [adminViewTab, setAdminViewTab] = useState<'admin' | 'hospital' | 'patient'>('admin');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('HOSP-01');

  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [alertHistory, setAlertHistory] = useState<EmergencyAlert[]>([]);
  const [selectedPreset, setSelectedPreset] = useState(BENGALURU_PRESET_LOCATIONS[0]);
  const [currentLocation, setCurrentLocation] = useState<GeoCoordinate | null>(null);
  const [networkTier, setNetworkTier] = useState<NetworkTier>('5G_HIGH_SPEED');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [assistiveHighContrast, setAssistiveHighContrast] = useState<boolean>(false);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState<boolean>(true);
  const [responders, setResponders] = useState<Responder[]>(INITIAL_RESPONDERS);
  const [hospitals, setHospitals] = useState<Hospital[]>(BENGALURU_HOSPITALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [eegMetrics, setEegMetrics] = useState<EEGMetrics>(INITIAL_EEG_DATA);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Hospital management state
  const [hospitalStatuses, setHospitalStatuses] = useState<Record<string, HospitalEmergencyStatus>>(() => {
    const init: Record<string, HospitalEmergencyStatus> = {};
    BENGALURU_HOSPITALS.forEach((h) => {
      init[h.id] = {
        hospitalId: h.id,
        emergencyDepartmentOpen: true,
        traumaTeamStandby: true,
        otReady: true,
        divertStatus: false,
        activeAdmissionsCount: Math.floor(Math.random() * 4) + 3,
      };
    });
    return init;
  });

  const [hospitalAdmissions, setHospitalAdmissions] = useState<HospitalAdmissionRecord[]>(INITIAL_ADMISSION_RECORDS);

  // Patient Profile state
  const [patientProfile, setPatientProfile] = useState<PatientMedicalProfile>(INITIAL_PATIENT_PROFILE);


  // Initialize initial geolocation
  useEffect(() => {
    LocationLockService.acquireCoordinate(selectedPreset, networkTier === '3G_SPOTTY').then(
      (coord) => {
        setCurrentLocation(coord);
      }
    );
  }, [selectedPreset, networkTier]);

  // Sync audit logs periodically
  const refreshAuditLogs = useCallback(() => {
    setAuditLogs(AuditLogger.getLogs());
  }, []);

  // Moving ambulance simulation when activeAlert is DISPATCHED or EN_ROUTE
  useEffect(() => {
    if (!activeAlert || (activeAlert.status !== 'DISPATCHED' && activeAlert.status !== 'EN_ROUTE')) {
      return;
    }

    const interval = setInterval(() => {
      setResponders((prevList) =>
        prevList.map((resp) => {
          if (resp.id !== activeAlert.assignedResponder?.id) return resp;

          // Interpolate closer to citizen location
          const targetLat = activeAlert.location.latitude;
          const targetLng = activeAlert.location.longitude;
          const currentLat = resp.currentLocation.latitude;
          const currentLng = resp.currentLocation.longitude;

          const stepLat = (targetLat - currentLat) * 0.15;
          const stepLng = (targetLng - currentLng) * 0.15;

          const remainingEta = Math.max(1, resp.etaMinutes - 1);

          return {
            ...resp,
            currentLocation: {
              latitude: currentLat + stepLat,
              longitude: currentLng + stepLng,
            },
            etaMinutes: remainingEta,
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [activeAlert]);

  // Main 1-Tap SOS Execution Flow according to paper Section 3.3 & 4.1
  const triggerSOS = async (category: EmergencyCategory = 'CARDIAC') => {
    setIsSimulating(true);
    const alertId = `BLR-${Math.floor(1000 + Math.random() * 9000)}`;
    const shortCode = `RQ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const startTime = new Date().toISOString();

    // 1. Audio tone and immediate voice announcement
    audioService.playEmergencyAlertTone();
    if (voiceGuidanceEnabled) {
      const guidance = AIDispatchEngine.getAIFirstAidGuidance(category);
      audioService.speak(guidance.speechSummary[language], language);
    }

    // 2. Audit Log: SOS Triggered
    AuditLogger.logEvent(alertId, 'SOS_TRIGGERED', 'CITIZEN', {
      category,
      networkTier,
      ward: selectedPreset.ward,
      language,
    });

    // Initial alert object in ACQUIRING_LOCATION state
    const initialLockState: LocationLockState = {
      isLocked: false,
      samples: [],
      finalCoordinate: null,
      confidenceScore: 40,
      lockDurationMs: 0,
      attemptCount: 1,
    };

    const initialAlert: EmergencyAlert = {
      id: alertId,
      shortCode,
      timestamp: startTime,
      category,
      description: `Immediate emergency assistance requested at ${selectedPreset.name}`,
      citizenName: 'Pavan Kumar (KSSEM Citizen Pilot)',
      citizenPhone: '+91 98450 99881',
      location: currentLocation || {
        latitude: selectedPreset.latitude,
        longitude: selectedPreset.longitude,
        accuracy: 15,
        timestamp: Date.now(),
        provider: 'GPS_HARDWARE',
      },
      locationLockState: initialLockState,
      status: 'ACQUIRING_LOCATION',
      statusTimestamps: {
        triggeredAt: startTime,
      },
      networkUsed: networkTier,
      fallbackSMSUsed: networkTier === '2G_SMS_FALLBACK',
      estimatedArrivalMinutes: 5,
      aiTriage: AIDispatchEngine.getAIFirstAidGuidance(category),
      equityMetadata: {
        deviceTier: networkTier === '2G_SMS_FALLBACK' ? 'FEATURE_2G' : 'SMARTPHONE',
        wardName: selectedPreset.ward,
        isPeripheralWard: selectedPreset.isPeripheral,
        userDemographic: 'GENERAL',
      },
    };

    setActiveAlert(initialAlert);
    refreshAuditLogs();

    // 3. Location-Lock Protocol: Acquire Sample 1
    const sample1Coord = await LocationLockService.acquireCoordinate(
      selectedPreset,
      networkTier === '3G_SPOTTY'
    );
    const lockPass1 = LocationLockService.processSample([], sample1Coord);

    AuditLogger.logEvent(alertId, 'GPS_SAMPLE_ACQUIRED', 'GEOLOCATION_ENGINE', {
      sampleIndex: 1,
      lat: sample1Coord.latitude,
      lng: sample1Coord.longitude,
      accuracy: sample1Coord.accuracy,
      provider: sample1Coord.provider,
    });

    // Wait a brief 600ms to simulate dual-read temporal consistency
    await new Promise((r) => setTimeout(r, 600));

    // 4. Location-Lock Protocol: Acquire Sample 2
    const sample2Coord = await LocationLockService.acquireCoordinate(
      selectedPreset,
      networkTier === '3G_SPOTTY'
    );
    const lockPass2 = LocationLockService.processSample(lockPass1.samples, sample2Coord);

    audioService.playLockConfirmationChime();

    AuditLogger.logEvent(alertId, 'LOCATION_LOCK_VERIFIED', 'GEOLOCATION_ENGINE', {
      sampleCount: lockPass2.samples.length,
      finalAccuracyMeters: sample2Coord.accuracy,
      confidenceScore: lockPass2.confidenceScore,
      consistencyPassed: lockPass2.isLocked,
    });

    const lockedLocation = lockPass2.finalCoordinate || sample2Coord;

    // 5. AI-Assisted Dispatch Engine matching
    const dispatchDecision = AIDispatchEngine.computeOptimalDispatch(
      lockedLocation,
      category,
      selectedPreset.isPeripheral,
      responders
    );

    AuditLogger.logEvent(alertId, 'AI_TRIAGE_COMPUTED', 'AI_DISPATCH_ENGINE', {
      triageScore: dispatchDecision.triageScore,
      urgencyLevel: dispatchDecision.urgencyLevel,
      suggestedALS: dispatchDecision.suggestedALS,
      aiRationale: dispatchDecision.aiRationale,
    });

    AuditLogger.logEvent(alertId, 'RESPONDER_ALLOCATED', 'AI_DISPATCH_ENGINE', {
      responderId: dispatchDecision.matchedResponder.id,
      responderName: dispatchDecision.matchedResponder.name,
      etaMinutes: dispatchDecision.estimatedArrivalMinutes,
      hospital: dispatchDecision.matchedHospital.name,
    });

    // 6. If 2G / Offline Mode: Trigger Twilio SMS Fallback
    let rawSmsString: string | undefined = undefined;
    if (networkTier === '2G_SMS_FALLBACK') {
      const smsResult = await TwilioSmsService.sendEmergencySmsFallback(
        alertId,
        lockedLocation,
        category
      );
      rawSmsString = smsResult.body;

      AuditLogger.logEvent(alertId, 'SMS_FALLBACK_DISPATCHED', 'TWILIO_GATEWAY', {
        messageSid: smsResult.messageSid,
        rawPayload: smsResult.body,
        latencyMs: smsResult.carrierLatencyMs,
        status: smsResult.status,
      });
    }

    const lockedTime = new Date().toISOString();

    const fullyDispatchedAlert: EmergencyAlert = {
      ...initialAlert,
      location: lockedLocation,
      locationLockState: {
        isLocked: true,
        samples: lockPass2.samples,
        finalCoordinate: lockedLocation,
        confidenceScore: lockPass2.confidenceScore,
        lockDurationMs: 1450,
        attemptCount: 2,
      },
      status: 'DISPATCHED',
      statusTimestamps: {
        ...initialAlert.statusTimestamps,
        lockedAt: lockedTime,
        confirmedAt: lockedTime,
        dispatchedAt: lockedTime,
      },
      assignedResponder: dispatchDecision.matchedResponder,
      assignedHospital: dispatchDecision.matchedHospital,
      estimatedArrivalMinutes: dispatchDecision.estimatedArrivalMinutes,
      smsPayloadRaw: rawSmsString,
    };

    setActiveAlert(fullyDispatchedAlert);
    setAlertHistory((prev) => [fullyDispatchedAlert, ...prev]);

    // Mark responder as busy
    setResponders((prev) =>
      prev.map((r) =>
        r.id === dispatchDecision.matchedResponder.id
          ? {
              ...r,
              isAvailable: false,
              assignedIncidentId: alertId,
              etaMinutes: dispatchDecision.estimatedArrivalMinutes,
            }
          : r
      )
    );

    // Update EEG aggregate metrics
    setEegMetrics((prev) => ({
      ...prev,
      efficacy: {
        ...prev.efficacy,
        totalIncidentsHandled: prev.efficacy.totalIncidentsHandled + 1,
      },
    }));

    setIsSimulating(false);
    refreshAuditLogs();
  };

  const cancelSOS = (alertId: string) => {
    AuditLogger.logEvent(alertId, 'INCIDENT_RESOLVED', 'CITIZEN', {
      action: 'CANCELLED_BY_USER',
      reason: 'TEST_COMPLETED_OR_FALSE_ALARM',
    });

    if (activeAlert?.assignedResponder) {
      setResponders((prev) =>
        prev.map((r) =>
          r.id === activeAlert.assignedResponder?.id
            ? { ...r, isAvailable: true, assignedIncidentId: undefined }
            : r
        )
      );
    }

    setActiveAlert(null);
    audioService.stopSpeaking();
    refreshAuditLogs();
  };

  const updateAlertStatus = (alertId: string, newStatus: AlertStatus) => {
    setActiveAlert((prev) => {
      if (!prev || prev.id !== alertId) return prev;
      return {
        ...prev,
        status: newStatus,
        statusTimestamps: {
          ...prev.statusTimestamps,
          [`${newStatus.toLowerCase()}At`]: new Date().toISOString(),
        },
      };
    });

    AuditLogger.logEvent(alertId, 'STATUS_UPDATED', 'DISPATCHER_CAD', {
      newStatus,
      timestamp: new Date().toISOString(),
    });
    refreshAuditLogs();
  };

  // Simulate an external incident arriving from anywhere in Bengaluru (for testing CAD portal)
  const simulateExternalIncident = () => {
    const randomPreset =
      BENGALURU_PRESET_LOCATIONS[
        Math.floor(Math.random() * BENGALURU_PRESET_LOCATIONS.length)
      ];
    const categories: EmergencyCategory[] = [
      'TRAUMA_ACCIDENT',
      'CARDIAC',
      'STROKE',
      'RESPIRATORY',
      'ELDERLY_FALL',
    ];
    // Use bias-free CSPRNG helpers (rejection sampling for int, 53-bit mantissa for float)
    const category = categories[secureRandomInt(categories.length)];
    const alertId = `EXT-${2000 + secureRandomInt(8000)}`;

    const coord: GeoCoordinate = {
      latitude: randomPreset.latitude + (secureRandomFloat() - 0.5) * 0.01,
      longitude: randomPreset.longitude + (secureRandomFloat() - 0.5) * 0.01,
      accuracy: 10,
      timestamp: Date.now(),
      provider: 'GPS_HARDWARE',
    };

    const decision = AIDispatchEngine.computeOptimalDispatch(
      coord,
      category,
      randomPreset.isPeripheral,
      responders
    );

    const newAlert: EmergencyAlert = {
      id: alertId,
      shortCode: `EXT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      category,
      description: `Emergency reported in ${randomPreset.ward}`,
      citizenName: 'Bengaluru Citizen',
      citizenPhone: '+91 99887 66554',
      location: coord,
      locationLockState: {
        isLocked: true,
        samples: [],
        finalCoordinate: coord,
        confidenceScore: 94,
        lockDurationMs: 1200,
        attemptCount: 2,
      },
      status: 'CONFIRMED',
      statusTimestamps: {
        triggeredAt: new Date().toISOString(),
        confirmedAt: new Date().toISOString(),
      },
      networkUsed: Math.random() > 0.3 ? '5G_HIGH_SPEED' : '2G_SMS_FALLBACK',
      fallbackSMSUsed: Math.random() > 0.7,
      assignedResponder: decision.matchedResponder,
      assignedHospital: decision.matchedHospital,
      estimatedArrivalMinutes: decision.estimatedArrivalMinutes,
      aiTriage: AIDispatchEngine.getAIFirstAidGuidance(category),
      equityMetadata: {
        deviceTier: 'SMARTPHONE',
        wardName: randomPreset.ward,
        isPeripheralWard: randomPreset.isPeripheral,
        userDemographic: 'GENERAL',
      },
    };

    setAlertHistory((prev) => [newAlert, ...prev]);
    AuditLogger.logEvent(alertId, 'SOS_TRIGGERED', 'CITIZEN', {
      simulated: true,
      ward: randomPreset.ward,
      category,
    });
    refreshAuditLogs();
  };

  // Hospital actions
  const updateHospitalBeds = (hospitalId: string, delta: number) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id !== hospitalId) return h;
        const newBeds = Math.max(0, h.icuBedsAvailable + delta);
        return { ...h, icuBedsAvailable: newBeds };
      })
    );
  };

  const toggleHospitalOxygen = (hospitalId: string) => {
    setHospitals((prev) =>
      prev.map((h) => {
        if (h.id !== hospitalId) return h;
        return { ...h, oxygenAvailable: !h.oxygenAvailable };
      })
    );
  };

  const toggleTraumaTeamStandby = (hospitalId: string) => {
    setHospitalStatuses((prev) => {
      const current = prev[hospitalId] || {
        hospitalId,
        emergencyDepartmentOpen: true,
        traumaTeamStandby: true,
        otReady: true,
        divertStatus: false,
        activeAdmissionsCount: 4,
      };
      return {
        ...prev,
        [hospitalId]: {
          ...current,
          traumaTeamStandby: !current.traumaTeamStandby,
        },
      };
    });
  };

  const toggleEmergencyDivert = (hospitalId: string) => {
    setHospitalStatuses((prev) => {
      const current = prev[hospitalId] || {
        hospitalId,
        emergencyDepartmentOpen: true,
        traumaTeamStandby: true,
        otReady: true,
        divertStatus: false,
        activeAdmissionsCount: 4,
      };
      return {
        ...prev,
        [hospitalId]: {
          ...current,
          divertStatus: !current.divertStatus,
        },
      };
    });
  };

  const acknowledgeHospitalInbound = (alertId: string) => {
    AuditLogger.logEvent(alertId, 'STATUS_UPDATED', 'DISPATCHER_CAD', {
      action: 'HOSPITAL_ACKNOWLEDGED',
      note: 'Hospital ER team acknowledged incoming transport',
    });
    refreshAuditLogs();
  };

  const prepareTraumaBay = (alertId: string) => {
    AuditLogger.logEvent(alertId, 'STATUS_UPDATED', 'DISPATCHER_CAD', {
      action: 'TRAUMA_BAY_PREPPED',
      note: 'Emergency Trauma Bay prepped and life-support ready',
    });
    refreshAuditLogs();
  };

  // Patient profile actions
  const updatePatientProfile = (updates: Partial<PatientMedicalProfile>) => {
    setPatientProfile((prev) => ({ ...prev, ...updates }));
  };

  const resetAllData = () => {
    setActiveAlert(null);
    setAlertHistory([]);
    setResponders(INITIAL_RESPONDERS);
    AuditLogger.clearLogs();
    setAuditLogs([]);
  };

  return (
    <ResqLinkContext.Provider
      value={{
        userRole,
        setUserRole,
        adminViewTab,
        setAdminViewTab,
        selectedHospitalId,
        setSelectedHospitalId,
        activeAlert,
        alertHistory,
        currentLocation,
        selectedPreset,
        networkTier,
        language,
        assistiveHighContrast,
        voiceGuidanceEnabled,
        responders,
        hospitals,
        auditLogs,
        eegMetrics,
        isSimulating,
        hospitalStatuses,
        hospitalAdmissions,
        updateHospitalBeds,
        toggleHospitalOxygen,
        toggleTraumaTeamStandby,
        toggleEmergencyDivert,
        acknowledgeHospitalInbound,
        prepareTraumaBay,
        patientProfile,
        updatePatientProfile,
        triggerSOS,
        cancelSOS,
        updateAlertStatus,
        setNetworkTier,
        setLanguage,
        setSelectedPreset,
        toggleHighContrast: () => setAssistiveHighContrast((p) => !p),
        toggleVoiceGuidance: () => setVoiceGuidanceEnabled((p) => !p),
        simulateExternalIncident,
        resetAllData,
      }}
    >
      {children}
    </ResqLinkContext.Provider>
  );
};


export const useResqLink = () => {
  const context = useContext(ResqLinkContext);
  if (!context) {
    throw new Error('useResqLink must be used within a ResqLinkProvider');
  }
  return context;
};
