// Loads the minimal canonical trial data needed to calculate one Paras ajuri season.
import { DogStatus } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import type { BestDriverSourceDb } from "./types";

export async function getBestDriverSourceDb(input: {
  startExclusive: Date;
  endExclusive: Date;
}): Promise<BestDriverSourceDb> {
  const eligibleEntryWhere = {
    dogId: { not: null },
    piste: { not: null },
    dog: { is: { status: DogStatus.NORMAL } },
  } as const;

  const [availableDateRows, candidateRows] = await Promise.all([
    prisma.trialEvent.findMany({
      where: { entries: { some: eligibleEntryWhere } },
      select: { koepaiva: true },
      orderBy: { koepaiva: "desc" },
      distinct: ["koepaiva"],
    }),
    prisma.trialEntry.findMany({
      where: {
        ...eligibleEntryWhere,
        trialEvent: {
          koepaiva: {
            gt: input.startExclusive,
            lt: input.endExclusive,
          },
        },
      },
      select: {
        id: true,
        dogId: true,
        rekisterinumeroSnapshot: true,
        ke: true,
        koetyyppi: true,
        piste: true,
        sija: true,
        dog: { select: { name: true, sex: true } },
        trialEvent: {
          select: {
            id: true,
            koepaiva: true,
            koekunta: true,
            kennelpiiri: true,
            kennelpiirinro: true,
          },
        },
      },
      orderBy: [
        { dogId: "asc" },
        { piste: "desc" },
        { trialEvent: { koepaiva: "asc" } },
        { id: "asc" },
      ],
    }),
  ]);

  return {
    availableEventDates: availableDateRows.map((row) => row.koepaiva),
    candidates: candidateRows.flatMap((row) => {
      if (!row.dogId || !row.dog || row.piste == null) return [];
      return [
        {
          trialEntryId: row.id,
          trialEventId: row.trialEvent.id,
          dogId: row.dogId,
          dogName: row.dog.name,
          dogSex: row.dog.sex,
          registrationNo: row.rekisterinumeroSnapshot,
          eventDate: row.trialEvent.koepaiva,
          eventPlace: row.trialEvent.koekunta,
          kennelDistrict: row.trialEvent.kennelpiiri,
          kennelDistrictNo: row.trialEvent.kennelpiirinro,
          weather: row.ke,
          trialType: row.koetyyppi,
          placement: row.sija,
          points: row.piste.toNumber(),
        },
      ];
    }),
  };
}
