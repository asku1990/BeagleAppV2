"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { AnalyticsConsentProvider } from "@/lib/consent/client";
import { type AnalyticsConsentState } from "@/lib/consent";
import {
  AnalyticsConsentBanner,
  ConsentedAnalytics,
} from "@/components/privacy";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function Providers({
  children,
  initialLocale,
  initialAnalyticsConsent,
}: {
  children: ReactNode;
  initialLocale?: Locale;
  initialAnalyticsConsent: AnalyticsConsentState;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <AnalyticsConsentProvider initialConsent={initialAnalyticsConsent}>
      <I18nProvider initialLocale={initialLocale}>
        <QueryClientProvider client={queryClient}>
          {children}
          <AnalyticsConsentBanner />
          <ConsentedAnalytics />
          <Toaster richColors position="top-center" />
          {process.env.NODE_ENV === "development" ? (
            <ReactQueryDevtools initialIsOpen={false} />
          ) : null}
        </QueryClientProvider>
      </I18nProvider>
    </AnalyticsConsentProvider>
  );
}
