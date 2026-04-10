import type { DogSex, Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";

type AdminDogDbClient = Prisma.TransactionClient | typeof prisma;

function resolveDbClient(dbClient?: AdminDogDbClient): AdminDogDbClient {
  return dbClient ?? prisma;
}

export type DogByIdLookupDb = {
  id: string;
  sire: { id: string; sex: DogSex } | null;
  dam: { id: string; sex: DogSex } | null;
};

export async function findDogByIdDb(
  id: string,
  dbClient?: AdminDogDbClient,
): Promise<DogByIdLookupDb | null> {
  const row = await resolveDbClient(dbClient).dog.findUnique({
    where: { id },
    select: {
      id: true,
      sire: {
        select: {
          id: true,
          sex: true,
        },
      },
      dam: {
        select: {
          id: true,
          sex: true,
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    sire: row.sire ? { id: row.sire.id, sex: row.sire.sex } : null,
    dam: row.dam ? { id: row.dam.id, sex: row.dam.sex } : null,
  };
}
