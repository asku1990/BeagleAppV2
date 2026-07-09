// Loads raw trial-entry source rows for the server-side Kokeet laaja summary.
import { prisma } from "../core/prisma";
import type {
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

  const [dogRows, breedRows] = await Promise.all([
    prisma.trialEntry.findMany({
      where: { dogId },
      select,
    }),
    prisma.trialEntry.findMany({
      select,
    }),
  ]);

  return {
    dogRows: mapSummarySourceRow(dogRows),
    breedRows: mapSummarySourceRow(breedRows),
  };
}
