// Aggregates outcome counts for the active public trial-search date range.
import { Prisma } from "@prisma/client";
import { prisma } from "../core/prisma";
import type { BeagleTrialSearchSummaryDb } from "./types";

export async function getBeagleTrialSearchSummaryDb(input: {
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<BeagleTrialSearchSummaryDb> {
  const dateWhere =
    input.dateFrom && input.dateTo
      ? Prisma.sql`WHERE event."koepaiva" >= ${input.dateFrom} AND event."koepaiva" < ${input.dateTo}`
      : Prisma.empty;

  const rows = await prisma.$queryRaw<BeagleTrialSearchSummaryDb[]>(Prisma.sql`
    SELECT
      COUNT(DISTINCT event."id")::int AS "trialCount",
      COUNT(entry."id")::int AS "entryCount",
      COUNT(entry."id") FILTER (WHERE entry."pa" IN ('1', '2', '3'))::int AS "awarded",
      COUNT(entry."id") FILTER (WHERE entry."pa" = '1')::int AS "first",
      COUNT(entry."id") FILTER (WHERE entry."pa" = '2')::int AS "second",
      COUNT(entry."id") FILTER (WHERE entry."pa" = '3')::int AS "third",
      COUNT(entry."id") FILTER (WHERE entry."pa" = '0')::int AS "noPrize",
      COUNT(entry."id") FILTER (WHERE entry."pa" = 'L')::int AS "withdrew",
      COUNT(entry."id") FILTER (WHERE entry."pa" = 'S')::int AS "excluded"
    FROM "TrialEvent" event
    INNER JOIN "TrialEntry" entry ON entry."trialEventId" = event."id"
    ${dateWhere}
  `);

  return (
    rows[0] ?? {
      trialCount: 0,
      entryCount: 0,
      awarded: 0,
      first: 0,
      second: 0,
      third: 0,
      noPrize: 0,
      withdrew: 0,
      excluded: 0,
    }
  );
}
