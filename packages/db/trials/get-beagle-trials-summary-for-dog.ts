// Loads raw trial-entry source rows for the server-side Kokeet laaja summary.
import { prisma } from "../core/prisma";
import type {
  BeagleTrialDogSummaryAggregateDb,
  BeagleTrialDogSummarySourceDb,
  BeagleTrialDogSummarySourceRowDb,
} from "./types";

type DecimalLike = { toNumber(): number };

type SummarySourceRow = {
  piste: DecimalLike | null;
  haku: DecimalLike | null;
  hauk: DecimalLike | null;
  yva: DecimalLike | null;
  hlo: DecimalLike | null;
  alo: DecimalLike | null;
  pin: DecimalLike | null;
  trialEvent: {
    trialRuleWindowId: string | null;
  };
};

function toNumber(value: DecimalLike | null): number | null {
  return value === null ? null : value.toNumber();
}

function averageSumOverCount(
  sum: DecimalLike | null,
  count: number,
): number | null {
  if (count === 0) return null;
  return (toNumber(sum) ?? 0) / count;
}

function mapSummarySourceRow(
  rows: SummarySourceRow[],
): BeagleTrialDogSummarySourceRowDb[] {
  return rows.map((row) => ({
    piste: toNumber(row.piste),
    haku: toNumber(row.haku),
    hauk: toNumber(row.hauk),
    yva: toNumber(row.yva),
    hlo: toNumber(row.hlo),
    alo: toNumber(row.alo),
    pin: toNumber(row.pin),
    trialRuleWindowId: row.trialEvent.trialRuleWindowId,
  }));
}

async function getBreedSummaryAggregateDb(): Promise<BeagleTrialDogSummaryAggregateDb> {
  const [
    pointsAggregate,
    normalAverages,
    haukAverage,
    yvaAverage,
    miAverage,
    pmiAverage,
  ] = await Promise.all([
    prisma.trialEntry.aggregate({
      _count: { _all: true },
      _sum: { piste: true },
    }),
    prisma.trialEntry.aggregate({
      _avg: {
        haku: true,
        hlo: true,
        alo: true,
      },
    }),
    prisma.trialEntry.aggregate({
      where: { hauk: { not: 0 } },
      _avg: { hauk: true },
    }),
    prisma.trialEntry.aggregate({
      where: { yva: { not: 0 } },
      _avg: { yva: true },
    }),
    prisma.trialEntry.aggregate({
      where: {
        trialEvent: {
          trialRuleWindowId: "trw_range_2005_2011",
        },
      },
      _avg: { pin: true },
    }),
    prisma.trialEntry.aggregate({
      where: {
        trialEvent: {
          trialRuleWindowId: {
            in: ["trw_pre_20020801", "trw_range_2002_2005"],
          },
        },
      },
      _avg: { pin: true },
    }),
  ]);

  const count = pointsAggregate._count._all;

  return {
    count,
    points: averageSumOverCount(pointsAggregate._sum.piste, count),
    haku: toNumber(normalAverages._avg.haku),
    hauk: toNumber(haukAverage._avg.hauk),
    yva: toNumber(yvaAverage._avg.yva),
    hlo: toNumber(normalAverages._avg.hlo),
    alo: toNumber(normalAverages._avg.alo),
    mi: toNumber(miAverage._avg.pin),
    pmi: toNumber(pmiAverage._avg.pin),
  };
}

export async function getBeagleTrialSummarySourceForDogDb(
  dogId: string,
): Promise<BeagleTrialDogSummarySourceDb> {
  const select = {
    piste: true,
    haku: true,
    hauk: true,
    yva: true,
    hlo: true,
    alo: true,
    pin: true,
    trialEvent: {
      select: {
        trialRuleWindowId: true,
      },
    },
  } as const;

  const [dogRows, breedSummary] = await Promise.all([
    prisma.trialEntry.findMany({
      where: { dogId },
      select,
    }),
    getBreedSummaryAggregateDb(),
  ]);

  return {
    dogRows: mapSummarySourceRow(dogRows),
    breedSummary,
  };
}
