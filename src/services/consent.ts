export const CONSENT_VERSION = '2026-10-13';
const CONSENT_STORAGE_KEY = 'resqlink_consent_preferences';

export type ConsentPreferences = {
  version: string;
  timestamp: string;
  necessary: true;
  functional: boolean;
  analytics: false;
  advertising: false;
};

const defaultPreferences = (): ConsentPreferences => ({
  version: CONSENT_VERSION,
  timestamp: new Date().toISOString(),
  necessary: true,
  functional: false,
  analytics: false,
  advertising: false,
});

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function readConsent(): ConsentPreferences | null {
  const raw = readStorage();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (parsed.version !== CONSENT_VERSION || parsed.necessary !== true) return null;
    return {
      ...defaultPreferences(),
      ...parsed,
      analytics: false,
      advertising: false,
    };
  } catch {
    return null;
  }
}

export function saveConsent(preferences: Pick<ConsentPreferences, 'functional' | 'analytics' | 'advertising'>): ConsentPreferences {
  const saved: ConsentPreferences = {
    ...defaultPreferences(),
    ...preferences,
    timestamp: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Private browsing or storage restrictions are handled by the caller's UI.
  }
  return saved;
}

export function clearOptionalConsent(): ConsentPreferences {
  return saveConsent({ functional: false, analytics: false, advertising: false });
}
