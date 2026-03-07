import { afterEach, describe, expect, it } from "vitest";
import {
  ANALYTICS_CONSENT_ACCEPTED,
  ANALYTICS_CONSENT_COOKIE_NAME,
  ANALYTICS_CONSENT_REJECTED,
  ANALYTICS_CONSENT_UNSET,
  parseAnalyticsConsent,
} from "@/lib/consent/types";
import {
  readAnalyticsConsentFromCookieString,
  readAnalyticsConsentFromDocument,
  writeAnalyticsConsentCookie,
} from "@/lib/consent/storage";

const originalDocument = globalThis.document;
const originalWindow = globalThis.window;

afterEach(() => {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: originalDocument,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: originalWindow,
  });
});

describe("consent storage", () => {
  it("parses known consent values", () => {
    expect(parseAnalyticsConsent("accepted")).toBe(ANALYTICS_CONSENT_ACCEPTED);
    expect(parseAnalyticsConsent("rejected")).toBe(ANALYTICS_CONSENT_REJECTED);
  });

  it("returns unset for missing or unknown consent values", () => {
    expect(parseAnalyticsConsent(undefined)).toBe(ANALYTICS_CONSENT_UNSET);
    expect(parseAnalyticsConsent("invalid")).toBe(ANALYTICS_CONSENT_UNSET);
  });

  it("reads consent value from cookie string", () => {
    const cookie = `x=1; ${ANALYTICS_CONSENT_COOKIE_NAME}=accepted; y=2`;
    expect(readAnalyticsConsentFromCookieString(cookie)).toBe(
      ANALYTICS_CONSENT_ACCEPTED,
    );
  });

  it("reads unset when consent cookie does not exist", () => {
    expect(readAnalyticsConsentFromCookieString("x=1; y=2")).toBe(
      ANALYTICS_CONSENT_UNSET,
    );
  });

  it("reads consent from document.cookie when document exists", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        cookie: `${ANALYTICS_CONSENT_COOKIE_NAME}=rejected`,
      },
    });

    expect(readAnalyticsConsentFromDocument()).toBe(ANALYTICS_CONSENT_REJECTED);
  });

  it("returns unset when document is unavailable", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: undefined,
    });

    expect(readAnalyticsConsentFromDocument()).toBe(ANALYTICS_CONSENT_UNSET);
  });

  it("writes consent decision into cookie", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        cookie: "",
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          protocol: "http:",
        },
      },
    });

    writeAnalyticsConsentCookie(ANALYTICS_CONSENT_ACCEPTED);
    expect(globalThis.document.cookie).toContain(
      `${ANALYTICS_CONSENT_COOKIE_NAME}=accepted`,
    );
    expect(globalThis.document.cookie).not.toContain("secure");
  });

  it("writes secure consent cookie on https", () => {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        cookie: "",
      },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        location: {
          protocol: "https:",
        },
      },
    });

    writeAnalyticsConsentCookie(ANALYTICS_CONSENT_ACCEPTED);
    expect(globalThis.document.cookie).toContain("secure");
  });
});
