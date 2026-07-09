import type { BeagleDogTrialsSummaryDto } from "@beagle/contracts";
import type {
  BeagleTrialDogSummaryAggregateDb,
  BeagleTrialDogSummarySourceRowDb,
} from "@beagle/db";

type SummaryGroupKey = keyof BeagleDogTrialsSummaryDto;

const SUMMARY_GROUPS = [
  {
    key: "allTrials",
    dogRows: (rows: BeagleTrialDogSummarySourceRowDb[]) => rows,
  },
  {
    key: "drivenTrials",
    dogRows: (rows: BeagleTrialDogSummarySourceRowDb[]) =>
      rows.filter((row) => row.yva != null && row.yva > 0),
  },
  {
    key: "noPrize",
    dogRows: (rows: BeagleTrialDogSummarySourceRowDb[]) =>
      rows.filter((row) => row.pa === "0"),
  },
  {
    key: "prizePlacements",
    dogRows: (rows: BeagleTrialDogSummarySourceRowDb[]) =>
      rows.filter((row) => row.pa === "1" || row.pa === "2" || row.pa === "3"),
  },
  {
    key: "interrupted",
    dogRows: (rows: BeagleTrialDogSummarySourceRowDb[]) =>
      rows.filter((row) => row.pa === "L" || row.pa === "S"),
  },
] as const satisfies ReadonlyArray<{
  key: SummaryGroupKey;
  dogRows: (
    rows: BeagleTrialDogSummarySourceRowDb[],
  ) => BeagleTrialDogSummarySourceRowDb[];
}>;

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

function buildAggregateSummaryRow(
  label: "dog" | "breed",
  name: string,
  row: BeagleTrialDogSummaryAggregateDb,
): BeagleDogTrialsSummaryDto["allTrials"][number] {
  return {
    label,
    name,
    count: row.count,
    points: row.points == null ? null : roundAverage(row.points),
    haku: row.haku == null ? null : roundAverage(row.haku),
    hauk: row.hauk == null ? null : roundAverage(row.hauk),
    yva: row.yva == null ? null : roundAverage(row.yva),
    hlo: row.hlo == null ? null : roundAverage(row.hlo),
    alo: row.alo == null ? null : roundAverage(row.alo),
    mi: row.mi == null ? null : roundAverage(row.mi),
    pmi: row.pmi == null ? null : roundAverage(row.pmi),
  };
}

export function buildBeagleDogTrialsSummary(input: {
  dogName: string;
  dogRows: BeagleTrialDogSummarySourceRowDb[];
  breedSummaries: BeagleTrialDogSummaryAggregateDb[];
}): BeagleDogTrialsSummaryDto {
  const breedSummariesByGroup = new Map(
    input.breedSummaries.map((row) => [row.groupKey, row]),
  );

  return Object.fromEntries(
    SUMMARY_GROUPS.map((group) => {
      const dogRows = group.dogRows(input.dogRows);
      const rows: BeagleDogTrialsSummaryDto[SummaryGroupKey] = [];
      const breedSummary = breedSummariesByGroup.get(group.key);

      if (dogRows.length > 0) {
        rows.push(buildSummaryRow("dog", input.dogName, dogRows));
      }
      if (breedSummary) {
        rows.push(buildAggregateSummaryRow("breed", "KOKO ROTU", breedSummary));
      }

      return [group.key, rows];
    }),
  ) as BeagleDogTrialsSummaryDto;
}
