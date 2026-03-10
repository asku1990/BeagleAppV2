import Link from "next/link";
import { useState } from "react";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { toast } from "@/components/ui/sonner";
import { useI18n } from "@/hooks/i18n";
import { parseLocalIsoDate } from "@/lib/public/beagle/dogs/profile";
import {
  copyDogProfileShowRowsToClipboard,
  getBeagleShowHref,
} from "@/lib/public/beagle/shows";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const canReveal = rows.length > 10;
  const visibleRows = isExpanded ? rows : rows.slice(0, 10);

  const hasResult = rows.some((r) => r.result != null);
  const hasJudge = rows.some((r) => r.judge != null);
  const hasHeight = rows.some((r) => r.heightCm != null);

  const handleCopyRows = async () => {
    await copyDogProfileShowRowsToClipboard({
      rows,
      labels: {
        no: t("dog.profile.shows.col.no"),
        place: t("dog.profile.shows.col.place"),
        date: t("dog.profile.shows.col.date"),
        result: t("dog.profile.shows.col.result"),
        height: t("dog.profile.shows.col.height"),
        judge: t("dog.profile.shows.col.judge"),
      },
      columns: {
        includeResult: hasResult,
        includeHeight: hasHeight,
        includeJudge: hasJudge,
      },
      messages: {
        success: t("dog.profile.shows.copy.success"),
        error: t("dog.profile.shows.copy.error"),
        unsupported: t("dog.profile.shows.copy.unsupported"),
      },
      clipboard: globalThis.navigator?.clipboard,
      toast,
    });
  };

  return (
    <ListingSectionShell
      title={t("dog.profile.card.shows.title")}
      count={
        <span className="flex flex-wrap items-center gap-2">
          <span>
            {t("dog.profile.count.entries")}: {rows.length}
          </span>
          {rows.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                void handleCopyRows();
              }}
              className={cn(
                "cursor-pointer text-xs underline underline-offset-2",
                beagleTheme.inkStrongText,
              )}
            >
              {t("dog.profile.shows.copy.button")}
            </button>
          ) : null}
        </span>
      }
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
                    {hasResult && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.result")}
                      </th>
                    )}
                    {hasHeight && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.height")}
                      </th>
                    )}
                    {hasJudge && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.shows.col.judge")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={cn("border-b align-top", beagleTheme.border)}
                    >
                      <td className="px-2 py-2">{index + 1}</td>
                      <td className="px-2 py-2">
                        <Link
                          href={getBeagleShowHref(row.showId)}
                          className={cn(
                            "font-medium underline underline-offset-2",
                            beagleTheme.inkStrongText,
                          )}
                        >
                          {row.place}
                        </Link>
                      </td>
                      <td className="px-2 py-2">
                        {formatDate(row.date, locale)}
                      </td>
                      {hasResult && (
                        <td className="px-2 py-2">
                          {row.result ?? FALLBACK_VALUE}
                        </td>
                      )}
                      {hasHeight && (
                        <td className="px-2 py-2">
                          {formatHeight(row.heightCm)}
                        </td>
                      )}
                      {hasJudge && (
                        <td className="px-2 py-2">
                          {row.judge ?? FALLBACK_VALUE}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
          mobile={
            <div className="space-y-2">
              {visibleRows.map((row, index) => (
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
                      <Link
                        href={getBeagleShowHref(row.showId)}
                        className={cn(
                          "font-medium underline underline-offset-2",
                          beagleTheme.inkStrongText,
                        )}
                      >
                        {row.place}
                      </Link>
                    </p>
                    {hasResult && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.result")}:
                        </span>{" "}
                        <span>{row.result ?? FALLBACK_VALUE}</span>
                      </p>
                    )}
                    {hasHeight && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.height")}:
                        </span>{" "}
                        <span>{formatHeight(row.heightCm)}</span>
                      </p>
                    )}
                    {hasJudge && (
                      <p className="col-span-2">
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.shows.col.judge")}:
                        </span>{" "}
                        <span>{row.judge ?? FALLBACK_VALUE}</span>
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          }
        />
      )}
      {canReveal ? (
        <div className="flex items-center justify-between gap-3 pt-3">
          <p className={cn("text-xs", beagleTheme.mutedText)}>
            {t("dog.profile.section.showing")} {visibleRows.length} /{" "}
            {rows.length}
          </p>
          <button
            type="button"
            className={cn(
              "cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium",
              beagleTheme.border,
              beagleTheme.surface,
              beagleTheme.inkStrongText,
              beagleTheme.interactive,
            )}
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded
              ? t("dog.profile.section.showLess")
              : t("dog.profile.section.showMore")}
          </button>
        </div>
      ) : null}
    </ListingSectionShell>
  );
}
