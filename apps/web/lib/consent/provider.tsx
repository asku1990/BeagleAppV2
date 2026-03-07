"use client";

import {
  createContext,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ANALYTICS_CONSENT_UNSET,
  type AnalyticsConsentState,
} from "@/lib/consent/types";
import { writeAnalyticsConsentCookie } from "@/lib/consent/storage";

type AnalyticsConsentContextValue = {
  consent: AnalyticsConsentState;
  isBannerOpen: boolean;
  setConsent: Dispatch<SetStateAction<AnalyticsConsentState>>;
  openBanner: () => void;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
};

export const AnalyticsConsentContext =
  createContext<AnalyticsConsentContextValue | null>(null);

export function AnalyticsConsentProvider({
  children,
  initialConsent,
}: {
  children: ReactNode;
  initialConsent: AnalyticsConsentState;
}) {
  const [consent, setConsent] = useState<AnalyticsConsentState>(initialConsent);
  const [isBannerOpen, setIsBannerOpen] = useState(initialConsent === "unset");

  const openBanner = () => {
    setIsBannerOpen(true);
  };

  const acceptAnalytics = () => {
    setConsent("accepted");
    writeAnalyticsConsentCookie("accepted");
    setIsBannerOpen(false);
  };

  const rejectAnalytics = () => {
    setConsent("rejected");
    writeAnalyticsConsentCookie("rejected");
    setIsBannerOpen(false);
  };

  const value = useMemo<AnalyticsConsentContextValue>(
    () => ({
      consent,
      isBannerOpen: consent === ANALYTICS_CONSENT_UNSET ? true : isBannerOpen,
      setConsent,
      openBanner,
      acceptAnalytics,
      rejectAnalytics,
    }),
    [consent, isBannerOpen],
  );

  return (
    <AnalyticsConsentContext.Provider value={value}>
      {children}
    </AnalyticsConsentContext.Provider>
  );
}
