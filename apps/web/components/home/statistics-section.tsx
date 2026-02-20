"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsGridLoadingSkeleton } from "@/components/ui/stats-grid-loading-skeleton";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/i18n";
import { useI18n } from "@/hooks/i18n";
import { useHomeStatisticsQuery } from "@/queries/home/use-home-statistics-query";

type StatRow = {
  labelKey: MessageKey;
  valueId:
    | "registeredDogs"
    | "youngestRegistered"
    | "trialResultsPeriod"
    | "totalTrialEntries"
    | "trialPerformedByDogs"
    | "showResultsPeriod"
    | "totalShowEntries"
    | "showPerformedByDogs";
};

type StatGroup = {
  titleKey: MessageKey;
  rows: StatRow[];
};

const statGroups: StatGroup[] = [
  {
    titleKey: "home.stats.group.registrations",
    rows: [
      {
        labelKey: "home.stats.row.registeredDogs",
        valueId: "registeredDogs",
      },
      {
        labelKey: "home.stats.row.youngestRegistered",
        valueId: "youngestRegistered",
      },
    ],
  },
  {
    titleKey: "home.stats.group.trials",
    rows: [
      {
        labelKey: "home.stats.row.resultsPeriod",
        valueId: "trialResultsPeriod",
      },
      {
        labelKey: "home.stats.row.totalTrialEntries",
        valueId: "totalTrialEntries",
      },
      {
        labelKey: "home.stats.row.performedByDogs",
        valueId: "trialPerformedByDogs",
      },
    ],
  },
  {
    titleKey: "home.stats.group.shows",
    rows: [
      {
        labelKey: "home.stats.row.resultsPeriod",
        valueId: "showResultsPeriod",
      },
      {
        labelKey: "home.stats.row.totalShowEntries",
        valueId: "totalShowEntries",
      },
      {
        labelKey: "home.stats.row.performedByDogs",
        valueId: "showPerformedByDogs",
      },
    ],
  },
];

const cardClassName = cn(beagleTheme.subpanel, "px-4 py-3.5");
const rowClassName = cn(
  "grid grid-cols-[1fr_auto] items-center gap-3 border-b pb-2 last:border-b-0 last:pb-0",
  beagleTheme.border,
);

export function StatisticsSection() {
  const { t, locale } = useI18n();
  const { data, isError, isLoading } = useHomeStatisticsQuery();
  const hasNotifiedLoadError = useRef(false);
  const isInitialLoading = isLoading && !data;

  useEffect(() => {
    if (isError && !hasNotifiedLoadError.current) {
      toast.error(t("home.stats.fetchFailed"));
      hasNotifiedLoadError.current = true;
      return;
    }

    if (!isError) {
      hasNotifiedLoadError.current = false;
    }
  }, [isError, t]);

  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  const numberFormat = new Intl.NumberFormat(localeTag);
  const dateFormat = new Intl.DateTimeFormat(localeTag);
  const fallbackText = t("common.noData");

  const formatNumber = (value: number | null): string =>
    value == null ? fallbackText : numberFormat.format(value);

  const formatDate = (value: string | null): string => {
    if (!value) return fallbackText;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return fallbackText;
    return dateFormat.format(parsed);
  };

  const formatPeriod = (start: string | null, end: string | null): string => {
    if (!start || !end) return fallbackText;
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const valueMap: Record<StatRow["valueId"], string> = {
    registeredDogs: formatNumber(data?.registrations.registeredDogs ?? null),
    youngestRegistered: formatDate(
      data?.registrations.youngestRegisteredBirthDate ?? null,
    ),
    trialResultsPeriod: formatPeriod(
      data?.trials.resultsPeriodStart ?? null,
      data?.trials.resultsPeriodEnd ?? null,
    ),
    totalTrialEntries: formatNumber(data?.trials.totalEntries ?? null),
    trialPerformedByDogs: formatNumber(data?.trials.performedByDogs ?? null),
    showResultsPeriod: formatPeriod(
      data?.shows.resultsPeriodStart ?? null,
      data?.shows.resultsPeriodEnd ?? null,
    ),
    totalShowEntries: formatNumber(data?.shows.totalEntries ?? null),
    showPerformedByDogs: formatNumber(data?.shows.performedByDogs ?? null),
  };

  if (isInitialLoading) {
    return (
      <Card
        className={cn(beagleTheme.panel, "gap-0 overflow-hidden py-0")}
        aria-busy="true"
      >
        <CardHeader className="px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-4">
          <Skeleton className="h-7 w-48" aria-hidden="true" />
        </CardHeader>
        <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
          <StatsGridLoadingSkeleton
            cardClassName={cardClassName}
            rowClassName={beagleTheme.border}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(beagleTheme.panel, "gap-0 overflow-hidden py-0")}>
      <CardHeader className="px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-4">
        <CardTitle
          className={cn(beagleTheme.headingMd, beagleTheme.inkStrongText)}
        >
          {t("home.stats.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
        <div
          className="grid gap-3 md:grid-cols-2 lg:gap-4 xl:grid-cols-3"
          aria-busy={false}
        >
          {statGroups.map((group) => (
            <section
              key={group.titleKey}
              className={cardClassName}
              aria-label={t(group.titleKey)}
            >
              <h3
                className={cn(beagleTheme.headingSm, beagleTheme.inkStrongText)}
              >
                {t(group.titleKey)}
              </h3>
              <ul className="mt-2.5 space-y-2.5">
                {group.rows.map((row) => (
                  <li key={row.labelKey} className={rowClassName}>
                    <span
                      className={cn(beagleTheme.labelSm, beagleTheme.mutedText)}
                    >
                      {t(row.labelKey)}
                    </span>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-semibold",
                        beagleTheme.softAccent,
                        beagleTheme.inkStrongText,
                      )}
                    >
                      {valueMap[row.valueId]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
