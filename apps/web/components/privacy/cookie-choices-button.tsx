"use client";

import { beagleTheme } from "@/components/ui/beagle-theme";
import { cn } from "@/lib/utils";
import { useAnalyticsConsent } from "@/hooks/consent";

export function CookieChoicesButton() {
  const { openBanner } = useAnalyticsConsent();

  return (
    <button
      type="button"
      onClick={openBanner}
      className={cn(
        "mt-3 min-h-10 cursor-pointer rounded-md border px-4 text-sm font-semibold transition-colors duration-150",
        beagleTheme.border,
        beagleTheme.softAccent,
        beagleTheme.inkStrongText,
        beagleTheme.interactive,
        beagleTheme.focusRing,
      )}
    >
      Cookie choices
    </button>
  );
}
