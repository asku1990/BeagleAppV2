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
  filterLabel,
}: {
  summary: BeagleTrialSearchSummary;
  filterLabel: string;
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
      <p className={cn("text-sm", beagleTheme.mutedText)}>
        {`${t("trials.searchSummary.row.trials")}: ${summary.trialCount} ${t("trials.searchSummary.unit.count")} · ${t("trials.searchSummary.row.entries")}: ${summary.entryCount} ${t("trials.searchSummary.unit.count")} · ${filterLabel}`}
      </p>

      <div className="mt-3">
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
                <th className="px-3 py-2 text-left font-normal">{row.label}</th>
                <td className="px-3 py-2 text-right font-normal tabular-nums">
                  {summary[row.key].count}
                </td>
                <td className="px-3 py-2 text-right font-normal tabular-nums">
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
