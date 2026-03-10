import Link from "next/link";
import type { BeagleShowSearchRow } from "@beagle/contracts";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import {
  formatIsoDateForDisplay,
  getBeagleShowHref,
} from "@/lib/public/beagle/shows";
import { cn } from "@/lib/utils";

export function BeagleShowsResultsMobileCards({
  rows,
}: {
  rows: BeagleShowSearchRow[];
}) {
  const { t, locale } = useI18n();

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <article
          key={row.showId}
          className={cn(
            "rounded-lg border p-3",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            <p>
              <span className={beagleTheme.mutedText}>
                {t("shows.results.col.date")}:{" "}
              </span>
              <span>{formatIsoDateForDisplay(row.eventDate, locale)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("shows.results.col.dogCount")}:{" "}
              </span>
              <span className={cn("font-medium", beagleTheme.inkStrongText)}>
                {row.dogCount}
              </span>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("shows.results.col.place")}:{" "}
              </span>
              <span>{row.eventPlace}</span>
            </p>
            <p className="col-span-2">
              <span className={beagleTheme.mutedText}>
                {t("shows.results.col.judge")}:{" "}
              </span>
              <span>{row.judge ?? "-"}</span>
            </p>
            <p className="col-span-2">
              <Link
                href={getBeagleShowHref(row.showId)}
                className={beagleTheme.entityLink}
              >
                {t("shows.results.open")}
              </Link>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
