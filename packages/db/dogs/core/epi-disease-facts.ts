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
  const relatedRegistrations = await prisma.dogRegistration.findMany({
    where: {
      dogId: { in: ids },
    },
    select: {
      dogId: true,
      registrationNo: true,
    },
  });
  const dogIdByRegistrationNo = new Map(
    relatedRegistrations.map((row) => [row.registrationNo, row.dogId]),
  );
  const registrationNos = [...dogIdByRegistrationNo.keys()];
  const rows = await prisma.koiranSairaus.findMany({
    where: {
      sairausKoodi: { in: codes },
      OR: [
        {
          evidenceKind: "DOG",
          OR: [
            { dogId: { in: ids } },
            { dog: { sireId: { in: ids } } },
            { dog: { damId: { in: ids } } },
          ],
        },
        {
          evidenceKind: "LITTER",
          OR: [
            { isaRekisterinumero: { in: registrationNos } },
            { emaRekisterinumero: { in: registrationNos } },
          ],
        },
      ],
    },
    select: {
      dogId: true,
      evidenceKind: true,
      isaRekisterinumero: true,
      emaRekisterinumero: true,
      sairausKoodi: true,
      dog: {
        select: {
          sireId: true,
          damId: true,
        },
      },
    },
  });

  return rows.flatMap<DogEpiDiseaseFactDb>((row) => {
    if (row.evidenceKind === "DOG") {
      return [
        {
          dogId: row.dogId,
          isaDogId: row.dog?.sireId ?? null,
          emaDogId: row.dog?.damId ?? null,
          sairausKoodi: row.sairausKoodi.toLowerCase(),
          evidenceKind: "DOG" as const,
        },
      ];
    }
    const isaDogId = row.isaRekisterinumero
      ? (dogIdByRegistrationNo.get(row.isaRekisterinumero) ?? null)
      : null;
    const emaDogId = row.emaRekisterinumero
      ? (dogIdByRegistrationNo.get(row.emaRekisterinumero) ?? null)
      : null;
    if (!isaDogId || !emaDogId) {
      return [];
    }

    return [
      {
        dogId: null,
        isaDogId,
        emaDogId,
        sairausKoodi: row.sairausKoodi.toLowerCase(),
        evidenceKind: "LITTER" as const,
      },
    ];
  });
}

// Loads the legacy EPI/Lafora fact set used by admin dog profile scoring.
export async function loadDogEpiDiseaseFactsDb(
  relatedDogIds: string[],
): Promise<DogEpiDiseaseFactDb[]> {
  return loadDogDiseaseFactsDb(relatedDogIds, EPI_AND_LAFORA_CODES);
}
