import type { Prisma } from "@prisma/client";

export async function deleteAdminDogWriteDb(
  dogId: string,
  tx: Prisma.TransactionClient,
): Promise<boolean> {
  await tx.dog.updateMany({
    where: { sireId: dogId },
    data: { sireId: null },
  });
  await tx.dog.updateMany({
    where: { damId: dogId },
    data: { damId: null },
  });

  const result = await tx.dog.deleteMany({
    where: { id: dogId },
  });
  return result.count > 0;
}
