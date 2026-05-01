import { prisma, type LegacyOwnerRow } from "@beagle/db";
import { normalizeNullable } from "../core";

type PrismaUniqueError = {
  code?: string;
};

function isPrismaUniqueError(error: unknown): error is PrismaUniqueError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function upsertOwner(row: LegacyOwnerRow): Promise<string | null> {
  const ownerName = normalizeNullable(row.ownerName);
  if (!ownerName) return null;

  const postalCode = normalizeNullable(row.postalCode) ?? "";
  const city = normalizeNullable(row.city) ?? "";

  const existing = await prisma.owner.findFirst({
    where: { name: ownerName, postalCode, city },
    select: { id: true },
  });
  if (existing) return existing.id;

  try {
    const created = await prisma.owner.create({
      data: { name: ownerName, postalCode, city },
      select: { id: true },
    });
    return created.id;
  } catch (error) {
    // Concurrent import runs can race on the unique owner key.
    if (!isPrismaUniqueError(error)) {
      throw error;
    }

    const createdByRacingRun = await prisma.owner.findFirst({
      where: { name: ownerName, postalCode, city },
      select: { id: true },
    });
    if (!createdByRacingRun) {
      throw error;
    }
    return createdByRacingRun.id;
  }
}
