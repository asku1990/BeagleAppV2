"use client";

import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";
import { useAnalyticsConsent } from "@/hooks/consent";

export function AnalyticsConsentBanner() {
  const { t } = useI18n();
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
          {t("privacy.banner.title")}
        </p>
        <p className={cn("mt-1 text-sm", beagleTheme.inkText)}>
          {t("privacy.banner.body")}
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
            {t("privacy.banner.accept")}
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
            {t("privacy.banner.reject")}
          </button>
        </div>
      </div>
    </div>
  );
}
