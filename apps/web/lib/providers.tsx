"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";

export function Providers({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <I18nProvider initialLocale={initialLocale}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === "development" ? (
          <ReactQueryDevtools initialIsOpen={false} />
        ) : null}
      </QueryClientProvider>
    </I18nProvider>
  );
}
