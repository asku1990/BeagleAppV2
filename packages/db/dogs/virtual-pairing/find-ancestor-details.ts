import type { DogStatus, Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import { getFirstInsertedRegistrationNo } from "../core/registration";

type VirtualPairingDbClient = Prisma.TransactionClient | typeof prisma;

function resolveDbClient(
  dbClient?: VirtualPairingDbClient,
): VirtualPairingDbClient {
  return dbClient ?? prisma;
}

export type VirtualPairingAncestorDetailsDb = {
  id: string;
  name: string;
  ekNo: number | null;
  registrationNo: string;
  status: DogStatus;
};

export async function findVirtualPairingAncestorDetailsDb(
  ids: string[],
  dbClient?: VirtualPairingDbClient,
): Promise<VirtualPairingAncestorDetailsDb[]> {
  if (ids.length === 0) return [];

  const rows = await resolveDbClient(dbClient).dog.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      ekNo: true,
      status: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
    },
  });

  const byId = new Map(
    rows.map(
      (row) =>
        [
          row.id,
          {
            id: row.id,
            name: row.name,
            ekNo: row.ekNo,
            status: row.status,
            registrationNo:
              getFirstInsertedRegistrationNo(row.registrations) ?? "-",
          },
        ] as const,
    ),
  );

  return ids
    .map((id) => byId.get(id))
    .filter((row): row is VirtualPairingAncestorDetailsDb => Boolean(row));
}
