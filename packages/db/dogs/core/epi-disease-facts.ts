import { prisma } from "@db/core/prisma";

export type DogEpiDiseaseFactDb = {
  dogId: string | null;
  isaDogId: string | null;
  emaDogId: string | null;
  sairausKoodi: string;
};

const EPI_AND_LAFORA_CODES = ["epi", "lepis", "lepik", "lepit"] as const;

// Loads bounded disease facts used by admin profile EPI/Lafora calculations.
export async function loadDogEpiDiseaseFactsDb(
  relatedDogIds: string[],
): Promise<DogEpiDiseaseFactDb[]> {
  if (relatedDogIds.length === 0) {
    return [];
  }

  const ids = [...new Set(relatedDogIds)];
  const rows = await prisma.koiranSairaus.findMany({
    where: {
      sairausKoodi: { in: [...EPI_AND_LAFORA_CODES] },
      OR: [
        { dogId: { in: ids } },
        { isaDogId: { in: ids } },
        { emaDogId: { in: ids } },
      ],
    },
    select: {
      dogId: true,
      isaDogId: true,
      emaDogId: true,
      sairausKoodi: true,
    },
  });

  return rows.map((row) => ({
    dogId: row.dogId,
    isaDogId: row.isaDogId,
    emaDogId: row.emaDogId,
    sairausKoodi: row.sairausKoodi.toLowerCase(),
  }));
}
