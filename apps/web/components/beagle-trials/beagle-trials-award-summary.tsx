"use client";

import type {
  BeagleTrialAwardSummary,
  BeagleTrialAwardSummaryRow,
  BeagleTrialAwardSummaryValue,
} from "@beagle/contracts";
import {
  ListingResponsiveResults,
  ListingSectionShell,
} from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { formatIsoDateForDisplay } from "@/lib/public/beagle/trials";
import { cn } from "@/lib/utils";

type TrialTypeLabel = (
  trialType: BeagleTrialAwardSummaryRow["trialType"],
) => string;
type AwardValueKey =
  | "first"
  | "second"
  | "third"
  | "noPrize"
  | "withdrew"
  | "excluded"
  | "awarded";
type AwardColumn = {
  key: AwardValueKey;
  label: string;
};

function formatValue(value: BeagleTrialAwardSummaryValue): string {
  return `${value.count} (${value.percentage.toFixed(2)}%)`;
}

function AwardSummaryDesktop({
  rows,
  trialTypeLabel,
  columns,
  trialTypeHeading,
  totalHeading,
}: {
  rows: BeagleTrialAwardSummaryRow[];
  trialTypeLabel: TrialTypeLabel;
  columns: AwardColumn[];
  trialTypeHeading: string;
  totalHeading: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-190 border-collapse text-sm">
        <thead>
          <tr className={cn("border-b text-left", beagleTheme.border)}>
            <th className="px-2 py-2 font-semibold">{trialTypeHeading}</th>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-2 py-2 text-center font-semibold"
              >
                {column.label}
              </th>
            ))}
            <th className="px-2 py-2 text-center font-semibold">
              {totalHeading}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.trialType}
              className={cn("border-b", beagleTheme.border)}
            >
              <th className="px-2 py-2 text-left font-medium">
                {trialTypeLabel(row.trialType)}
              </th>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-2 py-2 text-center tabular-nums"
                >
                  {formatValue(row[column.key])}
                </td>
              ))}
              <td className="px-2 py-2 text-center tabular-nums">
                {row.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AwardSummaryMobile({
  rows,
  trialTypeLabel,
  columns,
  totalHeading,
}: {
  rows: BeagleTrialAwardSummaryRow[];
  trialTypeLabel: TrialTypeLabel;
  columns: AwardColumn[];
  totalHeading: string;
}) {
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <article
          key={row.trialType}
          className={cn(
            "rounded-lg border p-3",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className={cn("font-semibold", beagleTheme.inkStrongText)}>
              {trialTypeLabel(row.trialType)}
            </h3>
            <span className={cn("text-xs", beagleTheme.mutedText)}>
              {totalHeading} {row.total}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between gap-2">
                <dt className={beagleTheme.mutedText}>{column.label}</dt>
                <dd className="tabular-nums">{formatValue(row[column.key])}</dd>
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}

export function BeagleTrialsAwardSummary({
  summary,
}: {
  summary: BeagleTrialAwardSummary;
}) {
  const { t, locale } = useI18n();

  if (summary.rows.length === 0) return null;

  const trialTypeLabel: TrialTypeLabel = (trialType) =>
    t(`trials.awardSummary.trialType.${trialType}`);
  const columns: AwardColumn[] = [
    { key: "first", label: "1" },
    { key: "second", label: "2" },
    { key: "third", label: "3" },
    { key: "noPrize", label: "0" },
    {
      key: "withdrew",
      label: t("trials.awardSummary.col.withdrew"),
    },
    {
      key: "excluded",
      label: t("trials.awardSummary.col.excluded"),
    },
    {
      key: "awarded",
      label: t("trials.awardSummary.col.awarded"),
    },
  ];
  const dateRange =
    summary.dateFrom && summary.dateTo
      ? `${formatIsoDateForDisplay(summary.dateFrom, locale)} - ${formatIsoDateForDisplay(summary.dateTo, locale)}`
      : undefined;

  return (
    <ListingSectionShell
      title={t("trials.awardSummary.title")}
      count={
        dateRange ? (
          <span>
            {t("trials.awardSummary.comparison")} {dateRange}
          </span>
        ) : undefined
      }
    >
      <ListingResponsiveResults
        desktop={
          <AwardSummaryDesktop
            rows={summary.rows}
            trialTypeLabel={trialTypeLabel}
            columns={columns}
            trialTypeHeading={t("trials.awardSummary.col.trialType")}
            totalHeading={t("trials.awardSummary.col.total")}
          />
        }
        mobile={
          <AwardSummaryMobile
            rows={summary.rows}
            trialTypeLabel={trialTypeLabel}
            columns={columns}
            totalHeading={t("trials.awardSummary.col.total")}
          />
        }
      />
    </ListingSectionShell>
  );
}
