import Link from "next/link";
import { FileText } from "lucide-react";
import type { BeagleTrialSearchRow } from "@beagle/contracts";
import { Button } from "@/components/ui/button";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import {
  formatIsoDateForDisplay,
  formatTrialWeatherSummary,
  getBeagleTrialHref,
  getTrialPdfPageHref,
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
          <div className="flex items-start justify-between gap-2">
            <Link
              href={getBeagleTrialHref(row.trialId)}
              className={cn(
                "block min-w-0 flex-1 rounded-md p-1",
                beagleTheme.interactive,
                beagleTheme.focusRing,
              )}
            >
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("trials.results.col.date")}:{" "}
                  </span>
                  {formatIsoDateForDisplay(row.eventDate, locale)}
                </p>
                <p className="col-span-2">
                  <span className={beagleTheme.mutedText}>
                    {t("trials.results.col.place")}:{" "}
                  </span>
                  {row.eventPlace}
                </p>
                <p className="col-span-2">
                  <span className={beagleTheme.mutedText}>
                    {t("trials.results.col.judge")}:{" "}
                  </span>
                  <span>{row.judge ?? "-"}</span>
                </p>
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("trials.results.col.dogCount")}:{" "}
                  </span>
                  <span
                    className={cn("font-medium", beagleTheme.inkStrongText)}
                  >
                    {row.dogCount}
                  </span>
                </p>
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("trials.results.col.weather")}:{" "}
                  </span>
                  <span>
                    {formatTrialWeatherSummary(row.weather, {
                      snow: t("trials.results.weather.snow"),
                      bareGround: t("trials.results.weather.bareGround"),
                      varied: t("trials.results.weather.varied"),
                    })}
                  </span>
                </p>
                <p>
                  <span className={beagleTheme.mutedText}>
                    {t("trials.results.col.average")}:{" "}
                  </span>
                  <span>
                    {row.average == null ? "-" : row.average.toFixed(2)}
                  </span>
                </p>
              </div>
            </Link>
            {row.pdfTrialEntryIds.length > 0 ? (
              <Button asChild variant="ghost" size="icon-xs">
                <Link
                  href={getTrialPdfPageHref(row.pdfTrialEntryIds)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("trials.results.actions.pdf")}
                  title={t("trials.results.actions.pdf")}
                >
                  <FileText className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
