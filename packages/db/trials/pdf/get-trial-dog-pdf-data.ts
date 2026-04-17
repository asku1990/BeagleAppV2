import { prisma } from "@db/core/prisma";

export type TrialDogPdfDataRequestDb = {
  trialId: string;
};

export type TrialDogPdfDataDb = {
  trialId: string;
  registrationNo: string;
  dogName: string | null;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
  koekunta: string | null;
  koepaiva: Date;
  jarjestaja: string | null;
};

export async function getTrialDogPdfDataDb(
  input: TrialDogPdfDataRequestDb,
): Promise<TrialDogPdfDataDb | null> {
  const row = await prisma.trialEntry.findUnique({
    where: {
      id: input.trialId,
    },
    select: {
      id: true,
      rekisterinumeroSnapshot: true,
      dog: {
        select: {
          name: true,
          registrations: {
            select: {
              registrationNo: true,
            },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
            take: 1,
          },
        },
      },
      trialEvent: {
        select: {
          kennelpiiri: true,
          kennelpiirinro: true,
          koekunta: true,
          koepaiva: true,
          jarjestaja: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    trialId: row.id,
    registrationNo:
      row.dog?.registrations[0]?.registrationNo || row.rekisterinumeroSnapshot,
    dogName: row.dog?.name || null,
    kennelpiiri: row.trialEvent.kennelpiiri ?? null,
    kennelpiirinro: row.trialEvent.kennelpiirinro ?? null,
    koekunta: row.trialEvent.koekunta ?? null,
    koepaiva: row.trialEvent.koepaiva,
    jarjestaja: row.trialEvent.jarjestaja ?? null,
  };
}
