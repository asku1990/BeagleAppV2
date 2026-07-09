"use client";

import type { BeagleDogTrialsSummaryDto } from "@beagle/contracts";
import { beagleTheme } from "@/components/ui/beagle-theme";
import { useI18n } from "@/hooks/i18n";
import { cn } from "@/lib/utils";

function formatSummaryNumber(value: number | null): string {
  return value == null ? "-" : value.toFixed(2);
}

export function DogProfileTrialsLaajaSummary({
  summary,
}: {
  summary: BeagleDogTrialsSummaryDto;
}) {
  const { t } = useI18n();

  if (summary.allTrials.length === 0) {
    return null;
  }

  return (
    <section className="mt-6">
      <div
        className={cn("border-t pt-4", beagleTheme.border, beagleTheme.inkText)}
      >
        <h2
          className={cn(
            "mb-3 text-base font-semibold",
            beagleTheme.inkStrongText,
          )}
        >
          {t("dog.profile.trials.summary.title")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className={cn("border-b text-left", beagleTheme.border)}>
                <th className="px-2 py-2 font-semibold">
                  {t("dog.profile.trials.summary.col.target")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("dog.profile.trials.summary.group.allTrials")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("dog.profile.trials.col.points")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("trials.details.copy.col.searchWork")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("trials.details.copy.col.barking")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("trials.details.copy.col.ajotaito")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("trials.details.copy.col.searchLoosenessPenalty")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("trials.details.copy.col.chaseLoosenessPenalty")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("dog.profile.trials.summary.col.mi")}
                </th>
                <th className="px-2 py-2 font-semibold">
                  {t("dog.profile.trials.summary.col.pmi")}
                </th>
              </tr>
            </thead>
            <tbody>
              {summary.allTrials.map((row) => (
                <tr
                  key={row.label}
                  className={cn("border-b align-top", beagleTheme.border)}
                >
                  <td className="px-2 py-2 font-medium">{row.name}</td>
                  <td className="px-2 py-2">
                    {row.count} {t("dog.profile.trials.summary.unit.count")}
                  </td>
                  <td className="px-2 py-2">
                    {formatSummaryNumber(row.points)}
                  </td>
                  <td className="px-2 py-2">{formatSummaryNumber(row.haku)}</td>
                  <td className="px-2 py-2">{formatSummaryNumber(row.hauk)}</td>
                  <td className="px-2 py-2">{formatSummaryNumber(row.yva)}</td>
                  <td className="px-2 py-2">{formatSummaryNumber(row.hlo)}</td>
                  <td className="px-2 py-2">{formatSummaryNumber(row.alo)}</td>
                  <td className="px-2 py-2">{formatSummaryNumber(row.mi)}</td>
                  <td className="px-2 py-2">{formatSummaryNumber(row.pmi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
