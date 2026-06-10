import { DogSex, type Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import {
  createParentPreview,
  getParentPreview,
  mapParentPreviews,
  normalizeRegistrationNo,
  type ParentDogPreviewRow,
} from "./parent-preview";
import type { AdminDogDiseaseBrowseItemDb } from "../types";

export type AdminDogDiseaseBrowseRow = {
  id: string;
  evidenceKind: "DOG" | "LITTER";
  rekisterinumero: string;
  pentue: string | null;
  kuvaus: string | null;
  julkinen: boolean;
  isaRekisterinumero: string | null;
  emaRekisterinumero: string | null;
  tietolahde: string | null;
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
};

export const diseaseBrowseRowSelect: Prisma.KoiranSairausSelect = {
  id: true,
  evidenceKind: true,
  rekisterinumero: true,
  pentue: true,
  kuvaus: true,
  julkinen: true,
  isaRekisterinumero: true,
  emaRekisterinumero: true,
  tietolahde: true,
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
};

export async function loadLitterParentPreviews(
  rows: AdminDogDiseaseBrowseRow[],
) {
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

  return mapParentPreviews(parentDogs);
}

export function mapDiseaseBrowseRows(
  rows: AdminDogDiseaseBrowseRow[],
  parentLookup: ReturnType<typeof mapParentPreviews>,
): AdminDogDiseaseBrowseItemDb[] {
  return rows.map((row) => {
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
      pentue: row.pentue,
      kuvaus: row.kuvaus,
      julkinen: row.julkinen,
      isaRekisterinumero: row.isaRekisterinumero,
      emaRekisterinumero: row.emaRekisterinumero,
      tietolahde: row.tietolahde,
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
  });
}
