"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n, type MessageKey } from "@/lib/i18n";
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

export function StatisticsSection() {
  const { t, locale } = useI18n();
  const { data, isError, isLoading } = useHomeStatisticsQuery();
  const isInitialLoading = isLoading && !data;

  const localeTag = locale === "fi" ? "fi-FI" : "sv-SE";
  const numberFormat = new Intl.NumberFormat(localeTag);
  const dateFormat = new Intl.DateTimeFormat(localeTag);
  const fallbackText = isError
    ? t("common.dataUnavailable")
    : t("common.dataPending");

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
        className="beagle-panel gap-0 overflow-hidden py-0"
        aria-busy="true"
      >
        <CardHeader className="px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-4">
          <Skeleton className="h-7 w-48" aria-hidden="true" />
        </CardHeader>
        <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
          <div className="grid gap-3 md:grid-cols-2 lg:gap-4 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <section
                key={cardIndex}
                className="rounded-xl border border-[var(--beagle-border)] bg-white px-4 py-3.5 shadow-sm"
                aria-hidden="true"
              >
                <Skeleton className="h-5 w-28" />
                <div className="mt-2.5 space-y-2.5">
                  {Array.from({ length: cardIndex === 0 ? 2 : 3 }).map(
                    (_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--beagle-border)] pb-2 last:border-b-0 last:pb-0"
                      >
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-16 rounded-md" />
                      </div>
                    ),
                  )}
                </div>
              </section>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="beagle-panel gap-0 overflow-hidden py-0">
      <CardHeader className="px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-4">
        <CardTitle className="text-xl text-[var(--beagle-ink)]">
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
              className="rounded-xl border border-[var(--beagle-border)] bg-white px-4 py-3.5 shadow-sm"
              aria-label={t(group.titleKey)}
            >
              <h3 className="text-base font-semibold text-[var(--beagle-ink)]">
                {t(group.titleKey)}
              </h3>
              <ul className="mt-2.5 space-y-2.5">
                {group.rows.map((row) => (
                  <li
                    key={row.labelKey}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-[var(--beagle-border)] pb-2 last:border-b-0 last:pb-0"
                  >
                    <span className="text-sm leading-5 text-[var(--beagle-muted)]">
                      {t(row.labelKey)}
                    </span>
                    <span className="rounded-md bg-[var(--beagle-accent-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--beagle-ink)]">
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
