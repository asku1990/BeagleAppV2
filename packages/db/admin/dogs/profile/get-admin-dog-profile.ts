import { prisma } from "@db/core/prisma";
import type { AdminDogProfileDb } from "./types";
import { mapAdminDogProfileDbRow } from "./internal/profile-db-mappers";
import { adminDogProfileSelect } from "./internal/profile-select";

export async function getAdminDogProfileDb(
  dogId: string,
): Promise<AdminDogProfileDb | null> {
  const dog = await prisma.dog.findUnique({
    where: { id: dogId },
    select: adminDogProfileSelect,
  });

  if (!dog) {
    return null;
  }

  return mapAdminDogProfileDbRow(dog);
}
