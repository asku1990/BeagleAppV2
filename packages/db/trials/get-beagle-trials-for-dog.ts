import { prisma } from "../core/prisma";
import type { BeagleTrialDogRowDb } from "./types";

function toNumberOrNull(value: { toNumber(): number } | null): number | null {
  return value === null ? null : value.toNumber();
}

export async function getBeagleTrialsForDogDb(
  dogId: string,
  options?: { includeEras?: boolean },
): Promise<BeagleTrialDogRowDb[]> {
  const rows = await prisma.trialEntry.findMany({
    where: { dogId },
    select: {
      id: true,
      ke: true,
      koetyyppi: true,
      lk: true,
      sija: true,
      koiriaLuokassa: true,
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
      ...(options?.includeEras
        ? {
            eras: {
              orderBy: { era: "asc" },
              select: {
                era: true,
                alkoi: true,
                hakumin: true,
                ajomin: true,
                haku: true,
                hauk: true,
                yva: true,
                hlo: true,
                alo: true,
                tja: true,
                pin: true,
                huomautusTeksti: true,
              },
            },
          }
        : {}),
      trialEvent: {
        select: {
          id: true,
          trialRuleWindowId: true,
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
    trialEventId: row.trialEvent.id,
    trialRuleWindowId: row.trialEvent.trialRuleWindowId,
    place: row.trialEvent.koekunta,
    date: row.trialEvent.koepaiva,
    weather: row.ke,
    koetyyppi: row.koetyyppi,
    classCode: row.lk,
    rank: row.sija,
    koiriaLuokassa: row.koiriaLuokassa,
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
    eras:
      "eras" in row && Array.isArray(row.eras)
        ? row.eras.map((era) => ({
            era: era.era,
            alkoi: era.alkoi,
            hakumin: era.hakumin,
            ajomin: era.ajomin,
            haku: toNumberOrNull(era.haku),
            hauk: toNumberOrNull(era.hauk),
            yva: toNumberOrNull(era.yva),
            hlo: toNumberOrNull(era.hlo),
            alo: toNumberOrNull(era.alo),
            tja: toNumberOrNull(era.tja),
            pin: toNumberOrNull(era.pin),
            huomautusTeksti: era.huomautusTeksti,
          }))
        : undefined,
  }));
}
