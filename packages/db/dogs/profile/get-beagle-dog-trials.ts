import { prisma } from "@db/core/prisma";

export type BeagleDogTrialsDbRow = {
  id: string;
  name: string;
  registrationNo: string;
  trials: {
    id: string;
    trialId: string;
    place: string;
    date: string;
    weather: string | null;
    koetyyppi: "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";
    koiriaLuokassa: number | null;
    rank: string | null;
    points: number | null;
    award: string | null;
    judge: string | null;
    haku: number | null;
    hauk: number | null;
    yva: number | null;
    hlo: number | null;
    alo: number | null;
    tja: number | null;
    pin: number | null;
  }[];
};

function toNumberOrNull(value: { toNumber(): number } | null): number | null {
  return value === null ? null : value.toNumber();
}

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
      date: trial.trialEvent.koepaiva.toISOString().slice(0, 10),
      weather: trial.ke,
      koetyyppi: trial.koetyyppi,
      koiriaLuokassa: trial.koiriaLuokassa,
      rank: trial.sija,
      points: toNumberOrNull(trial.piste),
      award: trial.pa,
      judge: trial.tuom1?.trim() || trial.trialEvent.ylituomariNimi || null,
      haku: toNumberOrNull(trial.haku),
      hauk: toNumberOrNull(trial.hauk),
      yva: toNumberOrNull(trial.yva),
      hlo: toNumberOrNull(trial.hlo),
      alo: toNumberOrNull(trial.alo),
      tja: toNumberOrNull(trial.tja),
      pin: toNumberOrNull(trial.pin),
    })),
  };
}
