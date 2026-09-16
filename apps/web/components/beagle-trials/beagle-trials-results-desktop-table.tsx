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

const trialInfoGridStyle = {
  gridTemplateColumns: "1.2fr 1.5fr 1.4fr 0.5fr 1.2fr 1fr",
};

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
            <th colSpan={6} className="p-0">
              <div className="mx-2 grid" style={trialInfoGridStyle}>
                <span className="py-2 font-semibold">
                  {t("trials.results.col.date")}
                </span>
                <span className="py-2 font-semibold">
                  {t("trials.results.col.place")}
                </span>
                <span className="py-2 font-semibold">
                  {t("trials.results.col.judge")}
                </span>
                <span className="py-2 font-semibold">
                  {t("trials.results.col.dogCount")}
                </span>
                <span className="py-2 font-semibold">
                  {t("trials.results.col.weather")}
                </span>
                <span className="py-2 font-semibold">
                  {t("trials.results.col.average")}
                </span>
              </div>
            </th>
            <th className="px-2 py-2 text-left font-semibold">
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
              <td colSpan={6} className="px-1 py-1">
                <Link
                  href={getBeagleTrialHref(row.trialId)}
                  className={cn(
                    "block rounded-md p-1",
                    beagleTheme.interactive,
                    beagleTheme.focusRing,
                  )}
                >
                  <div className="grid" style={trialInfoGridStyle}>
                    <span>
                      {formatIsoDateForDisplay(row.eventDate, locale)}
                    </span>
                    <span>{row.eventPlace}</span>
                    <span>{row.judge ?? "-"}</span>
                    <span>{row.dogCount}</span>
                    <span>
                      {formatTrialWeatherSummary(row.weather, {
                        snow: t("trials.results.weather.snow"),
                        bareGround: t("trials.results.weather.bareGround"),
                        varied: t("trials.results.weather.varied"),
                      })}
                    </span>
                    <span>
                      {row.average == null ? "-" : row.average.toFixed(2)}
                    </span>
                  </div>
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
