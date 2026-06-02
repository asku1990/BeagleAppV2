import type { Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";

type AdminDogDiseaseDeleteDbClient = Prisma.TransactionClient | typeof prisma;

export type DeleteAdminDogDiseaseDbResult =
  | {
      status: "deleted";
      diseaseId: string;
    }
  | {
      status: "not_found";
    };

export async function deleteAdminDogDiseaseDb(
  id: string,
  dbClient: AdminDogDiseaseDeleteDbClient = prisma,
): Promise<DeleteAdminDogDiseaseDbResult> {
  const result = await dbClient.koiranSairaus.deleteMany({
    where: { id },
  });

  if (result.count === 0) {
    return { status: "not_found" };
  }

  return {
    status: "deleted",
    diseaseId: id,
  };
}
