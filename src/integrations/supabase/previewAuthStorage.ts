/**
 * Standard browser storage adapter for Supabase session persistence.
 */
export function brokeredPreviewStorage() {
  if (typeof window === "undefined") return undefined;
  return localStorage;
}

