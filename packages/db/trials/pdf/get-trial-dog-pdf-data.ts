import { prisma } from "@db/core/prisma";

export type TrialDogPdfDataRequestDb = {
  trialId: string;
};

export type TrialDogPdfDataDb = {
  trialId: string;
  registrationNo: string | null;
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
  });

  if (!row) {
    return null;
  }

  return {
    trialId: row.id,
    registrationNo:
      row.rekisterinumeroSnapshot ||
      row.dog?.registrations[0]?.registrationNo ||
      null,
  };
}
