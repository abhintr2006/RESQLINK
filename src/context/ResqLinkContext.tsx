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

export const ResqLinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    if (!authStorage.hasToken()) {
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
    const response = await api.login(username, password);
    setAuthUser(response.user);
    setUserRole(response.user.role);
    setAdminViewTab(response.user.role === 'admin' ? 'admin' : response.user.role);
    setSelectedHospitalId(response.user.hospitalId || 'HOSP-01');
    await hydrate();
  };

  const logout = async () => {
    await api.logout();
    setAuthUser(null);
    setActiveAlert(null);
    setAlertHistory([]);
    setAuditLogs([]);
  };

  const triggerSOS = async (category: EmergencyCategory = 'CARDIAC') => {
    setIsSimulating(true);
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
    } finally {
      setIsSimulating(false);
    }
  };

  const cancelSOS = (alertId: string) => {
    void api.cancelSos(alertId).then(async () => {
      setActiveAlert(null);
      await hydrate();
    }).catch((error) => console.error('Unable to cancel SOS', error));
  };

  const updateAlertStatus = (alertId: string, status: AlertStatus) => {
    void api.updateAlertStatus(alertId, status).then(async (updated) => {
      setActiveAlert(updated);
      setAlertHistory((previous) => previous.map((item) => item.id === alertId ? updated : item));
      await refreshAuditLogs(alertId);
    }).catch((error) => console.error('Unable to update alert status', error));
  };

  const simulateExternalIncident = () => {
    void api.simulateExternalIncident().then(async (alert) => {
      setAlertHistory((previous) => [alert, ...previous]);
      await refreshAuditLogs(alert.id);
    }).catch((error) => console.error('Unable to simulate external incident', error));
  };

  const updateHospitalBeds = (hospitalId: string, delta: number) => {
    void api.updateHospitalBeds(hospitalId, delta).then((updated) => {
      setHospitals((previous) => previous.map((hospital) => hospital.id === updated.id ? updated : hospital));
    }).catch((error) => console.error('Unable to update hospital beds', error));
  };

  const toggleHospitalOxygen = (hospitalId: string) => {
    void api.toggleHospitalOxygen(hospitalId).then((updated) => {
      setHospitals((previous) => previous.map((hospital) => hospital.id === updated.id ? updated : hospital));
    }).catch((error) => console.error('Unable to update hospital oxygen', error));
  };

  const toggleTraumaTeamStandby = (hospitalId: string) => {
    void api.toggleTraumaTeam(hospitalId).then((updated) => {
      setHospitalStatuses((previous) => ({ ...previous, [hospitalId]: updated }));
    }).catch((error) => console.error('Unable to update trauma team status', error));
  };

  const toggleEmergencyDivert = (hospitalId: string) => {
    void api.toggleEmergencyDivert(hospitalId).then((updated) => {
      setHospitalStatuses((previous) => ({ ...previous, [hospitalId]: updated }));
    }).catch((error) => console.error('Unable to update hospital divert status', error));
  };

  const acknowledgeHospitalInbound = (alertId: string) => {
    void api.acknowledgeHospitalInbound(alertId).then(() => refreshAuditLogs(alertId)).catch((error) => console.error('Unable to acknowledge inbound alert', error));
  };

  const prepareTraumaBay = (alertId: string) => {
    void api.prepareTraumaBay(alertId).then(() => refreshAuditLogs(alertId)).catch((error) => console.error('Unable to prepare trauma bay', error));
  };

  const updatePatientProfile = (updates: Partial<PatientMedicalProfile>) => {
    void api.updatePatientProfile(updates).then(setPatientProfile).catch((error) => console.error('Unable to update patient profile', error));
  };

  const resetAllData = () => {
    void api.reset().then(hydrate).catch((error) => console.error('Unable to reset RESQLINK data', error));
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
