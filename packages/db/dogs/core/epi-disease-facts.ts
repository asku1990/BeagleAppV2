import { prisma } from "@db/core/prisma";

export type DogEpiDiseaseFactDb = {
  dogId: string | null;
  isaDogId: string | null;
  emaDogId: string | null;
  sairausKoodi: string;
  evidenceKind: "DOG" | "LITTER";
};

const EPI_AND_LAFORA_CODES = ["epi", "lepis", "lepik", "lepit"] as const;

function normalizeDiseaseCodes(codes: readonly string[]): string[] {
  return [...new Set(codes.map((code) => code.trim().toLowerCase()))];
}

// Loads bounded disease facts used by dog health calculations.
export async function loadDogDiseaseFactsDb(
  relatedDogIds: string[],
  diseaseCodes: readonly string[],
): Promise<DogEpiDiseaseFactDb[]> {
  if (relatedDogIds.length === 0) {
    return [];
  }

  const ids = [...new Set(relatedDogIds)];
  const codes = normalizeDiseaseCodes(diseaseCodes);
  const rows = await prisma.koiranSairaus.findMany({
    where: {
      sairausKoodi: { in: codes },
      OR: [
        { dogId: { in: ids } },
        { dog: { sireId: { in: ids } } },
        { dog: { damId: { in: ids } } },
        { dogId: null, isaDogId: { in: ids } },
        { dogId: null, emaDogId: { in: ids } },
      ],
    },
    select: {
      dogId: true,
      isaDogId: true,
      emaDogId: true,
      sairausKoodi: true,
      dog: {
        select: {
          sireId: true,
          damId: true,
        },
      },
    },
  });

  return rows.map((row) => ({
    dogId: row.dogId,
    isaDogId: row.dogId ? (row.dog?.sireId ?? null) : row.isaDogId,
    emaDogId: row.dogId ? (row.dog?.damId ?? null) : row.emaDogId,
    sairausKoodi: row.sairausKoodi.toLowerCase(),
    evidenceKind: row.dogId ? "DOG" : "LITTER",
  }));
}

// Loads the legacy EPI/Lafora fact set used by admin dog profile scoring.
export async function loadDogEpiDiseaseFactsDb(
  relatedDogIds: string[],
): Promise<DogEpiDiseaseFactDb[]> {
  return loadDogDiseaseFactsDb(relatedDogIds, EPI_AND_LAFORA_CODES);
}
