/**
 * Llarron UTM and Click-ID Attribution Persistence Module
 *
 * Preserves campaign touchpoints across clean-URL navigation using sessionStorage.
 * Adheres strictly to the C2C security and allowlist guidelines.
 */

export const STORAGE_KEY = "llarron_attribution_v1";
export const MAX_PARAM_LENGTH = 200;

export const UTM_ALLOWLIST = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "platform",
  "gclid",
  "fbclid",
  "fbp",
  "fbc",
  "matchtype",
  "network",
  "device",
  "keyword",
  "placement",
  "campaignid",
  "adgroupid",
] as const;

export type UtmParamKey = (typeof UTM_ALLOWLIST)[number];
export type AttributionData = Partial<Record<UtmParamKey, string>>;

/**
 * Trims whitespace, truncates to MAX_PARAM_LENGTH, and returns null if empty.
 */
export function sanitizeParam(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, MAX_PARAM_LENGTH);
}

/**
 * Extracts and sanitizes allowlisted parameters from a query string.
 */
export function extractParamsFromQuery(search: string): AttributionData {
  if (!search) return {};

  const params: AttributionData = {};
  try {
    const urlParams = new URLSearchParams(search);
    for (const key of UTM_ALLOWLIST) {
      const rawVal = urlParams.get(key);
      const cleanVal = sanitizeParam(rawVal);
      if (cleanVal !== null) {
        params[key] = cleanVal;
      }
    }
  } catch {
    // Fail safely if URLSearchParams fails
  }

  return params;
}

/**
 * Reads stored attribution safely from sessionStorage.
 */
export function getStoredAttribution(): AttributionData {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return {};
    }

    const clean: AttributionData = {};
    for (const key of UTM_ALLOWLIST) {
      if (typeof parsed[key] === "string") {
        const val = sanitizeParam(parsed[key]);
        if (val !== null) {
          clean[key] = val;
        }
      }
    }
    return clean;
  } catch {
    // Corrupted JSON or storage failure
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage access issues
    }
    return {};
  }
}

/**
 * Captures allowlisted parameters from window.location.search and persists to sessionStorage.
 * Does not overwrite existing session data with an empty object on clean URLs.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    const liveParams = extractParamsFromQuery(window.location.search);
    if (Object.keys(liveParams).length === 0) {
      // Clean URL: do not overwrite stored attribution
      return;
    }

    const stored = getStoredAttribution();
    const merged: AttributionData = { ...stored, ...liveParams };

    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Fail safely on storage quota or security exceptions
  }
}

/**
 * Resolves attribution at form submit time.
 * Live URL parameters take precedence; stored session attribution is used as fallback.
 */
export function getAttribution(): AttributionData {
  if (typeof window === "undefined") {
    return {};
  }

  const liveParams = extractParamsFromQuery(window.location.search);
  const stored = getStoredAttribution();

  return { ...stored, ...liveParams };
}

/**
 * Clears stored attribution from sessionStorage after verified API success.
 */
export function clearAttribution(): void {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Fail safely
  }
}
