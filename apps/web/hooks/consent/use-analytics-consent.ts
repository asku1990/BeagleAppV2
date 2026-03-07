"use client";

import { useContext } from "react";
import { AnalyticsConsentContext } from "@/lib/consent/client";

export function useAnalyticsConsent() {
  const context = useContext(AnalyticsConsentContext);
  if (!context) {
    throw new Error(
      "useAnalyticsConsent must be used within AnalyticsConsentProvider",
    );
  }

  return context;
}
