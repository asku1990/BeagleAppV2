import { prisma } from "@db/core/prisma";

export type TrialDogPdfDataRequestDb = {
  trialId: string;
};

export type TrialDogSexDb = "MALE" | "FEMALE" | "UNKNOWN";

export type TrialDogPdfDataDb = {
  trialId: string;
  registrationNo: string;
  dogName: string | null;
  dogSex: TrialDogSexDb | null;
  sireName: string | null;
  sireRegistrationNo: string | null;
  damName: string | null;
  damRegistrationNo: string | null;
  omistaja: string | null;
  omistajanKotikunta: string | null;
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
      omistajaSnapshot: true,
      omistajanKotikuntaSnapshot: true,
      dog: {
        select: {
          name: true,
          sex: true,
          registrations: {
            select: {
              registrationNo: true,
            },
            orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            take: 1,
          },
          sire: {
            select: {
              name: true,
              registrations: {
                select: {
                  registrationNo: true,
                },
                orderBy: [{ createdAt: "asc" }, { id: "asc" }],
                take: 1,
              },
            },
          },
          dam: {
            select: {
              name: true,
              registrations: {
                select: {
                  registrationNo: true,
                },
                orderBy: [{ createdAt: "asc" }, { id: "asc" }],
                take: 1,
              },
            },
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
    dogSex: (row.dog?.sex ?? null) as TrialDogSexDb | null,
    sireName: row.dog?.sire?.name ?? null,
    sireRegistrationNo: row.dog?.sire?.registrations[0]?.registrationNo ?? null,
    damName: row.dog?.dam?.name ?? null,
    damRegistrationNo: row.dog?.dam?.registrations[0]?.registrationNo ?? null,
    omistaja: row.omistajaSnapshot ?? null,
    omistajanKotikunta: row.omistajanKotikuntaSnapshot ?? null,
    kennelpiiri: row.trialEvent.kennelpiiri ?? null,
    kennelpiirinro: row.trialEvent.kennelpiirinro ?? null,
    koekunta: row.trialEvent.koekunta ?? null,
    koepaiva: row.trialEvent.koepaiva,
    jarjestaja: row.trialEvent.jarjestaja ?? null,
  };
}
