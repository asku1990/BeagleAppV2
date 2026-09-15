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

export function BeagleTrialsResultsDesktopTable({
  rows,
}: {
  rows: BeagleTrialSearchRow[];
}) {
  const { t, locale } = useI18n();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="px-2 py-2 font-semibold">
              {t("trials.results.col.date")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("trials.results.col.place")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("trials.results.col.judge")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("trials.results.col.dogCount")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("trials.results.col.weather")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("trials.results.col.average")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("trials.results.col.details")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("trials.results.col.pdf")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.trialId}
              className={cn(
                "border-b align-top whitespace-nowrap",
                beagleTheme.border,
              )}
            >
              <td className="px-1 py-1">
                {formatIsoDateForDisplay(row.eventDate, locale)}
              </td>
              <td className="px-1 py-1">{row.eventPlace}</td>
              <td className="px-1 py-1">{row.judge ?? "-"}</td>
              <td className="px-1 py-1">{row.dogCount}</td>
              <td className="px-1 py-1">
                {formatTrialWeatherSummary(row.weather, {
                  snow: t("trials.results.weather.snow"),
                  bareGround: t("trials.results.weather.bareGround"),
                  varied: t("trials.results.weather.varied"),
                })}
              </td>
              <td className="px-1 py-1">
                {row.average == null ? "-" : row.average.toFixed(2)}
              </td>
              <td className="px-1 py-1">
                <Link
                  href={getBeagleTrialHref(row.trialId)}
                  className={beagleTheme.entityLink}
                >
                  {t("trials.results.open")}
                </Link>
              </td>
              <td className="px-1 py-1">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
