export type ThemeMode = 'light' | 'dark';

const THEME_COOKIE_NAME = 'resqlink_theme';

/**
 * Reads the theme preference from the session cookie.
 * Returns 'light', 'dark', or null if no cookie is found.
 */
export function getThemeCookie(): ThemeMode | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${THEME_COOKIE_NAME}=(light|dark)(?:;|$)`));
  return match ? (match[1] as ThemeMode) : null;
}

/**
 * Writes the theme preference as a session cookie (no max-age or expires,
 * so it clears on browser close and defaults back to system OS theme on next visit).
 */
export function setThemeCookie(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; SameSite=Lax`;
}
