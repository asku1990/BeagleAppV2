export {
  ANALYTICS_CONSENT_COOKIE_NAME,
  ANALYTICS_CONSENT_MAX_AGE,
  ANALYTICS_CONSENT_ACCEPTED,
  ANALYTICS_CONSENT_REJECTED,
  ANALYTICS_CONSENT_UNSET,
  parseAnalyticsConsent,
  type AnalyticsConsentDecision,
  type AnalyticsConsentState,
} from "./types";
export {
  readAnalyticsConsentFromCookieString,
  readAnalyticsConsentFromDocument,
  writeAnalyticsConsentCookie,
} from "./storage";
