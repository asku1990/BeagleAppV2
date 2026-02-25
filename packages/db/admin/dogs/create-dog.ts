import type { Prisma } from "@prisma/client";
import {
  runInAuditContextDb,
  type AuditContextDb,
} from "../../core/audit-context";
import { uniqueNonEmptyNames } from "./normalization";

export type CreateAdminDogDbInput = {
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

export type CreatedAdminDogRowDb = {
  id: string;
  name: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  registrationNo: string | null;
};

const OWNERSHIP_DATE_KEY_UNKNOWN = "0000-00-00";

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

async function createOwnerships(
  dogId: string,
  ownerNames: string[],
  tx: Prisma.TransactionClient,
): Promise<void> {
  const uniqueOwnerNames = uniqueNonEmptyNames(ownerNames);
  for (const ownerName of uniqueOwnerNames) {
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

async function createAdminDogDb(
  input: CreateAdminDogDbInput,
  tx: Prisma.TransactionClient,
): Promise<CreatedAdminDogRowDb> {
  const breederId = await resolveBreederId(input.breederNameText, tx);

  const createdDog = await tx.dog.create({
    data: {
      name: input.name,
      sex: input.sex,
      birthDate: input.birthDate,
      breederNameText: input.breederNameText,
      sireId: input.sireId,
      damId: input.damId,
      breederId,
      ekNo: input.ekNo,
      note: input.note,
    },
    select: {
      id: true,
      name: true,
      sex: true,
    },
  });

  if (input.registrationNo) {
    await tx.dogRegistration.create({
      data: {
        dogId: createdDog.id,
        registrationNo: input.registrationNo,
        source: "ADMIN_UI",
      },
    });
  }

  await createOwnerships(createdDog.id, input.ownerNames, tx);

  return {
    id: createdDog.id,
    name: createdDog.name,
    sex: createdDog.sex,
    registrationNo: input.registrationNo,
  };
}

export async function runAdminDogWriteTransactionDb<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  auditContext?: AuditContextDb,
): Promise<T> {
  return runInAuditContextDb(auditContext ?? {}, callback);
}

export async function createAdminDogWriteDb(
  input: CreateAdminDogDbInput,
  tx: Prisma.TransactionClient,
): Promise<CreatedAdminDogRowDb> {
  return createAdminDogDb(input, tx);
}
