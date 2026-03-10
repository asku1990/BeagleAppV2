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
  copyDogProfileTrialRowsToClipboard,
  getBeagleTrialHref,
} from "@/lib/public/beagle/trials";
import { cn } from "@/lib/utils";
import type { BeagleDogProfileTrialRowDto } from "@beagle/contracts";

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

  return points.toFixed(2);
}

function formatRank(rank: string | null): string {
  if (!rank) {
    return FALLBACK_VALUE;
  }

  const trimmed = rank.trim();
  if (!trimmed) {
    return FALLBACK_VALUE;
  }

  return trimmed;
}

export function DogProfileTrialsCard({
  rows,
}: {
  rows: BeagleDogProfileTrialRowDto[];
}) {
  const { t, locale } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const canReveal = rows.length > 10;
  const visibleRows = isExpanded ? rows : rows.slice(0, 10);

  const hasWeather = rows.some((r) => r.weather != null);
  const hasAward = rows.some((r) => r.className != null || r.award != null);
  const hasRank = rows.some((r) => r.rank != null);
  const hasPoints = rows.some((r) => r.points != null);
  const hasJudge = rows.some((r) => r.judge != null);
  const hasSearchWork = rows.some((r) => r.haku != null);
  const hasBarking = rows.some((r) => r.hauk != null);
  const hasGeneralImpression = rows.some((r) => r.yva != null);
  const hasSearchLoosenessPenalty = rows.some((r) => r.hlo != null);
  const hasChaseLoosenessPenalty = rows.some((r) => r.alo != null);
  const hasObstacleWork = rows.some((r) => r.tja != null);
  const hasTotalPoints = rows.some((r) => r.pin != null);

  const handleCopyRows = async () => {
    await copyDogProfileTrialRowsToClipboard({
      rows,
      labels: {
        no: t("dog.profile.trials.col.no"),
        place: t("dog.profile.trials.col.place"),
        date: t("dog.profile.trials.col.date"),
        weather: t("dog.profile.trials.col.weather"),
        award: t("dog.profile.trials.col.class"),
        rank: t("dog.profile.trials.col.rank"),
        points: t("dog.profile.trials.col.points"),
        judge: t("trials.details.col.judge"),
        searchWork: t("trials.details.copy.col.searchWork"),
        barking: t("trials.details.copy.col.barking"),
        generalImpression: t("trials.details.copy.col.generalImpression"),
        searchLoosenessPenalty: t(
          "trials.details.copy.col.searchLoosenessPenalty",
        ),
        chaseLoosenessPenalty: t(
          "trials.details.copy.col.chaseLoosenessPenalty",
        ),
        obstacleWork: t("trials.details.copy.col.obstacleWork"),
        totalPoints: t("trials.details.copy.col.mi"),
      },
      columns: {
        includeWeather: hasWeather,
        includeAward: hasAward,
        includeRank: hasRank,
        includePoints: hasPoints,
        includeJudge: hasJudge,
        includeSearchWork: hasSearchWork,
        includeBarking: hasBarking,
        includeGeneralImpression: hasGeneralImpression,
        includeSearchLoosenessPenalty: hasSearchLoosenessPenalty,
        includeChaseLoosenessPenalty: hasChaseLoosenessPenalty,
        includeObstacleWork: hasObstacleWork,
        includeTotalPoints: hasTotalPoints,
      },
      messages: {
        success: t("dog.profile.trials.copy.success"),
        error: t("dog.profile.trials.copy.error"),
        unsupported: t("dog.profile.trials.copy.unsupported"),
      },
      clipboard: globalThis.navigator?.clipboard,
      toast,
    });
  };

  return (
    <ListingSectionShell
      title={t("dog.profile.card.trials.title")}
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
              {t("dog.profile.trials.copy.button")}
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
                    {hasWeather && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.trials.col.weather")}
                      </th>
                    )}
                    {hasAward && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.trials.col.class")}
                      </th>
                    )}
                    {hasRank && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.trials.col.rank")}
                      </th>
                    )}
                    {hasPoints && (
                      <th className="px-2 py-2 font-semibold">
                        {t("dog.profile.trials.col.points")}
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
                          href={getBeagleTrialHref(row.trialId)}
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
                      {hasWeather && (
                        <td className="px-2 py-2">
                          {row.weather ?? FALLBACK_VALUE}
                        </td>
                      )}
                      {hasAward && (
                        <td className="px-2 py-2">
                          {row.className ?? row.award ?? FALLBACK_VALUE}
                        </td>
                      )}
                      {hasRank && (
                        <td className="px-2 py-2">{formatRank(row.rank)}</td>
                      )}
                      {hasPoints && (
                        <td className="px-2 py-2">
                          {formatPoints(row.points)}
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
                      <Link
                        href={getBeagleTrialHref(row.trialId)}
                        className={cn(
                          "font-medium underline underline-offset-2",
                          beagleTheme.inkStrongText,
                        )}
                      >
                        {row.place}
                      </Link>
                    </p>
                    {hasWeather && (
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.trials.col.weather")}:
                        </span>{" "}
                        <span>{row.weather ?? FALLBACK_VALUE}</span>
                      </p>
                    )}
                    {hasAward && (
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.trials.col.class")}:
                        </span>{" "}
                        <span>
                          {row.className ?? row.award ?? FALLBACK_VALUE}
                        </span>
                      </p>
                    )}
                    {hasRank && (
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.trials.col.rank")}:
                        </span>{" "}
                        <span>{formatRank(row.rank)}</span>
                      </p>
                    )}
                    {hasPoints && (
                      <p>
                        <span className={beagleTheme.mutedText}>
                          {t("dog.profile.trials.col.points")}:
                        </span>{" "}
                        <span>{formatPoints(row.points)}</span>
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
