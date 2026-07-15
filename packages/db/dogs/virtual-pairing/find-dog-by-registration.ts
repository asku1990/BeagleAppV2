import { DogStatus, type DogSex, type Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";

type VirtualPairingDbClient = Prisma.TransactionClient | typeof prisma;

type FindVirtualPairingDogByRegistrationOptions = {
  dbClient?: VirtualPairingDbClient;
  allowedStatuses?: readonly DogStatus[];
};

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
  options: FindVirtualPairingDogByRegistrationOptions = {},
): Promise<VirtualPairingDogByRegistrationLookupDb | null> {
  const {
    dbClient,
    allowedStatuses = [DogStatus.NORMAL, DogStatus.REFERENCE_ONLY],
  } = options;
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
      dog: {
        status: { in: [...allowedStatuses] },
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
