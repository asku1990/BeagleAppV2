import type { DogSex, Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";

type AdminDogDbClient = Prisma.TransactionClient | typeof prisma;

function resolveDbClient(dbClient?: AdminDogDbClient): AdminDogDbClient {
  return dbClient ?? prisma;
}

export type DogByRegistrationLookupDb = {
  id: string;
  sex: DogSex;
};

export async function findDogByRegistrationNoDb(
  registrationNo: string,
  dbClient?: AdminDogDbClient,
): Promise<DogByRegistrationLookupDb | null> {
  const row = await resolveDbClient(dbClient).dogRegistration.findUnique({
    where: { registrationNo },
    select: {
      dog: {
        select: {
          id: true,
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
    sex: row.dog.sex,
  };
}
