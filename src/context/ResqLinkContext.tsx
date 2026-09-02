// React is supplied by the host application; keep this context usable when its
// type declarations are not available to the standalone TypeScript checker.
// @ts-ignore
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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
  PresetLocation,
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

import { api, authStorage, AuthUser } from '../services/api';

interface ResqLinkContextType {
  authUser: AuthUser | null;
  authLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  adminViewTab: 'admin' | 'hospital' | 'patient';
  setAdminViewTab: (tab: 'admin' | 'hospital' | 'patient') => void;
  selectedHospitalId: string;
  setSelectedHospitalId: (id: string) => void;

  activeAlert: EmergencyAlert | null;
  alertHistory: EmergencyAlert[];
  currentLocation: GeoCoordinate | null;
  selectedPreset: PresetLocation;
  networkTier: NetworkTier;
  language: LanguageCode;
  assistiveHighContrast: boolean;
  voiceGuidanceEnabled: boolean;
  responders: Responder[];
  hospitals: Hospital[];
  auditLogs: AuditLogEntry[];
  eegMetrics: EEGMetrics;
  isSimulating: boolean;

  hospitalStatuses: Record<string, HospitalEmergencyStatus>;
  hospitalAdmissions: HospitalAdmissionRecord[];
  updateHospitalBeds: (hospitalId: string, delta: number) => void;
  toggleHospitalOxygen: (hospitalId: string) => void;
  toggleTraumaTeamStandby: (hospitalId: string) => void;
  toggleEmergencyDivert: (hospitalId: string) => void;
  acknowledgeHospitalInbound: (alertId: string) => void;
  prepareTraumaBay: (alertId: string) => void;

  patientProfile: PatientMedicalProfile;
  updatePatientProfile: (profile: Partial<PatientMedicalProfile>) => void;

  triggerSOS: (category?: EmergencyCategory) => Promise<void>;
  cancelSOS: (alertId: string) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  setNetworkTier: (tier: NetworkTier) => void;
  setLanguage: (lang: LanguageCode) => void;
  setSelectedPreset: (preset: PresetLocation) => void;
  toggleHighContrast: () => void;
  toggleVoiceGuidance: () => void;
  simulateExternalIncident: () => void;
  resetAllData: () => void;
}

const ResqLinkContext = createContext<ResqLinkContextType | undefined>(undefined);

const initialStatuses = (): Record<string, HospitalEmergencyStatus> => {
  const statuses: Record<string, HospitalEmergencyStatus> = {};
  BENGALURU_HOSPITALS.forEach((hospital) => {
    statuses[hospital.id] = {
      hospitalId: hospital.id,
      emergencyDepartmentOpen: true,
      traumaTeamStandby: true,
      otReady: true,
      divertStatus: false,
      activeAdmissionsCount: 4,
    };
  });
  return statuses;
};

export const ResqLinkProvider = ({ children }: { children: React.ReactNode }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [adminViewTab, setAdminViewTab] = useState<'admin' | 'hospital' | 'patient'>('admin');
  const [selectedHospitalId, setSelectedHospitalId] = useState('HOSP-01');

  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(null);
  const [alertHistory, setAlertHistory] = useState<EmergencyAlert[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<PresetLocation>(BENGALURU_PRESET_LOCATIONS[0]);
  const [currentLocation, setCurrentLocation] = useState<GeoCoordinate | null>(null);
  const [networkTier, setNetworkTier] = useState<NetworkTier>('5G_HIGH_SPEED');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [assistiveHighContrast, setAssistiveHighContrast] = useState(false);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const [responders, setResponders] = useState<Responder[]>(INITIAL_RESPONDERS);
  const [hospitals, setHospitals] = useState<Hospital[]>(BENGALURU_HOSPITALS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [eegMetrics, setEegMetrics] = useState<EEGMetrics>(INITIAL_EEG_DATA);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hospitalStatuses, setHospitalStatuses] = useState<Record<string, HospitalEmergencyStatus>>(initialStatuses);
  const [hospitalAdmissions, setHospitalAdmissions] = useState<HospitalAdmissionRecord[]>(INITIAL_ADMISSION_RECORDS);
  const [patientProfile, setPatientProfile] = useState<PatientMedicalProfile>(INITIAL_PATIENT_PROFILE);

  const refreshAuditLogs = useCallback(async (alertId?: string) => {
    try {
      setAuditLogs(await api.auditLogs(alertId));
    } catch (error) {
      console.error('Unable to refresh RESQLINK audit logs', error);
    }
  }, []);

  const hydrate = useCallback(async () => {
    try {
      const data = await api.bootstrap();
      setActiveAlert(data.activeAlert);
      setAlertHistory(data.alertHistory);
      setCurrentLocation(data.currentLocation);
      setSelectedPreset(data.selectedPreset);
      setResponders(data.responders);
      setHospitals(data.hospitals);
      setAuditLogs(data.auditLogs);
      setEegMetrics(data.eegMetrics);
      setHospitalStatuses(data.hospitalStatuses);
      setHospitalAdmissions(data.hospitalAdmissions);
      setPatientProfile(data.patientProfile);
      setUserRole(data.userRole);
      setAdminViewTab(data.adminViewTab);
      setSelectedHospitalId(data.selectedHospitalId);
    } catch (error) {
      console.error('RESQLINK backend is unavailable; using local seed data until it starts', error);
    }
  }, []);

  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }

    // If it's a mock token, restore mock session immediately
    if (token.startsWith('mock_jwt_token_')) {
      const roleStr = token.replace('mock_jwt_token_', '') as UserRole;
      const role: UserRole = ['admin', 'hospital', 'patient'].includes(roleStr) ? roleStr : 'admin';
      const mockUser: AuthUser = {
        username: role,
        role,
        displayName: role === 'admin' ? 'Dr. Pavan (CAD Director)' : role === 'hospital' ? 'ER Trauma Lead' : 'Ananya Sharma',
        hospitalId: role === 'hospital' ? 'HOSP-01' : null,
      };
      setAuthUser(mockUser);
      setUserRole(role);
      setAdminViewTab(role === 'admin' ? 'admin' : role);
      setSelectedHospitalId(mockUser.hospitalId || 'HOSP-01');
      setAuthLoading(false);
      return;
    }

    void api.me().then((user) => {
      setAuthUser(user);
      return hydrate();
    }).catch(() => {
      authStorage.clear();
      setAuthUser(null);
    }).finally(() => setAuthLoading(false));
  }, [hydrate]);

  useEffect(() => {
    if (!currentLocation) {
      setCurrentLocation({
        latitude: selectedPreset.latitude,
        longitude: selectedPreset.longitude,
        accuracy: 15,
        timestamp: Date.now(),
        provider: 'MANUAL_PRESET',
      });
    }
  }, [currentLocation, selectedPreset]);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.login(username, password);
      setAuthUser(response.user);
      setUserRole(response.user.role);
      setAdminViewTab(response.user.role === 'admin' ? 'admin' : response.user.role);
      setSelectedHospitalId(response.user.hospitalId || 'HOSP-01');
      await hydrate();
    } catch (apiError) {
      // Offline fallback for demo prototype mode
      const normalized = username.trim().toLowerCase();
      let role: UserRole = 'admin';
      let displayName = 'System Administrator';
      let hospitalId = 'HOSP-01';

      if (normalized === 'hospital') {
        role = 'hospital';
        displayName = 'ER Trauma Lead (KSSEM)';
        hospitalId = 'HOSP-01';
      } else if (normalized === 'patient' || normalized === 'citizen') {
        role = 'patient';
        displayName = 'Ananya Sharma (Citizen)';
      } else if (normalized === 'admin') {
        role = 'admin';
        displayName = 'Dr. Pavan (CAD Director)';
      }

      const mockUser: AuthUser = {
        username: normalized,
        role,
        displayName,
        hospitalId: role === 'hospital' ? hospitalId : null,
      };

      authStorage.setToken(`mock_jwt_token_${role}`);
      setAuthUser(mockUser);
      setUserRole(role);
      setAdminViewTab(role === 'admin' ? 'admin' : role);
      setSelectedHospitalId(hospitalId);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Local fallback
    } finally {
      authStorage.clear();
      setAuthUser(null);
      setActiveAlert(null);
      setAlertHistory([]);
      setAuditLogs([]);
    }
  };

  const triggerSOS = async (category: EmergencyCategory = 'CARDIAC') => {
    setIsSimulating(true);
    try {
      try {
        const alert = await api.triggerSos({
          category,
          networkTier,
          language,
          selectedPreset,
          currentLocation,
        });
        setActiveAlert(alert);
        setAlertHistory((previous) => [alert, ...previous.filter((item) => item.id !== alert.id)]);
        setResponders((previous) => previous.map((responder) => responder.id === alert.assignedResponder?.id ? { ...responder, ...alert.assignedResponder, isAvailable: false, assignedIncidentId: alert.id } : responder));
        await refreshAuditLogs(alert.id);
        return;
      } catch {
        // Fallback local simulation
        const coord: GeoCoordinate = currentLocation || {
          latitude: selectedPreset.latitude,
          longitude: selectedPreset.longitude,
          accuracy: networkTier === '3G_SPOTTY' ? 30 : 8,
          timestamp: Date.now(),
          provider: 'GPS_HARDWARE',
        };

        const decision = AIDispatchEngine.computeOptimalDispatch(
          coord,
          category,
          selectedPreset.isPeripheral,
          responders
        );

        const alertId = `SOS-${Date.now().toString().slice(-4)}`;
        const localAlert: EmergencyAlert = {
          id: alertId,
          shortCode: `SOS-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
          timestamp: new Date().toISOString(),
          category,
          description: `Emergency reported in ${selectedPreset.ward}`,
          citizenName: patientProfile.name,
          citizenPhone: '+91 98450 12345',
          location: coord,
          locationLockState: {
            isLocked: true,
            samples: [],
            finalCoordinate: coord,
            confidenceScore: 98,
            lockDurationMs: 1100,
            attemptCount: 1,
          },
          status: 'CONFIRMED',
          statusTimestamps: {
            triggeredAt: new Date().toISOString(),
            confirmedAt: new Date().toISOString(),
          },
          networkUsed: networkTier,
          fallbackSMSUsed: networkTier === '2G_SMS_FALLBACK',
          assignedResponder: decision.matchedResponder,
          assignedHospital: decision.matchedHospital,
          estimatedArrivalMinutes: decision.estimatedArrivalMinutes,
          aiTriage: AIDispatchEngine.getAIFirstAidGuidance(category),
          equityMetadata: {
            deviceTier: networkTier === '2G_SMS_FALLBACK' ? 'FEATURE_2G' : 'SMARTPHONE',
            wardName: selectedPreset.ward,
            isPeripheralWard: selectedPreset.isPeripheral,
            userDemographic: 'GENERAL',
          },
        };

        setActiveAlert(localAlert);
        setAlertHistory((prev) => [localAlert, ...prev]);
        setResponders((prev) =>
          prev.map((r) =>
            r.id === decision.matchedResponder.id
              ? { ...r, isAvailable: false, assignedIncidentId: alertId }
              : r
          )
        );
        AuditLogger.logEvent(alertId, 'SOS_TRIGGERED', 'CITIZEN', {
          ward: selectedPreset.ward,
          category,
        });
        setAuditLogs(AuditLogger.getLogs());
      }
    } finally {
      setIsSimulating(false);
    }
  };

  const cancelSOS = (alertId: string) => {
    setActiveAlert(null);
    void api.cancelSos(alertId).then(async () => {
      await hydrate();
    }).catch(() => {});
  };

  const updateAlertStatus = (alertId: string, status: AlertStatus) => {
    setActiveAlert((prev) => (prev && prev.id === alertId ? { ...prev, status } : prev));
    setAlertHistory((prev) => prev.map((item) => (item.id === alertId ? { ...item, status } : item)));
    void api.updateAlertStatus(alertId, status).then(async (updated) => {
      setActiveAlert(updated);
      setAlertHistory((previous) => previous.map((item) => item.id === alertId ? updated : item));
      await refreshAuditLogs(alertId);
    }).catch(() => {});
  };


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
    void api.simulateExternalIncident().then(async (alert) => {
      setAlertHistory((previous) => [alert, ...previous]);
      await refreshAuditLogs(alert.id);
    }).catch((error) => console.error('Unable to simulate external incident', error));
  };

  const updateHospitalBeds = (hospitalId: string, delta: number) => {
    setHospitals((previous) =>
      previous.map((hospital) =>
        hospital.id === hospitalId
          ? { ...hospital, icuBedsAvailable: Math.max(0, hospital.icuBedsAvailable + delta) }
          : hospital
      )
    );
    void api.updateHospitalBeds(hospitalId, delta).then((updated) => {
      setHospitals((previous) => previous.map((hospital) => hospital.id === updated.id ? updated : hospital));
    }).catch(() => {});
  };

  const toggleHospitalOxygen = (hospitalId: string) => {
    setHospitals((previous) =>
      previous.map((hospital) =>
        hospital.id === hospitalId
          ? { ...hospital, oxygenAvailable: !hospital.oxygenAvailable }
          : hospital
      )
    );
    void api.toggleHospitalOxygen(hospitalId).then((updated) => {
      setHospitals((previous) => previous.map((hospital) => hospital.id === updated.id ? updated : hospital));
    }).catch(() => {});
  };

  const toggleTraumaTeamStandby = (hospitalId: string) => {
    setHospitalStatuses((previous) => ({
      ...previous,
      [hospitalId]: {
        ...(previous[hospitalId] || { hospitalId, emergencyDepartmentOpen: true, traumaTeamStandby: false, otReady: true, divertStatus: false, activeAdmissionsCount: 4 }),
        traumaTeamStandby: !previous[hospitalId]?.traumaTeamStandby,
      },
    }));
    void api.toggleTraumaTeam(hospitalId).then((updated) => {
      setHospitalStatuses((previous) => ({ ...previous, [hospitalId]: updated }));
    }).catch(() => {});
  };

  const toggleEmergencyDivert = (hospitalId: string) => {
    setHospitalStatuses((previous) => ({
      ...previous,
      [hospitalId]: {
        ...(previous[hospitalId] || { hospitalId, emergencyDepartmentOpen: true, traumaTeamStandby: true, otReady: true, divertStatus: false, activeAdmissionsCount: 4 }),
        divertStatus: !previous[hospitalId]?.divertStatus,
      },
    }));
    void api.toggleEmergencyDivert(hospitalId).then((updated) => {
      setHospitalStatuses((previous) => ({ ...previous, [hospitalId]: updated }));
    }).catch(() => {});
  };

  const acknowledgeHospitalInbound = (alertId: string) => {
    void api.acknowledgeHospitalInbound(alertId).then(() => refreshAuditLogs(alertId)).catch(() => {});
  };

  const prepareTraumaBay = (alertId: string) => {
    void api.prepareTraumaBay(alertId).then(() => refreshAuditLogs(alertId)).catch(() => {});
  };

  const updatePatientProfile = (updates: Partial<PatientMedicalProfile>) => {
    setPatientProfile((previous) => ({ ...previous, ...updates }));
    void api.updatePatientProfile(updates).then(setPatientProfile).catch(() => {});
  };

  const resetAllData = () => {
    setActiveAlert(null);
    setAlertHistory([]);
    setResponders(INITIAL_RESPONDERS);
    setHospitals(BENGALURU_HOSPITALS);
    setHospitalStatuses(initialStatuses());
    setPatientProfile(INITIAL_PATIENT_PROFILE);
    void api.reset().then(hydrate).catch(() => {});
  };

  return (
    <ResqLinkContext.Provider value={{
      authUser,
      authLoading,
      login,
      logout,
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
      toggleHighContrast: () => setAssistiveHighContrast((previous) => !previous),
      toggleVoiceGuidance: () => setVoiceGuidanceEnabled((previous) => !previous),
      simulateExternalIncident,
      resetAllData,
    }}>
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
