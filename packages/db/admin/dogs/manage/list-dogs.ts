import { DogSex, type Prisma } from "@prisma/client";
import { prisma } from "../../../core/prisma";
import { normalizeQuery, uniqueNonEmptyNames } from "./normalization";

export type AdminDogListSortDb = "name-asc" | "birth-desc" | "created-desc";

export type AdminDogListRequestDb = {
  query?: string;
  sex?: "MALE" | "FEMALE" | "UNKNOWN";
  page?: number;
  pageSize?: number;
  sort?: AdminDogListSortDb;
};

export type AdminDogParentPreviewDb = {
  id: string;
  name: string;
  registrationNo: string | null;
};

export type AdminDogListRowDb = {
  id: string;
  registrationNo: string | null;
  secondaryRegistrationNos: string[];
  name: string;
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  birthDate: Date | null;
  breederName: string | null;
  ownerNames: string[];
  sire: AdminDogParentPreviewDb | null;
  dam: AdminDogParentPreviewDb | null;
  trialCount: number;
  showCount: number;
  ekNo: number | null;
  note: string | null;
};

export type AdminDogListResponseDb = {
  total: number;
  totalPages: number;
  page: number;
  items: AdminDogListRowDb[];
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
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

  const parsed = Math.floor(value ?? DEFAULT_PAGE_SIZE);
  return Math.min(MAX_PAGE_SIZE, Math.max(1, parsed));
}

function parseSort(input: string | undefined): AdminDogListSortDb {
  if (
    input === "birth-desc" ||
    input === "created-desc" ||
    input === "name-asc"
  ) {
    return input;
  }

  return "name-asc";
}

function parseSex(sex: string | undefined): DogSex | undefined {
  if (sex === "MALE") {
    return DogSex.MALE;
  }

  if (sex === "FEMALE") {
    return DogSex.FEMALE;
  }

  if (sex === "UNKNOWN") {
    return DogSex.UNKNOWN;
  }

  return undefined;
}

function resolveOrderBy(
  sort: AdminDogListSortDb,
): Prisma.DogOrderByWithRelationInput[] {
  if (sort === "birth-desc") {
    return [{ birthDate: { sort: "desc", nulls: "last" } }, { id: "asc" }];
  }

  if (sort === "created-desc") {
    return [{ createdAt: "desc" }, { id: "desc" }];
  }

  return [{ name: "asc" }, { id: "asc" }];
}

function toParentPreview(
  parent: {
    id: string;
    name: string;
    registrations: Array<{ registrationNo: string }>;
  } | null,
): AdminDogParentPreviewDb | null {
  if (!parent) {
    return null;
  }

  return {
    id: parent.id,
    name: parent.name,
    registrationNo: parent.registrations[0]?.registrationNo ?? null,
  };
}

export async function listAdminDogsDb(
  input: AdminDogListRequestDb,
): Promise<AdminDogListResponseDb> {
  const query = normalizeQuery(input.query);
  const parsedSex = parseSex(input.sex);
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const sort = parseSort(input.sort);

  const andFilters: Prisma.DogWhereInput[] = [];
  if (parsedSex) {
    andFilters.push({ sex: parsedSex });
  }

  if (query.length > 0) {
    const orFilters: Prisma.DogWhereInput[] = [
      { name: { contains: query, mode: "insensitive" } },
      { breederNameText: { contains: query, mode: "insensitive" } },
      { note: { contains: query, mode: "insensitive" } },
      { breeder: { is: { name: { contains: query, mode: "insensitive" } } } },
      {
        registrations: {
          some: { registrationNo: { contains: query, mode: "insensitive" } },
        },
      },
      {
        ownerships: {
          some: {
            owner: {
              name: { contains: query, mode: "insensitive" },
            },
          },
        },
      },
    ];

    andFilters.push({ OR: orFilters });
  }

  const where: Prisma.DogWhereInput =
    andFilters.length > 0 ? { AND: andFilters } : {};

  const total = await prisma.dog.count({ where });
  if (total === 0) {
    return {
      total: 0,
      totalPages: 0,
      page: DEFAULT_PAGE,
      items: [],
    };
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const rows = await prisma.dog.findMany({
    where,
    select: {
      id: true,
      name: true,
      sex: true,
      birthDate: true,
      breederNameText: true,
      note: true,
      ekNo: true,
      breeder: {
        select: {
          name: true,
        },
      },
      registrations: {
        select: {
          registrationNo: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
      ownerships: {
        select: {
          owner: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          owner: {
            name: "asc",
          },
        },
      },
      sire: {
        select: {
          id: true,
          name: true,
          registrations: {
            select: {
              registrationNo: true,
            },
            orderBy: {
              createdAt: "asc",
            },
            take: 1,
          },
        },
      },
      dam: {
        select: {
          id: true,
          name: true,
          registrations: {
            select: {
              registrationNo: true,
            },
            orderBy: {
              createdAt: "asc",
            },
            take: 1,
          },
        },
      },
      _count: {
        select: {
          trialResults: true,
          showResults: true,
        },
      },
    },
    orderBy: resolveOrderBy(sort),
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  });

  return {
    total,
    totalPages,
    page: safePage,
    items: rows.map((row) => ({
      id: row.id,
      registrationNo: row.registrations[0]?.registrationNo ?? null,
      secondaryRegistrationNos: row.registrations
        .slice(1)
        .map((registration) => registration.registrationNo),
      name: row.name,
      sex: row.sex,
      birthDate: row.birthDate,
      breederName: row.breeder?.name ?? row.breederNameText ?? null,
      ownerNames: uniqueNonEmptyNames(
        row.ownerships.map((ownership) => ownership.owner.name),
      ),
      sire: toParentPreview(row.sire),
      dam: toParentPreview(row.dam),
      trialCount: row._count.trialResults,
      showCount: row._count.showResults,
      ekNo: row.ekNo,
      note: row.note,
    })),
  };
}
