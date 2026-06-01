import { DogSex, type Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";

export type AdminDogDiseaseBrowseRequestDb = {
  diseaseCode?: string | null;
  page?: number;
  pageSize?: number;
};

export type AdminDogDiseaseBrowseFilterOptionDb = {
  diseaseCode: string;
  diseaseText: string;
  count: number;
};

export type AdminDogDiseaseBrowseParentPreviewDb = {
  registrationNo: string | null;
  name: string | null;
};

type DiseaseDefinitionRow = {
  koodi: string;
  sairausTeksti: string;
  _count: {
    koirat: number;
  };
};

type ParentDogPreviewRow = {
  name: string;
  registrations: Array<{ registrationNo: string }>;
};

export type AdminDogDiseaseBrowseDogDb = {
  id: string;
  name: string;
  sex: DogSex;
  ekNo: number | null;
  _count: {
    trialResults: number;
    showEntries: number;
  };
};

export type AdminDogDiseaseBrowseItemDb = {
  id: string;
  evidenceKind: "DOG" | "LITTER";
  rekisterinumero: string;
  julkinen: boolean;
  isaRekisterinumero: string | null;
  emaRekisterinumero: string | null;
  sairaus: {
    koodi: string;
    sairausTeksti: string;
  };
  dog: AdminDogDiseaseBrowseDogDb | null;
  sire: AdminDogDiseaseBrowseParentPreviewDb;
  dam: AdminDogDiseaseBrowseParentPreviewDb;
};

export type AdminDogDiseaseBrowseResponseDb = {
  selectedDiseaseCode: string | null;
  total: number;
  totalPages: number;
  page: number;
  diseaseOptions: AdminDogDiseaseBrowseFilterOptionDb[];
  items: AdminDogDiseaseBrowseItemDb[];
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_PAGE_SIZE = 100;

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_PAGE;
  }

  return Math.max(DEFAULT_PAGE, Math.floor(value ?? DEFAULT_PAGE));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_PAGE_SIZE;
  }

  return Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(value ?? DEFAULT_PAGE_SIZE)),
  );
}

function normalizeDiseaseCode(
  value: string | null | undefined,
): string | null | undefined {
  if (value == null) {
    return value;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function isEpiDisease(definition: DiseaseDefinitionRow): boolean {
  const text = definition.sairausTeksti.trim().toLowerCase();
  const code = definition.koodi.trim().toLowerCase();

  return text === "epilepsia" || code === "epi";
}

function resolveSelectedDiseaseCode(
  inputDiseaseCode: string | null | undefined,
  diseaseDefinitions: DiseaseDefinitionRow[],
): string | null {
  if (inputDiseaseCode === null) {
    return null;
  }

  const normalized = normalizeDiseaseCode(inputDiseaseCode);
  if (normalized) {
    const match = diseaseDefinitions.find(
      (definition) => definition.koodi === normalized,
    );
    if (match) {
      return match.koodi;
    }
  }

  return diseaseDefinitions.find(isEpiDisease)?.koodi ?? null;
}

function normalizeRegistrationNo(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function toParentPreview(
  parent: ParentDogPreviewRow | null,
  fallbackRegistrationNo: string | null,
): AdminDogDiseaseBrowseParentPreviewDb {
  if (!parent) {
    return {
      registrationNo: fallbackRegistrationNo,
      name: null,
    };
  }

  return {
    registrationNo:
      parent.registrations[0]?.registrationNo ?? fallbackRegistrationNo,
    name: parent.name.trim().length > 0 ? parent.name : null,
  };
}

function buildParentLookup(
  parentDogs: ParentDogPreviewRow[],
): Map<string, AdminDogDiseaseBrowseParentPreviewDb> {
  const lookup = new Map<string, AdminDogDiseaseBrowseParentPreviewDb>();

  for (const dog of parentDogs) {
    const preview = {
      registrationNo: dog.registrations[0]?.registrationNo ?? null,
      name: dog.name.trim().length > 0 ? dog.name : null,
    };

    for (const registration of dog.registrations) {
      const key = normalizeRegistrationNo(registration.registrationNo);
      if (!key) {
        continue;
      }

      lookup.set(key, preview);
    }
  }

  return lookup;
}

function resolveParentFromLookup(
  registrationNo: string | null,
  lookup: Map<string, AdminDogDiseaseBrowseParentPreviewDb>,
): AdminDogDiseaseBrowseParentPreviewDb {
  const normalized = normalizeRegistrationNo(registrationNo);
  if (!normalized) {
    return {
      registrationNo: null,
      name: null,
    };
  }

  return (
    lookup.get(normalized) ?? {
      registrationNo: normalized,
      name: null,
    }
  );
}

export async function listAdminDogDiseasesDb(
  input: AdminDogDiseaseBrowseRequestDb,
): Promise<AdminDogDiseaseBrowseResponseDb> {
  const diseaseDefinitions = (await prisma.sairaus.findMany({
    select: {
      koodi: true,
      sairausTeksti: true,
      _count: {
        select: {
          koirat: true,
        },
      },
    },
    orderBy: [{ sairausTeksti: "asc" }, { koodi: "asc" }],
  })) as DiseaseDefinitionRow[];

  const diseaseOptions = diseaseDefinitions.map((definition) => ({
    diseaseCode: definition.koodi,
    diseaseText: definition.sairausTeksti,
    count: definition._count.koirat,
  }));

  const selectedDiseaseCode = resolveSelectedDiseaseCode(
    input.diseaseCode,
    diseaseDefinitions,
  );

  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);

  const where: Prisma.KoiranSairausWhereInput =
    selectedDiseaseCode == null
      ? {}
      : {
          sairaus: {
            koodi: selectedDiseaseCode,
          },
        };

  const total = await prisma.koiranSairaus.count({ where });
  if (total === 0) {
    return {
      selectedDiseaseCode,
      total: 0,
      totalPages: 0,
      page: DEFAULT_PAGE,
      diseaseOptions,
      items: [],
    };
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const rows = (await prisma.koiranSairaus.findMany({
    where,
    select: {
      id: true,
      evidenceKind: true,
      rekisterinumero: true,
      julkinen: true,
      isaRekisterinumero: true,
      emaRekisterinumero: true,
      sairaus: {
        select: {
          koodi: true,
          sairausTeksti: true,
        },
      },
      dog: {
        select: {
          id: true,
          name: true,
          sex: true,
          ekNo: true,
          sire: {
            select: {
              name: true,
              registrations: {
                select: {
                  registrationNo: true,
                },
                orderBy: [{ createdAt: "asc" }, { id: "asc" }],
                take: 1,
              },
            },
          },
          dam: {
            select: {
              name: true,
              registrations: {
                select: {
                  registrationNo: true,
                },
                orderBy: [{ createdAt: "asc" }, { id: "asc" }],
                take: 1,
              },
            },
          },
          _count: {
            select: {
              trialResults: true,
              showEntries: true,
            },
          },
        },
      },
    },
    orderBy: [
      { sairaus: { sairausTeksti: "asc" } },
      { rekisterinumero: "asc" },
      { id: "asc" },
    ],
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  })) as Array<{
    id: string;
    evidenceKind: "DOG" | "LITTER";
    rekisterinumero: string;
    julkinen: boolean;
    isaRekisterinumero: string | null;
    emaRekisterinumero: string | null;
    sairaus: {
      koodi: string;
      sairausTeksti: string;
    };
    dog: {
      id: string;
      name: string;
      sex: DogSex;
      ekNo: number | null;
      sire: ParentDogPreviewRow | null;
      dam: ParentDogPreviewRow | null;
      _count: {
        trialResults: number;
        showEntries: number;
      };
    } | null;
  }>;

  const parentRegistrationNos = new Set<string>();
  for (const row of rows) {
    if (row.evidenceKind !== "LITTER") {
      continue;
    }

    const sire = normalizeRegistrationNo(row.isaRekisterinumero);
    const dam = normalizeRegistrationNo(row.emaRekisterinumero);
    if (sire) {
      parentRegistrationNos.add(sire);
    }
    if (dam) {
      parentRegistrationNos.add(dam);
    }
  }

  const parentDogs =
    parentRegistrationNos.size > 0
      ? ((await prisma.dog.findMany({
          where: {
            registrations: {
              some: {
                registrationNo: {
                  in: [...parentRegistrationNos],
                },
              },
            },
          },
          select: {
            name: true,
            registrations: {
              select: {
                registrationNo: true,
              },
              orderBy: [{ createdAt: "asc" }, { id: "asc" }],
            },
          },
        })) as ParentDogPreviewRow[])
      : [];

  const parentLookup = buildParentLookup(parentDogs);

  return {
    selectedDiseaseCode,
    total,
    totalPages,
    page: safePage,
    diseaseOptions,
    items: rows.map((row) => {
      const isDog = row.evidenceKind === "DOG" && Boolean(row.dog);
      const sire = isDog
        ? toParentPreview(row.dog?.sire ?? null, null)
        : resolveParentFromLookup(row.isaRekisterinumero, parentLookup);
      const dam = isDog
        ? toParentPreview(row.dog?.dam ?? null, null)
        : resolveParentFromLookup(row.emaRekisterinumero, parentLookup);

      return {
        id: row.id,
        evidenceKind: row.evidenceKind,
        rekisterinumero:
          normalizeRegistrationNo(row.rekisterinumero) ?? row.rekisterinumero,
        julkinen: row.julkinen,
        isaRekisterinumero: row.isaRekisterinumero,
        emaRekisterinumero: row.emaRekisterinumero,
        sairaus: row.sairaus,
        dog: row.dog
          ? {
              id: row.dog.id,
              name: row.dog.name,
              sex: row.dog.sex,
              ekNo: row.dog.ekNo,
              _count: row.dog._count,
            }
          : null,
        sire,
        dam,
      };
    }),
  };
}
