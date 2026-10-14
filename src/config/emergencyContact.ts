const DEFAULT_EMERGENCY_CONTACT = '+91 7013753816';

/** Keep the recipient configurable without coupling it to hospital records. */
export const EMERGENCY_CONTACT_NUMBER =
  (import.meta.env.VITE_EMERGENCY_CONTACT_NUMBER as string | undefined)?.trim() ||
  DEFAULT_EMERGENCY_CONTACT;

/** Return a canonical tel: value after validating an international phone number. */
export function getValidatedEmergencyContact(value: string = EMERGENCY_CONTACT_NUMBER): string | null {
  const normalized = value.replace(/[\s().-]/g, '');
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) return null;
  return normalized;
}

export function formatEmergencyContact(value: string = EMERGENCY_CONTACT_NUMBER): string {
  return value.trim() || DEFAULT_EMERGENCY_CONTACT;
}

export type DialerResult =
  | { ok: true; telUri: string; isLikelyMobile: boolean }
  | { ok: false; reason: 'invalid-number' | 'unavailable' };

/**
 * Ask the operating system to open its dialer. Browsers cannot confirm that a
 * call was placed or connected, so the caller must present this as a request.
 */
export function openEmergencyDialer(): DialerResult {
  const phone = getValidatedEmergencyContact();
  if (!phone || typeof window === 'undefined' || typeof document === 'undefined') {
    return { ok: false, reason: phone ? 'unavailable' : 'invalid-number' };
  }

  const telUri = `tel:${phone}`;
  const isLikelyMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const link = document.createElement('a');
  link.href = telUri;
  link.setAttribute('aria-hidden', 'true');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  return { ok: true, telUri, isLikelyMobile };
}
