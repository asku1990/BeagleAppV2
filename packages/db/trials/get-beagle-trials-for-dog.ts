import { prisma } from "../core/prisma";
import type { BeagleTrialDogRowDb } from "./types";

export async function getBeagleTrialsForDogDb(
  dogId: string,
): Promise<BeagleTrialDogRowDb[]> {
  const rows = await prisma.trialResult.findMany({
    where: { dogId },
    select: {
      id: true,
      eventPlace: true,
      eventDate: true,
      ke: true,
      eventName: true,
      lk: true,
      sija: true,
      piste: true,
      pa: true,
      judge: true,
      haku: true,
      hauk: true,
      yva: true,
      hlo: true,
      alo: true,
      tja: true,
      pin: true,
    },
    orderBy: [{ eventDate: "desc" }, { eventPlace: "asc" }, { id: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    place: row.eventPlace,
    date: row.eventDate,
    weather: row.ke,
    className: row.eventName,
    classCode: row.lk,
    rank: row.sija,
    points: row.piste ? row.piste.toNumber() : null,
    award: row.pa,
    judge: row.judge,
    haku: row.haku ? row.haku.toNumber() : null,
    hauk: row.hauk ? row.hauk.toNumber() : null,
    yva: row.yva ? row.yva.toNumber() : null,
    hlo: row.hlo ? row.hlo.toNumber() : null,
    alo: row.alo ? row.alo.toNumber() : null,
    tja: row.tja ? row.tja.toNumber() : null,
    pin: row.pin ? row.pin.toNumber() : null,
  }));
}
