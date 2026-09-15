// Maps persisted award counts into the public comparison DTO.
import type { BeagleTrialAwardSummary } from "@beagle/contracts";
import type { BeagleTrialAwardSummaryRowDb } from "@beagle/db";
import { formatTrialDateOnly } from "../core/date-only";

function percentage(count: number, total: number): number {
  return total === 0 ? 0 : (count / total) * 100;
}

export function mapBeagleTrialAwardSummary(
  sourceRows: BeagleTrialAwardSummaryRowDb[],
): BeagleTrialAwardSummary {
  if (sourceRows.every((row) => row.total === 0)) {
    return { dateFrom: null, dateTo: null, rows: [] };
  }

  const dates = sourceRows.flatMap((row) =>
    row.firstDate && row.lastDate ? [row.firstDate, row.lastDate] : [],
  );
  const dateFrom = dates.length
    ? new Date(Math.min(...dates.map((date) => date.getTime())))
    : null;
  const dateTo = dates.length
    ? new Date(Math.max(...dates.map((date) => date.getTime())))
    : null;

  return {
    dateFrom: dateFrom ? formatTrialDateOnly(dateFrom) : null,
    dateTo: dateTo ? formatTrialDateOnly(dateTo) : null,
    rows: sourceRows.map((row) => {
      const awarded = row.first + row.second + row.third;
      const value = (count: number) => ({
        count,
        percentage: percentage(count, row.total),
      });

      return {
        trialType: row.trialType,
        first: value(row.first),
        second: value(row.second),
        third: value(row.third),
        noPrize: value(row.noPrize),
        withdrew: value(row.withdrew),
        excluded: value(row.excluded),
        awarded: value(awarded),
        total: row.total,
      };
    }),
  };
}
