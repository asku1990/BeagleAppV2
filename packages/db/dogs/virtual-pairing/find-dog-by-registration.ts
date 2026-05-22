import type { DogSex, Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";

type VirtualPairingDbClient = Prisma.TransactionClient | typeof prisma;

function resolveDbClient(
  dbClient?: VirtualPairingDbClient,
): VirtualPairingDbClient {
  return dbClient ?? prisma;
}

export type VirtualPairingDogByRegistrationLookupDb = {
  id: string;
  name: string;
  ekNo: number | null;
  sex: DogSex;
  registrationNo: string;
};

export async function findVirtualPairingDogByRegistrationNoDb(
  registrationNo: string,
  dbClient?: VirtualPairingDbClient,
): Promise<VirtualPairingDogByRegistrationLookupDb | null> {
  const row = await resolveDbClient(dbClient).dogRegistration.findUnique({
    where: { registrationNo },
    select: {
      registrationNo: true,
      dog: {
        select: {
          id: true,
          name: true,
          ekNo: true,
          sex: true,
        },
      },
    },
  });

  if (!row?.dog) {
    return null;
  }

  return {
    id: row.dog.id,
    name: row.dog.name,
    ekNo: row.dog.ekNo,
    sex: row.dog.sex,
    registrationNo: row.registrationNo,
  };
}
