import { prisma } from "@db/core/prisma";

export type AdminDogDeleteImpactOwnerDb = {
  id: string;
  name: string;
};

export type AdminDogDeleteImpactBreederDb = {
  id: string;
  name: string;
};

export type AdminDogDeleteImpactDb = {
  dogId: string;
  deleted: {
    registrations: number;
    ownerships: number;
    titles: number;
    legacyTrialResults: number;
  };
  detached: {
    canonicalTrialEntries: number;
    showEntries: number;
    diseaseRows: number;
    sireReferences: number;
    damReferences: number;
  };
  orphanWarnings: {
    owners: AdminDogDeleteImpactOwnerDb[];
    breeder: AdminDogDeleteImpactBreederDb | null;
  };
};

// Reads the relation impact of deleting a dog without changing data.
export async function getAdminDogDeleteImpactDb(
  dogId: string,
): Promise<AdminDogDeleteImpactDb | null> {
  const dog = await prisma.dog.findUnique({
    where: { id: dogId },
    select: {
      id: true,
      breeder: {
        select: {
          id: true,
          name: true,
          _count: { select: { dogs: true } },
        },
      },
      ownerships: {
        select: {
          owner: {
            select: {
              id: true,
              name: true,
              ownerships: { select: { dogId: true } },
            },
          },
        },
      },
      _count: {
        select: {
          registrations: true,
          ownerships: true,
          titles: true,
          trialResults: true,
          trialEntries: true,
          showEntries: true,
          sairaudet: true,
          siredPuppies: true,
          whelpedPuppies: true,
        },
      },
    },
  });

  if (!dog) {
    return null;
  }

  const orphanOwners = new Map<string, AdminDogDeleteImpactOwnerDb>();
  for (const { owner } of dog.ownerships) {
    if (
      owner.ownerships.every((ownership) => ownership.dogId === dog.id) &&
      !orphanOwners.has(owner.id)
    ) {
      orphanOwners.set(owner.id, { id: owner.id, name: owner.name });
    }
  }

  return {
    dogId: dog.id,
    deleted: {
      registrations: dog._count.registrations,
      ownerships: dog._count.ownerships,
      titles: dog._count.titles,
      legacyTrialResults: dog._count.trialResults,
    },
    detached: {
      canonicalTrialEntries: dog._count.trialEntries,
      showEntries: dog._count.showEntries,
      diseaseRows: dog._count.sairaudet,
      sireReferences: dog._count.siredPuppies,
      damReferences: dog._count.whelpedPuppies,
    },
    orphanWarnings: {
      owners: Array.from(orphanOwners.values()),
      breeder:
        dog.breeder && dog.breeder._count.dogs <= 1
          ? { id: dog.breeder.id, name: dog.breeder.name }
          : null,
    },
  };
}
