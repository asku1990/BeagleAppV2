import Link from "next/link";
import type { BeagleTrialSearchRow } from "@beagle/contracts";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import {
  formatIsoDateForDisplay,
  getBeagleTrialHref,
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
      <table className="w-full min-w-[760px] border-collapse text-sm">
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
              {t("trials.results.col.details")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.trialId}
              className={cn("border-b align-top", beagleTheme.border)}
            >
              <td className="px-2 py-2">
                {formatIsoDateForDisplay(row.eventDate, locale)}
              </td>
              <td className="px-2 py-2">{row.eventPlace}</td>
              <td className="px-2 py-2">{row.judge ?? "-"}</td>
              <td className="px-2 py-2">{row.dogCount}</td>
              <td className="px-2 py-2">
                <Link
                  href={getBeagleTrialHref(row.trialId)}
                  className={beagleTheme.entityLink}
                >
                  {t("trials.results.open")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
