import Link from "next/link";
import type { BeagleTrialSearchRow } from "@beagle/contracts";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import {
  formatIsoDateForDisplay,
  getBeagleTrialHref,
} from "@/lib/public/beagle/trials";
import { cn } from "@/lib/utils";

export function BeagleTrialsResultsMobileCards({
  rows,
}: {
  rows: BeagleTrialSearchRow[];
}) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <article
          key={row.trialId}
          className={cn(
            "rounded-lg border p-3",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p>
              <span className={beagleTheme.mutedText}>
                {t("trials.results.col.date")}:{" "}
              </span>
              <span>{formatIsoDateForDisplay(row.eventDate, locale)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("trials.results.col.dogCount")}:{" "}
              </span>
              <span className={cn("font-medium", beagleTheme.inkStrongText)}>
                {row.dogCount}
              </span>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("trials.results.col.place")}:{" "}
              </span>
              <span>{row.eventPlace}</span>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("trials.results.col.judge")}:{" "}
              </span>
              <span>{row.judge ?? "-"}</span>
            </p>
            <p className="col-span-2">
              <Link
                href={getBeagleTrialHref(row.trialId)}
                className={beagleTheme.entityLink}
              >
                {t("trials.results.open")}
              </Link>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
