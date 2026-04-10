import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import type { MessageKey } from "@/lib/i18n";
import { parseLocalIsoDate } from "@/lib/public/beagle/dogs/profile";
import { cn } from "@/lib/utils";
import type { BeagleDogProfileTitleRowDto } from "@beagle/contracts";

const FALLBACK_VALUE = "-";

function formatTitleDate(value: string | null, locale: "fi" | "sv"): string {
  if (!value) {
    return FALLBACK_VALUE;
  }

  const parsed = parseLocalIsoDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return FALLBACK_VALUE;
  }

  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  return new Intl.DateTimeFormat(localeTag).format(parsed);
}

function renderText(value: string | null): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : FALLBACK_VALUE;
}

function TitlesDesktopTable({
  rows,
  locale,
  t,
}: {
  rows: BeagleDogProfileTitleRowDto[];
  locale: "fi" | "sv";
  t: (key: MessageKey) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[540px] border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.titles.col.date")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.titles.col.code")}
            </th>
            <th className="px-2 py-2 font-semibold">
              {t("dog.profile.titles.col.name")}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.titleCode}-${row.awardedOn ?? "no-date"}-${index}`}
              className={cn("border-b align-top", beagleTheme.border)}
            >
              <td className="px-2 py-2 tabular-nums">
                {formatTitleDate(row.awardedOn, locale)}
              </td>
              <td className="px-2 py-2">{renderText(row.titleCode)}</td>
              <td className="px-2 py-2">{renderText(row.titleName)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TitlesMobileCards({
  rows,
  locale,
  t,
}: {
  rows: BeagleDogProfileTitleRowDto[];
  locale: "fi" | "sv";
  t: (key: MessageKey) => string;
}) {
  return (
    <div className="space-y-2">
      {rows.map((row, index) => (
        <article
          key={`${row.titleCode}-${row.awardedOn ?? "no-date"}-${index}`}
          className={cn(
            "rounded-lg border p-3",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <div className="grid grid-cols-1 gap-2 text-xs">
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.titles.col.date")}:{" "}
              </span>
              <span>{formatTitleDate(row.awardedOn, locale)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.titles.col.code")}:{" "}
              </span>
              <span>{renderText(row.titleCode)}</span>
            </p>
            <p>
              <span className={beagleTheme.mutedText}>
                {t("dog.profile.titles.col.name")}:{" "}
              </span>
              <span>{renderText(row.titleName)}</span>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

export function DogProfileTitlesCard({
  rows,
}: {
  rows: BeagleDogProfileTitleRowDto[];
}) {
  const { t, locale } = useI18n();

  return (
    <ListingSectionShell title={t("dog.profile.card.titles.title")}>
      <ListingResponsiveResults
        desktop={<TitlesDesktopTable rows={rows} locale={locale} t={t} />}
        mobile={<TitlesMobileCards rows={rows} locale={locale} t={t} />}
      />
    </ListingSectionShell>
  );
}
