import type { Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";

type AdminDogDbClient = Prisma.TransactionClient | typeof prisma;

export type LinkUnlinkedShowTrialEntriesDbInput = {
  dogId: string;
  registrationNos: string[];
};

export type LinkUnlinkedShowTrialEntriesDbResult = {
  showLinkedCount: number;
  trialLinkedCount: number;
};

function resolveDbClient(dbClient?: AdminDogDbClient): AdminDogDbClient {
  return dbClient ?? prisma;
}

function buildShowRegistrationSnapshotMatchFilter(
  registrationNos: string[],
): Prisma.ShowEntryWhereInput | null {
  if (registrationNos.length === 0) {
    return null;
  }

  return {
    OR: registrationNos.map((registrationNo) => ({
      registrationNoSnapshot: {
        equals: registrationNo,
        mode: "insensitive",
      },
    })),
  };
}

function buildTrialRegistrationSnapshotMatchFilter(
  registrationNos: string[],
): Prisma.TrialEntryWhereInput | null {
  if (registrationNos.length === 0) {
    return null;
  }

  return {
    OR: registrationNos.map((registrationNo) => ({
      rekisterinumeroSnapshot: {
        equals: registrationNo,
        mode: "insensitive",
      },
    })),
  };
}

// Links historical show/trial rows to a dog when registration snapshots match.
export async function linkUnlinkedShowTrialEntriesByRegistrationDb(
  input: LinkUnlinkedShowTrialEntriesDbInput,
  dbClient?: AdminDogDbClient,
): Promise<LinkUnlinkedShowTrialEntriesDbResult> {
  const client = resolveDbClient(dbClient);
  const registrationNos = [...new Set(input.registrationNos)];

  if (registrationNos.length === 0) {
    return {
      showLinkedCount: 0,
      trialLinkedCount: 0,
    };
  }

  const showMatchFilter =
    buildShowRegistrationSnapshotMatchFilter(registrationNos);
  const trialMatchFilter =
    buildTrialRegistrationSnapshotMatchFilter(registrationNos);

  const showResult = showMatchFilter
    ? await client.showEntry.updateMany({
        where: {
          dogId: null,
          ...showMatchFilter,
        },
        data: {
          dogId: input.dogId,
        },
      })
    : { count: 0 };

  const trialResult = trialMatchFilter
    ? await client.trialEntry.updateMany({
        where: {
          dogId: null,
          ...trialMatchFilter,
        },
        data: {
          dogId: input.dogId,
        },
      })
    : { count: 0 };

  return {
    showLinkedCount: showResult.count,
    trialLinkedCount: trialResult.count,
  };
}
