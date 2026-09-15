"use client";

import type { BeagleTrialSearchSummary } from "@beagle/contracts";
import { ListingSectionShell } from "@/components/listing";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

type OutcomeKey =
  | "awarded"
  | "first"
  | "second"
  | "third"
  | "noPrize"
  | "withdrew"
  | "excluded";

export function BeagleTrialsSearchSummary({
  summary,
}: {
  summary: BeagleTrialSearchSummary;
}) {
  const { t } = useI18n();

  if (summary.entryCount === 0) return null;

  const rows: Array<{ key: OutcomeKey; label: string }> = [
    { key: "awarded", label: t("trials.searchSummary.row.awarded") },
    { key: "first", label: t("trials.searchSummary.row.first") },
    { key: "second", label: t("trials.searchSummary.row.second") },
    { key: "third", label: t("trials.searchSummary.row.third") },
    { key: "noPrize", label: t("trials.searchSummary.row.noPrize") },
    { key: "withdrew", label: t("trials.searchSummary.row.withdrew") },
    { key: "excluded", label: t("trials.searchSummary.row.excluded") },
  ];

  return (
    <ListingSectionShell title={t("trials.searchSummary.title")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className={cn(
            "rounded-lg border px-4 py-3",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <p className={cn("text-xs", beagleTheme.mutedText)}>
            {t("trials.searchSummary.row.trials")}
          </p>
          <p
            className={cn(
              "mt-1 text-xl font-semibold",
              beagleTheme.inkStrongText,
            )}
          >
            {summary.trialCount}{" "}
            <span className="text-sm font-normal">
              {t("trials.searchSummary.unit.count")}
            </span>
          </p>
        </div>
        <div
          className={cn(
            "rounded-lg border px-4 py-3",
            beagleTheme.border,
            beagleTheme.surface,
          )}
        >
          <p className={cn("text-xs", beagleTheme.mutedText)}>
            {t("trials.searchSummary.row.entries")}
          </p>
          <p
            className={cn(
              "mt-1 text-xl font-semibold",
              beagleTheme.inkStrongText,
            )}
          >
            {summary.entryCount}{" "}
            <span className="text-sm font-normal">
              {t("trials.searchSummary.unit.count")}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className={cn("border-b text-left", beagleTheme.border)}>
              <th className="px-3 py-2 font-semibold" />
              <th className="px-3 py-2 text-right font-semibold">
                {t("trials.searchSummary.unit.count")}
              </th>
              <th className="px-3 py-2 text-right font-semibold">%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.key}
                className={cn(
                  "border-b",
                  beagleTheme.border,
                  index % 2 === 0 ? beagleTheme.surface : "bg-transparent",
                )}
              >
                <th className="px-3 py-2 text-left font-medium">{row.label}</th>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">
                  {summary[row.key].count}
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums">
                  {summary[row.key].percentage.toFixed(2)} %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListingSectionShell>
  );
}
