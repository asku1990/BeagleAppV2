import { prisma } from "../core/prisma";
import type { BeagleTrialDogRowDb } from "./types";

function toNumberOrNull(value: { toNumber(): number } | null): number | null {
  return value === null ? null : value.toNumber();
}

export async function getBeagleTrialsForDogDb(
  dogId: string,
): Promise<BeagleTrialDogRowDb[]> {
  const rows = await prisma.trialEntry.findMany({
    where: { dogId },
    select: {
      id: true,
      ke: true,
      lk: true,
      sija: true,
      piste: true,
      pa: true,
      tuom1: true,
      haku: true,
      hauk: true,
      yva: true,
      hlo: true,
      alo: true,
      tja: true,
      pin: true,
      trialEvent: {
        select: {
          koekunta: true,
          koepaiva: true,
          ylituomariNimi: true,
        },
      },
    },
    orderBy: [
      { trialEvent: { koepaiva: "desc" } },
      { trialEvent: { koekunta: "asc" } },
      { id: "asc" },
    ],
  });

  return rows.map((row) => ({
    id: row.id,
    place: row.trialEvent.koekunta,
    date: row.trialEvent.koepaiva,
    weather: row.ke,
    className: row.lk,
    classCode: row.lk,
    rank: row.sija,
    points: toNumberOrNull(row.piste),
    award: row.pa,
    judge: row.tuom1?.trim() || row.trialEvent.ylituomariNimi || null,
    haku: toNumberOrNull(row.haku),
    hauk: toNumberOrNull(row.hauk),
    yva: toNumberOrNull(row.yva),
    hlo: toNumberOrNull(row.hlo),
    alo: toNumberOrNull(row.alo),
    tja: toNumberOrNull(row.tja),
    pin: toNumberOrNull(row.pin),
  }));
}
