import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { parseLocalIsoDate } from "@/lib/beagle-dogs";
import { cn } from "@/lib/utils";
import type { BeagleDogProfileShowRowDto } from "@beagle/contracts";

const FALLBACK_VALUE = "-";

function formatDate(value: string, locale: "fi" | "sv"): string {
  const parsed = parseLocalIsoDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return FALLBACK_VALUE;
  }

  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  return new Intl.DateTimeFormat(localeTag).format(parsed);
}

function formatHeight(heightCm: number | null): string {
  if (heightCm == null) {
    return FALLBACK_VALUE;
  }

  return `${heightCm} cm`;
}

export function DogProfileShowsCard({
  rows,
}: {
  rows: BeagleDogProfileShowRowDto[];
}) {
  const { t, locale } = useI18n();

  return (
    <ListingSectionShell
      title={t("dog.profile.card.shows.title")}
      count={`${t("dog.profile.count.entries")}: ${rows.length}`}
    >
      {rows.length === 0 ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-8 text-center text-sm",
            beagleTheme.border,
            beagleTheme.mutedText,
          )}
        >
          {t("dog.profile.empty.shows")}
        </div>
      ) : (
        <ListingResponsiveResults
          desktop={
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-sm">
                <thead>
                  <tr className={cn("border-b text-left", beagleTheme.border)}>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.shows.col.no")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.shows.col.place")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.shows.col.date")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.shows.col.result")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.shows.col.judge")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.shows.col.height")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={cn("border-b align-top", beagleTheme.border)}
                    >
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2">{row.place}</td>
                      <td className="px-2 py-2">
                        {formatDate(row.date, locale)}
                      </td>
                      <td className="px-2 py-2">
                        {row.result ?? FALLBACK_VALUE}
                      </td>
                      <td className="px-2 py-2">
                        {row.judge ?? FALLBACK_VALUE}
                      </td>
                      <td className="px-2 py-2">
                        {formatHeight(row.heightCm)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          mobile={
            <div className="space-y-2">
              {rows.map((row, index) => (
                <article
                  key={row.id}
                  className={cn(
                    "rounded-lg border p-3",
                    beagleTheme.border,
                    beagleTheme.surface,
                  )}
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.shows.col.no")}:
                      </span>{" "}
                      <span>{index + 1}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.shows.col.date")}:
                      </span>{" "}
                      <span>{formatDate(row.date, locale)}</span>
                    </p>
                    <p className="col-span-2">
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.shows.col.place")}:
                      </span>{" "}
                      <span>{row.place}</span>
                    </p>
                    <p className="col-span-2">
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.shows.col.result")}:
                      </span>{" "}
                      <span>{row.result ?? FALLBACK_VALUE}</span>
                    </p>
                    <p className="col-span-2">
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.shows.col.judge")}:
                      </span>{" "}
                      <span>{row.judge ?? FALLBACK_VALUE}</span>
                    </p>
                    <p className="col-span-2">
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.shows.col.height")}:
                      </span>{" "}
                      <span>{formatHeight(row.heightCm)}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          }
        />
      )}
    </ListingSectionShell>
  );
}
