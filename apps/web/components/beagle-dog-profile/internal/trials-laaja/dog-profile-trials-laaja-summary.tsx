"use client";

import { Fragment } from "react";
import type { BeagleDogTrialsSummaryDto } from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

const SUMMARY_GROUPS = [
  {
    key: "allTrials",
    titleKey: "dog.profile.trials.summary.group.allTrials",
  },
  {
    key: "drivenTrials",
    titleKey: "dog.profile.trials.summary.group.drivenTrials",
  },
  {
    key: "noPrize",
    titleKey: "dog.profile.trials.summary.group.noPrize",
  },
  {
    key: "prizePlacements",
    titleKey: "dog.profile.trials.summary.group.prizePlacements",
  },
  {
    key: "interrupted",
    titleKey: "dog.profile.trials.summary.group.interrupted",
  },
] as const;

const SUMMARY_VALUE_KEYS = [
  {
    key: "points",
    labelKey: "dog.profile.trials.col.points",
  },
  {
    key: "haku",
    labelKey: "trials.details.copy.col.searchWork",
  },
  {
    key: "hauk",
    labelKey: "trials.details.copy.col.barking",
  },
  {
    key: "yva",
    labelKey: "trials.details.copy.col.ajotaito",
  },
  {
    key: "hlo",
    labelKey: "trials.details.copy.col.searchLoosenessPenalty",
  },
  {
    key: "alo",
    labelKey: "trials.details.copy.col.chaseLoosenessPenalty",
  },
  {
    key: "mi",
    labelKey: "dog.profile.trials.summary.col.mi",
  },
  {
    key: "pmi",
    labelKey: "dog.profile.trials.summary.col.pmi",
  },
] as const;

type SummaryGroup = (typeof SUMMARY_GROUPS)[number];
type SummaryRow = BeagleDogTrialsSummaryDto[SummaryGroup["key"]][number];
type Translate = ReturnType<typeof useI18n>["t"];

function formatSummaryNumber(value: number | null): string {
  return value == null ? "-" : value.toFixed(2);
}

function SummaryDesktopTable({
  visibleGroups,
  summary,
  t,
}: {
  visibleGroups: SummaryGroup[];
  summary: BeagleDogTrialsSummaryDto;
  t: Translate;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-sm">
        <tbody>
          {visibleGroups.map((group) => (
            <Fragment key={group.key}>
              <tr
                className={cn(
                  "border-b text-left",
                  beagleTheme.border,
                  beagleTheme.softAccent,
                  beagleTheme.inkStrongText,
                )}
              >
                <th className="px-2 py-2 font-semibold">
                  {t("dog.profile.trials.summary.col.target")}
                </th>
                <th className="px-2 py-2 font-semibold">{t(group.titleKey)}</th>
                {SUMMARY_VALUE_KEYS.map((valueKey) => (
                  <th key={valueKey.key} className="px-2 py-2 font-semibold">
                    {t(valueKey.labelKey)}
                  </th>
                ))}
              </tr>
              {summary[group.key].map((row) => (
                <tr
                  key={row.label}
                  className={cn("border-b align-top", beagleTheme.border)}
                >
                  <td className="px-2 py-2 font-medium">{row.name}</td>
                  <td className="px-2 py-2">
                    {row.count} {t("dog.profile.trials.summary.unit.count")}
                  </td>
                  {SUMMARY_VALUE_KEYS.map((valueKey) => (
                    <td key={valueKey.key} className="px-2 py-2">
                      {formatSummaryNumber(row[valueKey.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SummaryMobileRow({ row, t }: { row: SummaryRow; t: Translate }) {
  return (
    <article
      className={cn(
        "rounded-lg border p-3",
        beagleTheme.border,
        beagleTheme.surface,
      )}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className={cn("text-sm font-semibold", beagleTheme.inkStrongText)}>
          {row.name}
        </h3>
        <p className={cn("shrink-0 text-xs", beagleTheme.mutedText)}>
          {row.count} {t("dog.profile.trials.summary.unit.count")}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        {SUMMARY_VALUE_KEYS.map((valueKey) => (
          <div key={valueKey.key} className="flex justify-between gap-2">
            <dt className={beagleTheme.mutedText}>{t(valueKey.labelKey)}</dt>
            <dd className={beagleTheme.inkText}>
              {formatSummaryNumber(row[valueKey.key])}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

function SummaryMobileList({
  visibleGroups,
  summary,
  t,
}: {
  visibleGroups: SummaryGroup[];
  summary: BeagleDogTrialsSummaryDto;
  t: Translate;
}) {
  return (
    <div className="space-y-3">
      {visibleGroups.map((group) => (
        <section key={group.key} className="space-y-2">
          <h3
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-semibold",
              beagleTheme.border,
              beagleTheme.softAccent,
              beagleTheme.inkStrongText,
            )}
          >
            {t(group.titleKey)}
          </h3>
          <div className="space-y-2">
            {summary[group.key].map((row) => (
              <SummaryMobileRow
                key={`${group.key}-${row.label}`}
                row={row}
                t={t}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function DogProfileTrialsLaajaSummary({
  summary,
}: {
  summary: BeagleDogTrialsSummaryDto;
}) {
  const { t } = useI18n();
  const visibleGroups = SUMMARY_GROUPS.filter(
    (group) => summary[group.key].length > 0,
  );

  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <ListingSectionShell title={t("dog.profile.trials.summary.title")}>
      <ListingResponsiveResults
        desktop={
          <SummaryDesktopTable
            visibleGroups={visibleGroups}
            summary={summary}
            t={t}
          />
        }
        mobile={
          <SummaryMobileList
            visibleGroups={visibleGroups}
            summary={summary}
            t={t}
          />
        }
      />
    </ListingSectionShell>
  );
}
