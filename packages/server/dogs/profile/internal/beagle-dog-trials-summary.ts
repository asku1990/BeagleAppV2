import type { BeagleDogTrialsSummaryDto } from "@beagle/contracts";
import type { BeagleTrialDogSummarySourceRowDb } from "@beagle/db";

function roundAverage(value: number): number {
  return Math.round(value * 100) / 100;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return roundAverage(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function averageNullable(
  rows: BeagleTrialDogSummarySourceRowDb[],
  field: "haku" | "hauk" | "yva" | "hlo" | "alo",
  options?: { excludeZero?: boolean },
): number | null {
  return average(
    rows.flatMap((row) => {
      const value = row[field];
      if (value == null) return [];
      if (options?.excludeZero && value === 0) return [];
      return [value];
    }),
  );
}

function resolveMetsastysintoSummaryColumn(
  trialRuleWindowId: string | null,
): "mi" | "pmi" | null {
  switch (trialRuleWindowId) {
    case "trw_pre_20020801":
    case "trw_range_2002_2005":
      return "pmi";
    case "trw_range_2005_2011":
      return "mi";
    default:
      return null;
  }
}

function buildSummaryRow(
  label: "dog" | "breed",
  name: string,
  rows: BeagleTrialDogSummarySourceRowDb[],
): BeagleDogTrialsSummaryDto["allTrials"][number] {
  return {
    label,
    name,
    count: rows.length,
    points: average(rows.map((row) => row.piste ?? 0)),
    haku: averageNullable(rows, "haku"),
    hauk: averageNullable(rows, "hauk", { excludeZero: true }),
    yva: averageNullable(rows, "yva", { excludeZero: true }),
    hlo: averageNullable(rows, "hlo"),
    alo: averageNullable(rows, "alo"),
    mi: average(
      rows.flatMap((row) => {
        if (
          row.pin == null ||
          resolveMetsastysintoSummaryColumn(row.trialRuleWindowId) !== "mi"
        ) {
          return [];
        }
        return [row.pin];
      }),
    ),
    pmi: average(
      rows.flatMap((row) => {
        if (
          row.pin == null ||
          resolveMetsastysintoSummaryColumn(row.trialRuleWindowId) !== "pmi"
        ) {
          return [];
        }
        return [row.pin];
      }),
    ),
  };
}

export function buildBeagleDogTrialsSummary(input: {
  dogName: string;
  dogRows: BeagleTrialDogSummarySourceRowDb[];
  breedRows: BeagleTrialDogSummarySourceRowDb[];
}): BeagleDogTrialsSummaryDto {
  return {
    allTrials: [
      buildSummaryRow("dog", input.dogName, input.dogRows),
      buildSummaryRow("breed", "KOKO ROTU", input.breedRows),
    ],
  };
}
