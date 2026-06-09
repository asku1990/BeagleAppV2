import { prisma } from "@db/core/prisma";
import type { AdminDogDiseaseDefinitionOptionDb } from "./types";

export async function listAdminDogDiseaseDefinitionsDb(): Promise<
  AdminDogDiseaseDefinitionOptionDb[]
> {
  const rows = await prisma.sairaus.findMany({
    select: {
      koodi: true,
      sairausTeksti: true,
      sairausRyhma: true,
      _count: {
        select: {
          koirat: true,
        },
      },
    },
    orderBy: [{ sairausTeksti: "asc" }, { koodi: "asc" }],
  });

  return rows.map((row) => ({
    diseaseCode: row.koodi,
    diseaseText: row.sairausTeksti,
    diseaseGroup: row.sairausRyhma,
    count: row._count.koirat,
  }));
}
