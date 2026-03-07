export const ANALYTICS_CONSENT_COOKIE_NAME = "beagle.analytics_consent";
const ANALYTICS_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const ANALYTICS_CONSENT_MAX_AGE = ANALYTICS_CONSENT_MAX_AGE_SECONDS;

export const ANALYTICS_CONSENT_ACCEPTED = "accepted";
export const ANALYTICS_CONSENT_REJECTED = "rejected";
export const ANALYTICS_CONSENT_UNSET = "unset";

export type AnalyticsConsentDecision =
  | typeof ANALYTICS_CONSENT_ACCEPTED
  | typeof ANALYTICS_CONSENT_REJECTED;

export type AnalyticsConsentState =
  | AnalyticsConsentDecision
  | typeof ANALYTICS_CONSENT_UNSET;

export function parseAnalyticsConsent(
  value: string | null | undefined,
): AnalyticsConsentState {
  if (value === ANALYTICS_CONSENT_ACCEPTED) {
    return ANALYTICS_CONSENT_ACCEPTED;
  }

  if (value === ANALYTICS_CONSENT_REJECTED) {
    return ANALYTICS_CONSENT_REJECTED;
  }

  return ANALYTICS_CONSENT_UNSET;
}
