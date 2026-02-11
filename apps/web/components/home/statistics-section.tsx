"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n, type MessageKey } from "@/lib/i18n";

type StatRow = {
  labelKey: MessageKey;
  valueKey: MessageKey;
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
        valueKey: "common.dataPending",
      },
      {
        labelKey: "home.stats.row.youngestRegistered",
        valueKey: "common.dataPending",
      },
    ],
  },
  {
    titleKey: "home.stats.group.trials",
    rows: [
      {
        labelKey: "home.stats.row.resultsPeriod",
        valueKey: "common.dataPending",
      },
      {
        labelKey: "home.stats.row.totalTrialEntries",
        valueKey: "common.dataPending",
      },
      {
        labelKey: "home.stats.row.performedByDogs",
        valueKey: "common.dataPending",
      },
    ],
  },
  {
    titleKey: "home.stats.group.shows",
    rows: [
      {
        labelKey: "home.stats.row.resultsPeriod",
        valueKey: "common.dataPending",
      },
      {
        labelKey: "home.stats.row.totalShowEntries",
        valueKey: "common.dataPending",
      },
      {
        labelKey: "home.stats.row.performedByDogs",
        valueKey: "common.dataPending",
      },
    ],
  },
];

export function StatisticsSection() {
  const { t } = useI18n();

  return (
    <Card className="beagle-panel gap-0 overflow-hidden py-0">
      <CardHeader className="px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-4">
        <CardTitle className="text-xl text-[var(--beagle-ink)]">
          {t("home.stats.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-5 pb-5 md:px-6 md:pb-6">
        <div className="grid gap-3 md:grid-cols-2 lg:gap-4 xl:grid-cols-3">
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
                      {t(row.valueKey)}
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
