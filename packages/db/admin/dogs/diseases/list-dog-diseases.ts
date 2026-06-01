import { DogSex, type Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import {
  parsePage,
  parsePageSize,
  resolveSelectedDiseaseCode,
  type DiseaseDefinitionRow,
} from "./internal/disease-selection";
import {
  createParentPreview,
  getParentPreview,
  mapParentPreviews,
  normalizeRegistrationNo,
  type ParentDogPreviewRow,
} from "./internal/parent-preview";

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
      page: 1,
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

  const parentLookup = mapParentPreviews(parentDogs);

  return {
    selectedDiseaseCode,
    total,
    totalPages,
    page: safePage,
    diseaseOptions,
    items: rows.map((row) => {
      const isDog = row.evidenceKind === "DOG" && Boolean(row.dog);
      const sire = isDog
        ? createParentPreview(row.dog?.sire ?? null, null)
        : getParentPreview(row.isaRekisterinumero, parentLookup);
      const dam = isDog
        ? createParentPreview(row.dog?.dam ?? null, null)
        : getParentPreview(row.emaRekisterinumero, parentLookup);

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
