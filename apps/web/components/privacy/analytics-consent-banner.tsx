"use client";

import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import { useAnalyticsConsent } from "@/hooks/consent";

export function AnalyticsConsentBanner() {
  const { isBannerOpen, acceptAnalytics, rejectAnalytics } =
    useAnalyticsConsent();

  if (!isBannerOpen) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 px-4">
      <div
        className={cn(
          "mx-auto w-full max-w-3xl rounded-lg border px-4 py-4 shadow-lg md:px-5",
          beagleTheme.panel,
          beagleTheme.border,
        )}
      >
        <p className={cn("text-sm font-medium", beagleTheme.inkStrongText)}>
          We use optional analytics cookies for anonymous traffic and
          performance measurement.
        </p>
        <p className={cn("mt-1 text-sm", beagleTheme.inkText)}>
          Choose Accept to enable Vercel Analytics and Speed Insights, or Reject
          to keep them disabled.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={acceptAnalytics}
            className={cn(
              "min-h-10 cursor-pointer rounded-md border px-4 text-sm font-semibold transition-colors duration-150",
              beagleTheme.border,
              "bg-[var(--beagle-surface)] hover:bg-[var(--beagle-accent-soft)]",
              beagleTheme.inkStrongText,
              beagleTheme.focusRing,
            )}
          >
            Accept analytics
          </button>
          <button
            type="button"
            onClick={rejectAnalytics}
            className={cn(
              "min-h-10 cursor-pointer rounded-md border px-4 text-sm font-semibold transition-colors duration-150",
              beagleTheme.border,
              "bg-[var(--beagle-surface)] hover:bg-[var(--beagle-accent-soft)]",
              beagleTheme.inkStrongText,
              beagleTheme.focusRing,
            )}
          >
            Reject analytics
          </button>
        </div>
      </div>
    </div>
  );
}
