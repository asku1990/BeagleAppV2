import Link from "next/link";
import type { BeagleShowSearchRow } from "@beagle/contracts";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import {
  formatIsoDateForDisplay,
  getBeagleShowHref,
} from "@/lib/public/beagle/shows";
import { cn } from "@/lib/utils";

export function BeagleShowsResultsDesktopTable({
  rows,
}: {
  rows: BeagleShowSearchRow[];
}) {
  const { t, locale } = useI18n();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="px-2 py-2 font-semibold">
              {t("shows.results.col.date")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("shows.results.col.place")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("shows.results.col.judge")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("shows.results.col.dogCount")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("shows.results.col.details")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.showId}
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
                  href={getBeagleShowHref(row.showId)}
                  className={beagleTheme.entityLink}
                >
                  {t("shows.results.open")}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
