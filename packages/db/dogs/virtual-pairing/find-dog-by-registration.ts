import type { DogSex, Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";

type VirtualPairingDbClient = Prisma.TransactionClient | typeof prisma;

function resolveDbClient(
  dbClient?: VirtualPairingDbClient,
): VirtualPairingDbClient {
  return dbClient ?? prisma;
}

function normalizeRegistrationNo(value: string): string | null {
  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
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
  const normalizedRegistrationNo = normalizeRegistrationNo(registrationNo);
  if (!normalizedRegistrationNo) {
    return null;
  }

  const rows = await resolveDbClient(dbClient).dogRegistration.findMany({
    where: {
      registrationNo: {
        equals: normalizedRegistrationNo,
        mode: "insensitive",
      },
    },
    take: 2,
    orderBy: [{ registrationNo: "asc" }, { id: "asc" }],
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

  if (rows.length !== 1 || !rows[0]?.dog) {
    return null;
  }

  const row = rows[0];

  return {
    id: row.dog.id,
    name: row.dog.name,
    ekNo: row.dog.ekNo,
    sex: row.dog.sex,
    registrationNo: row.registrationNo,
  };
}
