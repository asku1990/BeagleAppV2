import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { parseLocalIsoDate, type DogProfileTrialRow } from "@/lib/beagle-dogs";
import { cn } from "@/lib/utils";

const FALLBACK_VALUE = "-";

function formatDate(value: string, locale: "fi" | "sv"): string {
  const parsed = parseLocalIsoDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return FALLBACK_VALUE;
  }

  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  return new Intl.DateTimeFormat(localeTag).format(parsed);
}

function formatPoints(points: number | null): string {
  if (points == null) {
    return FALLBACK_VALUE;
  }

  return points.toFixed(1);
}

export function DogProfileTrialsCard({ rows }: { rows: DogProfileTrialRow[] }) {
  const { t, locale } = useI18n();

  return (
    <ListingSectionShell
      title={t("dog.profile.card.trials.title")}
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
          {t("dog.profile.empty.trials")}
        </div>
      ) : (
        <ListingResponsiveResults
          desktop={
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] border-collapse text-sm">
                <thead>
                  <tr className={cn("border-b text-left", beagleTheme.border)}>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.trials.col.no")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.trials.col.place")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.trials.col.date")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.trials.col.weather")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.trials.col.class")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.trials.col.rank")}
                    </th>
                    <th className="px-2 py-2 font-semibold">
                      {t("dog.profile.trials.col.points")}
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
                        {row.weather ?? FALLBACK_VALUE}
                      </td>
                      <td className="px-2 py-2">
                        {row.className ?? FALLBACK_VALUE}
                      </td>
                      <td className="px-2 py-2">
                        {row.rank ?? FALLBACK_VALUE}
                      </td>
                      <td className="px-2 py-2">{formatPoints(row.points)}</td>
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
                        {t("dog.profile.trials.col.no")}:
                      </span>{" "}
                      <span>{index + 1}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.trials.col.date")}:
                      </span>{" "}
                      <span>{formatDate(row.date, locale)}</span>
                    </p>
                    <p className="col-span-2">
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.trials.col.place")}:
                      </span>{" "}
                      <span>{row.place}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.trials.col.weather")}:
                      </span>{" "}
                      <span>{row.weather ?? FALLBACK_VALUE}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.trials.col.class")}:
                      </span>{" "}
                      <span>{row.className ?? FALLBACK_VALUE}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.trials.col.rank")}:
                      </span>{" "}
                      <span>{row.rank ?? FALLBACK_VALUE}</span>
                    </p>
                    <p>
                      <span className={beagleTheme.mutedText}>
                        {t("dog.profile.trials.col.points")}:
                      </span>{" "}
                      <span>{formatPoints(row.points)}</span>
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
