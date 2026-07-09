// Loads raw trial-entry source rows for the server-side Kokeet laaja summary.
import { Prisma } from "@prisma/client";
import { prisma } from "../core/prisma";
import type {
  BeagleTrialDogSummaryAggregateDb,
  BeagleTrialDogSummaryGroupKeyDb,
  BeagleTrialDogSummarySourceDb,
  BeagleTrialDogSummarySourceRowDb,
} from "./types";

type DecimalLike = { toNumber(): number };

type SummarySourceRow = {
  pa: string | null;
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

type BreedSummaryAggregateRow = {
  groupKey: BeagleTrialDogSummaryGroupKeyDb;
  count: number;
  points: DecimalLike | null;
  haku: DecimalLike | null;
  hauk: DecimalLike | null;
  yva: DecimalLike | null;
  hlo: DecimalLike | null;
  alo: DecimalLike | null;
  mi: DecimalLike | null;
  pmi: DecimalLike | null;
};

function toNumber(value: DecimalLike | null): number | null {
  return value === null ? null : value.toNumber();
}

function mapSummarySourceRow(
  rows: SummarySourceRow[],
): BeagleTrialDogSummarySourceRowDb[] {
  return rows.map((row) => ({
    pa: row.pa,
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

function mapBreedSummaryAggregateRow(
  row: BreedSummaryAggregateRow,
): BeagleTrialDogSummaryAggregateDb {
  return {
    groupKey: row.groupKey,
    count: row.count,
    points: toNumber(row.points),
    haku: toNumber(row.haku),
    hauk: toNumber(row.hauk),
    yva: toNumber(row.yva),
    hlo: toNumber(row.hlo),
    alo: toNumber(row.alo),
    mi: toNumber(row.mi),
    pmi: toNumber(row.pmi),
  };
}

async function getBreedSummaryAggregatesDb(): Promise<
  BeagleTrialDogSummaryAggregateDb[]
> {
  const aggregateSelect = Prisma.sql`
    COUNT(*)::int AS "count",
    ROUND(AVG(COALESCE(entry."piste", 0)), 2) AS "points",
    ROUND(AVG(entry."haku"), 2) AS "haku",
    ROUND(AVG(NULLIF(entry."hauk", 0)), 2) AS "hauk",
    ROUND(AVG(NULLIF(entry."yva", 0)), 2) AS "yva",
    ROUND(AVG(entry."hlo"), 2) AS "hlo",
    ROUND(AVG(entry."alo"), 2) AS "alo",
    ROUND(AVG(CASE
      WHEN event."trialRuleWindowId" = 'trw_range_2005_2011'
      THEN entry."pin"
    END), 2) AS "mi",
    ROUND(AVG(CASE
      WHEN event."trialRuleWindowId" IN ('trw_pre_20020801', 'trw_range_2002_2005')
      THEN entry."pin"
    END), 2) AS "pmi"
  `;
  const aggregateFrom = Prisma.sql`
    FROM "TrialEntry" entry
    INNER JOIN "TrialEvent" event ON event."id" = entry."trialEventId"
  `;

  const rows = await prisma.$queryRaw<BreedSummaryAggregateRow[]>(Prisma.sql`
    SELECT 'allTrials' AS "groupKey", ${aggregateSelect}
    ${aggregateFrom}
    UNION ALL
    SELECT 'drivenTrials' AS "groupKey", ${aggregateSelect}
    ${aggregateFrom}
    WHERE entry."yva" > 0
    UNION ALL
    SELECT 'noPrize' AS "groupKey", ${aggregateSelect}
    ${aggregateFrom}
    WHERE entry."pa" = '0'
    UNION ALL
    SELECT 'prizePlacements' AS "groupKey", ${aggregateSelect}
    ${aggregateFrom}
    WHERE entry."pa" IN ('1', '2', '3')
    UNION ALL
    SELECT 'interrupted' AS "groupKey", ${aggregateSelect}
    ${aggregateFrom}
    WHERE entry."pa" IN ('L', 'S')
  `);

  return rows.map(mapBreedSummaryAggregateRow);
}

export async function getBeagleTrialSummarySourceForDogDb(
  dogId: string,
): Promise<BeagleTrialDogSummarySourceDb> {
  const select = {
    pa: true,
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

  const [dogRows, breedSummaries] = await Promise.all([
    prisma.trialEntry.findMany({
      where: { dogId },
      select,
    }),
    getBreedSummaryAggregatesDb(),
  ]);

  return {
    dogRows: mapSummarySourceRow(dogRows),
    breedSummaries,
  };
}
