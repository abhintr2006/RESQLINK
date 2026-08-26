import {
  AlertStatus,
  EmergencyAlert,
  EmergencyCategory,
  Hospital,
  HospitalEmergencyStatus,
  PatientMedicalProfile,
  NetworkTier,
  LanguageCode,
  PresetLocation,
  Responder,
  AuditLogEntry,
  EEGMetrics,
  HospitalAdmissionRecord,
  GeoCoordinate,
  UserRole,
} from '../types';

export interface AuthUser {
  username: string;
  role: UserRole;
  displayName: string;
  hospitalId?: string | null;
}

interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: AuthUser;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');
const TOKEN_STORAGE_KEY = 'resqlink_access_token';

export const authStorage = {
  getToken: () => window.localStorage.getItem(TOKEN_STORAGE_KEY),
  setToken: (token: string) => window.localStorage.setItem(TOKEN_STORAGE_KEY, token),
  hasToken: () => Boolean(window.localStorage.getItem(TOKEN_STORAGE_KEY)),
  clear: () => window.localStorage.removeItem(TOKEN_STORAGE_KEY),
};

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = authStorage.getToken();
  const headers = new Headers(options?.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && !path.startsWith('/auth/login')) {
    authStorage.clear();
  }

  if (!response.ok) {
    let detail = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // Keep the HTTP status message when the server has no JSON error body.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<T>;
}

export interface BootstrapPayload {
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
  patientProfile: PatientMedicalProfile;
  userRole: UserRole;
  adminViewTab: 'admin' | 'hospital' | 'patient';
  selectedHospitalId: string;
}

export const api = {
  login: async (username: string, password: string) => {
    const response = await request<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    authStorage.setToken(response.access_token);
    return response;
  },
  me: () => request<AuthUser>('/auth/me'),
  logout: async () => {
    try {
      await request<{ ok: boolean }>('/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clear();
    }
  },
  bootstrap: () => request<BootstrapPayload>('/bootstrap'),
  triggerSos: (payload: {
    category: EmergencyCategory;
    networkTier: NetworkTier;
    language: LanguageCode;
    selectedPreset: PresetLocation;
    currentLocation: GeoCoordinate | null;
  }) => request<EmergencyAlert>('/sos', { method: 'POST', body: JSON.stringify(payload) }),
  cancelSos: (alertId: string) => request<{ ok: boolean }>(`/alerts/${alertId}/cancel`, { method: 'POST' }),
  updateAlertStatus: (alertId: string, status: AlertStatus) => request<EmergencyAlert>(`/alerts/${alertId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  simulateExternalIncident: () => request<EmergencyAlert>('/simulate/incident', { method: 'POST' }),
  auditLogs: (alertId?: string) => request<AuditLogEntry[]>(`/audit-logs${alertId ? `?alertId=${encodeURIComponent(alertId)}` : ''}`),
  updateHospitalBeds: (hospitalId: string, delta: number) => request<Hospital>(`/hospitals/${hospitalId}/beds`, { method: 'PATCH', body: JSON.stringify({ delta }) }),
  toggleHospitalOxygen: (hospitalId: string) => request<Hospital>(`/hospitals/${hospitalId}/oxygen/toggle`, { method: 'POST' }),
  toggleTraumaTeam: (hospitalId: string) => request<HospitalEmergencyStatus>(`/hospitals/${hospitalId}/trauma-team/toggle`, { method: 'POST' }),
  toggleEmergencyDivert: (hospitalId: string) => request<HospitalEmergencyStatus>(`/hospitals/${hospitalId}/divert/toggle`, { method: 'POST' }),
  acknowledgeHospitalInbound: (alertId: string) => request<{ ok: boolean }>(`/hospitals/inbound/${alertId}/acknowledge`, { method: 'POST' }),
  prepareTraumaBay: (alertId: string) => request<{ ok: boolean }>(`/hospitals/inbound/${alertId}/prepare-trauma-bay`, { method: 'POST' }),
  updatePatientProfile: (data: Partial<PatientMedicalProfile>) => request<PatientMedicalProfile>('/patient-profile', { method: 'PATCH', body: JSON.stringify({ data }) }),
  reset: () => request<{ ok: boolean }>('/reset', { method: 'POST' }),
};
