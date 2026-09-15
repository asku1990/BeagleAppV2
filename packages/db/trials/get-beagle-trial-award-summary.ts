// Aggregates the legacy public PALKINTOSIJA comparison from canonical trial entries.
import { Prisma } from "@prisma/client";
import { prisma } from "../core/prisma";
import type { BeagleTrialAwardSummaryRowDb } from "./types";

export async function getBeagleTrialAwardSummaryDb(): Promise<
  BeagleTrialAwardSummaryRowDb[]
> {
  return prisma.$queryRaw<BeagleTrialAwardSummaryRowDb[]>(Prisma.sql`
    WITH entries AS (
      SELECT
        entry."id",
        entry."pa",
        CASE
          WHEN entry."lahde" = 'LEGACY_AKOEALL'
            AND UPPER(LEFT(entry."raakadataJson"::jsonb ->> 'SIJA', 2)) = 'PK'
            THEN 'long'
          WHEN entry."lahde" = 'LEGACY_AKOEALL'
            AND UPPER(LEFT(entry."raakadataJson"::jsonb ->> 'SIJA', 2)) != 'PK'
            THEN 'normal'
          WHEN entry."lahde" = 'LEGACY_AKOEALL' THEN NULL
          WHEN entry."koetyyppi" = 'PITKAKOE' THEN 'long'
          ELSE 'normal'
        END AS "trialType",
        event."koepaiva"
      FROM "TrialEntry" entry
      INNER JOIN "TrialEvent" event ON event."id" = entry."trialEventId"
      WHERE event."koepaiva" >= DATE '2005-08-20'
    )
    SELECT
      types."trialType",
      COUNT(entries."id") FILTER (WHERE entries."pa" = '1')::int AS "first",
      COUNT(entries."id") FILTER (WHERE entries."pa" = '2')::int AS "second",
      COUNT(entries."id") FILTER (WHERE entries."pa" = '3')::int AS "third",
      COUNT(entries."id") FILTER (WHERE entries."pa" = '0')::int AS "noPrize",
      COUNT(entries."id") FILTER (WHERE entries."pa" = 'L')::int AS "withdrew",
      COUNT(entries."id") FILTER (WHERE entries."pa" = 'S')::int AS "excluded",
      COUNT(entries."id")::int AS "total",
      MIN(entries."koepaiva") AS "firstDate",
      MAX(entries."koepaiva") AS "lastDate"
    FROM (VALUES ('normal'), ('long')) AS types("trialType")
    LEFT JOIN entries ON entries."trialType" = types."trialType"
    GROUP BY types."trialType"
    ORDER BY CASE types."trialType" WHEN 'normal' THEN 0 ELSE 1 END
  `);
}
