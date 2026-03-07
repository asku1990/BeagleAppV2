import {
  ANALYTICS_CONSENT_COOKIE_NAME,
  ANALYTICS_CONSENT_MAX_AGE,
  type AnalyticsConsentDecision,
  type AnalyticsConsentState,
  parseAnalyticsConsent,
} from "@/lib/consent/types";

export function readAnalyticsConsentFromCookieString(
  cookie: string,
): AnalyticsConsentState {
  const cookieParts = cookie.split(";");
  for (const cookiePart of cookieParts) {
    const [rawName, ...rawValueParts] = cookiePart.trim().split("=");
    if (rawName !== ANALYTICS_CONSENT_COOKIE_NAME) {
      continue;
    }

    const value = rawValueParts.join("=");
    return parseAnalyticsConsent(value);
  }

  return parseAnalyticsConsent(null);
}

export function readAnalyticsConsentFromDocument(): AnalyticsConsentState {
  if (typeof document === "undefined") {
    return parseAnalyticsConsent(null);
  }

  return readAnalyticsConsentFromCookieString(document.cookie);
}

export function writeAnalyticsConsentCookie(
  decision: AnalyticsConsentDecision,
): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie =
    `${ANALYTICS_CONSENT_COOKIE_NAME}=${decision}; ` +
    `path=/; max-age=${ANALYTICS_CONSENT_MAX_AGE}; samesite=lax`;
}
