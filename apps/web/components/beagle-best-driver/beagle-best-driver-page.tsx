"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FeatureHeroHeader } from "@/components/layout";
import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { useBestDriverRankingQuery } from "@/queries/public/beagle/competitions/best-driver";
import { cn } from "@/lib/utils";
import { BestDriverResults } from "./best-driver-results";
import { BestDriverRulesDialog } from "./best-driver-rules-dialog";

function readSeason(value: string | null): number | undefined {
  if (!value || !/^\d{4}$/.test(value)) return undefined;
  const season = Number.parseInt(value, 10);
  return season >= 1900 && season <= 2100 ? season : undefined;
}

function seasonLabel(season: number): string {
  return `${season}–${season + 1}`;
}

export function BeagleBestDriverPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSeason = useMemo(
    () => readSeason(searchParams.get("season")),
    [searchParams],
  );
  const rankingQuery = useBestDriverRankingQuery({ season: requestedSeason });
  const data = rankingQuery.data;

  return (
    <>
      <FeatureHeroHeader
        title={t("bestDriver.page.title")}
        description={t("bestDriver.page.description")}
        logoAlt={t("bestDriver.page.logoAlt")}
      />

      <section
        className={cn(
          beagleTheme.panel,
          "flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-end sm:justify-between md:px-6",
        )}
      >
        <label className="grid max-w-xs gap-1 text-sm font-medium">
          {t("bestDriver.season.label")}
          <select
            className={cn(
              "h-10 rounded-md border px-3",
              beagleTheme.border,
              beagleTheme.surface,
              beagleTheme.focusRing,
            )}
            value={data?.season ?? requestedSeason ?? ""}
            disabled={!data}
            onChange={(event) => {
              router.replace(
                `/beagle/best-driver?season=${event.target.value}`,
              );
            }}
          >
            {(data?.availableSeasons ?? []).map((season) => (
              <option key={season} value={season}>
                {seasonLabel(season)}
              </option>
            ))}
          </select>
        </label>
        <BestDriverRulesDialog />
      </section>

      <ListingSectionShell
        title={t("bestDriver.results.title")}
        count={
          data
            ? t("bestDriver.results.count").replace(
                "{count}",
                String(data.items.length),
              )
            : undefined
        }
      >
        {rankingQuery.isPending ? (
          <div className="space-y-3" aria-label="Loading">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={cn(
                  "h-12 animate-pulse rounded-md",
                  beagleTheme.softAccent,
                )}
              />
            ))}
          </div>
        ) : rankingQuery.isError ? (
          <p className="py-6 text-center text-sm" role="alert">
            {t("bestDriver.error")}
          </p>
        ) : data && data.items.length > 0 ? (
          <BestDriverResults rows={data.items} />
        ) : (
          <p className={cn("py-8 text-center text-sm", beagleTheme.mutedText)}>
            {t("bestDriver.empty")}
          </p>
        )}
      </ListingSectionShell>
    </>
  );
}
