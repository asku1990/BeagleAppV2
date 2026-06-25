import type { Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";

export type BeagleDogTrialsDbRow = {
  id: string;
  name: string;
  registrationNo: string;
  trials: {
    id: string;
    trialId: string;
    place: string;
    date: Date;
    weather: string | null;
    koetyyppi: "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";
    koiriaLuokassa: number | null;
    rank: string | null;
    pa: string | null;
    lk: string | null;
    tuom1: string | null;
    ylituomariNimi: string | null;
    points: Prisma.Decimal | null;
    haku: Prisma.Decimal | null;
    hauk: Prisma.Decimal | null;
    yva: Prisma.Decimal | null;
    hlo: Prisma.Decimal | null;
    alo: Prisma.Decimal | null;
    tja: Prisma.Decimal | null;
    pin: Prisma.Decimal | null;
  }[];
};

export async function getBeagleDogTrialsDb(
  dogId: string,
): Promise<BeagleDogTrialsDbRow | null> {
  const dog = await prisma.dog.findUnique({
    where: { id: dogId },
    select: {
      id: true,
      name: true,
      registrations: {
        select: {
          registrationNo: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: 1,
      },
      trialEntries: {
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
          trialEvent: {
            select: {
              id: true,
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
      },
    },
  });

  if (!dog) {
    return null;
  }

  return {
    id: dog.id,
    name: dog.name,
    registrationNo: dog.registrations[0]?.registrationNo ?? "-",
    trials: dog.trialEntries.map((trial) => ({
      id: trial.id,
      trialId: trial.trialEvent.id,
      place: trial.trialEvent.koekunta,
      date: trial.trialEvent.koepaiva,
      weather: trial.ke,
      koetyyppi: trial.koetyyppi,
      koiriaLuokassa: trial.koiriaLuokassa,
      rank: trial.sija,
      pa: trial.pa,
      lk: trial.lk,
      tuom1: trial.tuom1,
      ylituomariNimi: trial.trialEvent.ylituomariNimi,
      points: trial.piste,
      haku: trial.haku,
      hauk: trial.hauk,
      yva: trial.yva,
      hlo: trial.hlo,
      alo: trial.alo,
      tja: trial.tja,
      pin: trial.pin,
    })),
  };
}
