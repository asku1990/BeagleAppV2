"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ANALYTICS_CONSENT_ACCEPTED } from "@/lib/consent";
import { useAnalyticsConsent } from "@/hooks/consent";

export function ConsentedAnalytics() {
  const { consent } = useAnalyticsConsent();
  if (consent !== ANALYTICS_CONSENT_ACCEPTED) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
