import type { Prisma } from "@prisma/client";

export type UpdateAdminDogDbInput = {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  birthDate: Date | null;
  breederNameText: string | null;
  sireId: string | null;
  damId: string | null;
  ownerNames: string[];
  ekNo: number | null;
  note: string | null;
  registrationNo: string | null;
};

export type UpdatedAdminDogRowDb = {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  registrationNo: string | null;
};

const OWNERSHIP_DATE_KEY_UNKNOWN = "0000-00-00";

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  for (const rawName of names) {
    const value = rawName.trim();
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
  }

  return Array.from(seen);
}

async function resolveBreederId(
  breederNameText: string | null,
  tx: Prisma.TransactionClient,
): Promise<string | null> {
  if (!breederNameText) {
    return null;
  }

  const breeder = await tx.breeder.findUnique({
    where: { name: breederNameText },
    select: { id: true },
  });

  return breeder?.id ?? null;
}

async function resolveOwnerIds(
  ownerNames: string[],
  tx: Prisma.TransactionClient,
): Promise<string[]> {
  const ownerIds: string[] = [];

  for (const ownerName of uniqueNames(ownerNames)) {
    const existingOwner = await tx.owner.findFirst({
      where: { name: ownerName },
      select: { id: true },
      orderBy: { id: "asc" },
    });

    const ownerId = existingOwner
      ? existingOwner.id
      : (
          await tx.owner.create({
            data: {
              name: ownerName,
              postalCode: "",
              city: "",
            },
            select: { id: true },
          })
        ).id;

    ownerIds.push(ownerId);
  }

  return ownerIds;
}

async function syncOwnerships(
  dogId: string,
  ownerIds: string[],
  tx: Prisma.TransactionClient,
): Promise<void> {
  await tx.dogOwnership.deleteMany({
    where: {
      dogId,
      ...(ownerIds.length > 0
        ? {
            ownerId: {
              notIn: ownerIds,
            },
          }
        : {}),
    },
  });

  if (ownerIds.length === 0) {
    return;
  }

  const existingOwnerships = await tx.dogOwnership.findMany({
    where: {
      dogId,
      ownerId: { in: ownerIds },
    },
    select: { ownerId: true },
  });
  const existingOwnerIdSet = new Set(
    existingOwnerships.map((ownership) => ownership.ownerId),
  );

  for (const ownerId of ownerIds) {
    if (existingOwnerIdSet.has(ownerId)) {
      continue;
    }

    await tx.dogOwnership.create({
      data: {
        dogId,
        ownerId,
        ownershipDate: null,
        ownershipDateKey: OWNERSHIP_DATE_KEY_UNKNOWN,
      },
    });
  }
}

async function syncPrimaryRegistration(
  dogId: string,
  registrationNo: string | null,
  tx: Prisma.TransactionClient,
): Promise<string | null> {
  const existingRegistrations = await tx.dogRegistration.findMany({
    where: { dogId },
    select: {
      id: true,
      registrationNo: true,
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const primaryRegistration = existingRegistrations[0] ?? null;
  if (!registrationNo) {
    if (primaryRegistration) {
      await tx.dogRegistration.delete({
        where: { id: primaryRegistration.id },
      });
    }

    return null;
  }

  const alreadyOwned = existingRegistrations.some(
    (row) => row.registrationNo === registrationNo,
  );
  if (alreadyOwned) {
    const requestedRegistration = existingRegistrations.find(
      (row) => row.registrationNo === registrationNo,
    );
    if (
      primaryRegistration &&
      requestedRegistration &&
      requestedRegistration.id !== primaryRegistration.id
    ) {
      await tx.dogRegistration.delete({
        where: { id: requestedRegistration.id },
      });
      await tx.dogRegistration.update({
        where: { id: primaryRegistration.id },
        data: { registrationNo },
      });
    }

    return registrationNo;
  }

  if (primaryRegistration) {
    await tx.dogRegistration.update({
      where: { id: primaryRegistration.id },
      data: { registrationNo },
    });

    return registrationNo;
  }

  await tx.dogRegistration.create({
    data: {
      dogId,
      registrationNo,
      source: "ADMIN_UI",
    },
  });

  return registrationNo;
}

export async function updateAdminDogWriteDb(
  input: UpdateAdminDogDbInput,
  tx: Prisma.TransactionClient,
): Promise<UpdatedAdminDogRowDb> {
  const existingDog = await tx.dog.findUnique({
    where: { id: input.id },
    select: { id: true },
  });
  if (!existingDog) {
    throw new Error("DOG_NOT_FOUND");
  }

  const breederId = await resolveBreederId(input.breederNameText, tx);

  const updatedDog = await tx.dog.update({
    where: { id: input.id },
    data: {
      name: input.name,
      sex: input.sex,
      birthDate: input.birthDate,
      breederNameText: input.breederNameText,
      breederId,
      sireId: input.sireId,
      damId: input.damId,
      ekNo: input.ekNo,
      note: input.note,
    },
    select: {
      id: true,
      name: true,
      sex: true,
    },
  });

  const ownerIds = await resolveOwnerIds(input.ownerNames, tx);
  await syncOwnerships(updatedDog.id, ownerIds, tx);
  const syncedRegistrationNo = await syncPrimaryRegistration(
    updatedDog.id,
    input.registrationNo,
    tx,
  );

  return {
    id: updatedDog.id,
    name: updatedDog.name,
    sex: updatedDog.sex,
    registrationNo: syncedRegistrationNo,
  };
}
