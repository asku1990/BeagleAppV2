import { DogSex, type Prisma } from "@prisma/client";
import { prisma } from "../core/prisma";

export type BeagleSearchSortDb =
  | "name-asc"
  | "birth-desc"
  | "reg-desc"
  | "created-desc";

export type BeagleSearchModeDb = "none" | "ek" | "reg" | "name" | "combined";

export type BeagleSearchRequestDb = {
  ek?: string;
  reg?: string;
  name?: string;
  multipleRegsOnly?: boolean;
  page?: number;
  pageSize?: number;
  sort?: BeagleSearchSortDb;
};

export type BeagleSearchRowDb = {
  id: string;
  ekNo: number | null;
  registrationNo: string;
  registrationNos: string[];
  createdAt: Date;
  sex: "U" | "N" | "-";
  name: string;
  birthDate: Date | null;
  sire: string;
  dam: string;
  trialCount: number;
  showCount: number;
};

export type BeagleSearchResponseDb = {
  mode: BeagleSearchModeDb;
  total: number;
  totalPages: number;
  page: number;
  items: BeagleSearchRowDb[];
};

const DEFAULT_SORT: BeagleSearchSortDb = "name-asc";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const DEFAULT_NEWEST_LIMIT = 5;
const MAX_NEWEST_LIMIT = 20;

type SearchField = "ek" | "reg" | "name";

type RawDogRow = {
  id: string;
  ekNo: number | null;
  createdAt: Date;
  name: string;
  sex: DogSex;
  birthDate: Date | null;
  registrationNos: string[];
  primaryRegistrationNo: string;
  sire: string;
  dam: string;
  trialCount: number;
  showCount: number;
};

type RegistrationRow = {
  registrationNo: string;
  createdAt: Date;
};

type RegistrationOrderKeyRow = {
  id: string;
  primaryRegistrationNo: string;
};

type DogIdRow = {
  dogId: string;
};

function normalizeText(value: string | undefined): string {
  return (value ?? "").trim();
}

function hasWildcard(value: string): boolean {
  return value.includes("%") || value.includes("_");
}

function resolveMode(input: {
  ek: string;
  reg: string;
  name: string;
}): BeagleSearchModeDb {
  const filledFields: SearchField[] = [];
  if (input.ek) filledFields.push("ek");
  if (input.reg) filledFields.push("reg");
  if (input.name) filledFields.push("name");

  if (filledFields.length === 0) return "none";
  if (filledFields.length === 1) return filledFields[0];
  return "combined";
}

function buildPattern(field: SearchField, rawValue: string): string {
  const value = rawValue.trim();
  if (!value) return "";
  if (hasWildcard(value)) return value;

  if (field === "name") {
    return `%${value}%`;
  }
  if (field === "reg") {
    return `${value}%`;
  }

  return value;
}

function getWildcardProbe(value: string): string {
  const parts = value
    .split(/[%_]+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .sort((left, right) => right.length - left.length);
  return parts[0] ?? "";
}

function escapeForRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesLike(value: string, pattern: string): boolean {
  if (!pattern) return false;
  const regexPattern = pattern
    .split("")
    .map((char) => {
      if (char === "%") return ".*";
      if (char === "_") return ".";
      return escapeForRegex(char);
    })
    .join("");

  const regex = new RegExp(`^${regexPattern}$`, "i");
  return regex.test(value.trim());
}

function parseSort(input: string | undefined): BeagleSearchSortDb {
  if (
    input === "name-asc" ||
    input === "birth-desc" ||
    input === "reg-desc" ||
    input === "created-desc"
  ) {
    return input;
  }
  return DEFAULT_SORT;
}

function parsePage(input: number | undefined): number {
  if (!Number.isFinite(input)) return DEFAULT_PAGE;
  return Math.max(DEFAULT_PAGE, Math.floor(input ?? DEFAULT_PAGE));
}

function parsePageSize(input: number | undefined): number {
  if (!Number.isFinite(input)) return DEFAULT_PAGE_SIZE;
  const parsed = Math.floor(input ?? DEFAULT_PAGE_SIZE);
  return Math.min(MAX_PAGE_SIZE, Math.max(1, parsed));
}

function parseNewestLimit(input: number | undefined): number {
  if (!Number.isFinite(input)) return DEFAULT_NEWEST_LIMIT;
  const parsed = Math.floor(input ?? DEFAULT_NEWEST_LIMIT);
  return Math.min(MAX_NEWEST_LIMIT, Math.max(1, parsed));
}

function parseRegistrationOrder(registrationNo: string): {
  year: number;
  sequence: number;
} | null {
  const normalized = registrationNo.trim().toUpperCase();
  const segments = normalized.split("/");
  if (segments.length < 2) return null;

  const yearToken = segments[segments.length - 1] ?? "";
  if (!/^\d{2}(\d{2})?$/.test(yearToken)) return null;
  const rawYear = Number.parseInt(yearToken, 10);
  const year =
    yearToken.length === 2
      ? rawYear > new Date().getUTCFullYear() % 100
        ? 1900 + rawYear
        : 2000 + rawYear
      : rawYear;

  const beforeSlash = segments.slice(0, -1).join("/");
  const sequenceMatch = beforeSlash.match(/(\d+)(?!.*\d)/);
  if (!sequenceMatch) return null;
  const sequence = Number.parseInt(sequenceMatch[1], 10);

  if (!Number.isFinite(year) || !Number.isFinite(sequence)) return null;

  return {
    year,
    sequence,
  };
}

function compareByRegistrationDesc(left: string, right: string): number {
  const leftOrder = parseRegistrationOrder(left);
  const rightOrder = parseRegistrationOrder(right);

  if (leftOrder && rightOrder) {
    if (rightOrder.year !== leftOrder.year) {
      return rightOrder.year - leftOrder.year;
    }
    if (rightOrder.sequence !== leftOrder.sequence) {
      return rightOrder.sequence - leftOrder.sequence;
    }
  }

  return right.localeCompare(left, "fi", { sensitivity: "base" });
}

function compareRowsByRegistrationDesc(
  left: RawDogRow,
  right: RawDogRow,
): number {
  return compareByRegistrationDesc(
    left.primaryRegistrationNo,
    right.primaryRegistrationNo,
  );
}

function compareRowsByBirthDesc(left: RawDogRow, right: RawDogRow): number {
  if (left.birthDate && right.birthDate) {
    const dateComparison = right.birthDate.getTime() - left.birthDate.getTime();
    if (dateComparison !== 0) return dateComparison;
  } else if (left.birthDate && !right.birthDate) {
    return -1;
  } else if (!left.birthDate && right.birthDate) {
    return 1;
  }

  return left.primaryRegistrationNo.localeCompare(
    right.primaryRegistrationNo,
    "fi",
    { sensitivity: "base" },
  );
}

function compareRowsByCreatedDesc(left: RawDogRow, right: RawDogRow): number {
  const dateComparison = right.createdAt.getTime() - left.createdAt.getTime();
  if (dateComparison !== 0) return dateComparison;

  return right.id.localeCompare(left.id, "fi", { sensitivity: "base" });
}

function compareRowsByNameAsc(left: RawDogRow, right: RawDogRow): number {
  const nameComparison = left.name.localeCompare(right.name, "fi", {
    sensitivity: "base",
  });
  if (nameComparison !== 0) return nameComparison;

  return left.primaryRegistrationNo.localeCompare(
    right.primaryRegistrationNo,
    "fi",
    { sensitivity: "base" },
  );
}

function compareRegistrationRowsDesc(
  left: RegistrationRow,
  right: RegistrationRow,
): number {
  const createdComparison =
    right.createdAt.getTime() - left.createdAt.getTime();
  if (createdComparison !== 0) return createdComparison;
  return compareByRegistrationDesc(left.registrationNo, right.registrationNo);
}

function sortRegistrationsDesc(rows: RegistrationRow[]): RegistrationRow[] {
  return [...rows].sort(compareRegistrationRowsDesc);
}

function getLatestRegistrationNo(rows: RegistrationRow[]): string | null {
  return sortRegistrationsDesc(rows)[0]?.registrationNo ?? null;
}

function sortRows(rows: RawDogRow[], sort: BeagleSearchSortDb): RawDogRow[] {
  const sortable = [...rows];
  if (sort === "created-desc") {
    return sortable.sort(compareRowsByCreatedDesc);
  }
  if (sort === "reg-desc") {
    return sortable.sort(compareRowsByRegistrationDesc);
  }
  if (sort === "birth-desc") {
    return sortable.sort(compareRowsByBirthDesc);
  }
  return sortable.sort(compareRowsByNameAsc);
}

function formatParent(
  parent: {
    name: string;
    registrationNo: string | null;
  } | null,
): string {
  if (!parent) return "-";

  const reg = parent.registrationNo?.trim() ?? "";
  const name = parent.name.trim();

  if (reg && name) return `${reg} ${name}`;
  if (name) return name;
  if (reg) return reg;
  return "-";
}

function toSexCode(value: DogSex): "U" | "N" | "-" {
  if (value === DogSex.MALE) return "U";
  if (value === DogSex.FEMALE) return "N";
  return "-";
}

async function loadRegistrationOrderKeys(
  where: Prisma.DogWhereInput,
): Promise<RegistrationOrderKeyRow[]> {
  const dogs = await prisma.dog.findMany({
    where,
    select: {
      id: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
    },
  });

  return dogs.map((dog) => {
    const sortedRegistrations = sortRegistrationsDesc(dog.registrations);
    return {
      id: dog.id,
      primaryRegistrationNo: sortedRegistrations[0]?.registrationNo ?? "-",
    };
  });
}

async function loadDogIdsWithMultipleRegistrations(): Promise<string[]> {
  const rows = await prisma.$queryRaw<DogIdRow[]>`
    SELECT r."dogId"
    FROM "DogRegistration" r
    GROUP BY r."dogId"
    HAVING COUNT(*) > 1
  `;

  return rows.map((row) => row.dogId);
}

function buildWhere(input: {
  ek: string;
  reg: string;
  name: string;
}): Prisma.DogWhereInput {
  const and: Prisma.DogWhereInput[] = [];

  if (input.ek) {
    if (!hasWildcard(input.ek)) {
      const parsedEk = Number.parseInt(input.ek, 10);
      if (Number.isFinite(parsedEk) && String(parsedEk) === input.ek) {
        and.push({ ekNo: parsedEk });
      } else {
        and.push({ id: "__no_match__" });
      }
    }
  }

  if (input.reg) {
    if (hasWildcard(input.reg)) {
      const probe = getWildcardProbe(input.reg);
      if (probe) {
        and.push({
          registrations: {
            some: {
              registrationNo: {
                contains: probe,
                mode: "insensitive",
              },
            },
          },
        });
      }
    } else {
      and.push({
        registrations: {
          some: {
            registrationNo: {
              startsWith: input.reg,
              mode: "insensitive",
            },
          },
        },
      });
    }
  }

  if (input.name) {
    if (!hasWildcard(input.name)) {
      and.push({
        name: {
          contains: input.name,
          mode: "insensitive",
        },
      });
    } else {
      const probe = getWildcardProbe(input.name);
      if (probe) {
        and.push({
          name: {
            contains: probe,
            mode: "insensitive",
          },
        });
      }
    }
  }

  if (and.length === 0) return {};
  return { AND: and };
}

function matchesRow(
  row: RawDogRow,
  patterns: Record<SearchField, string>,
): boolean {
  const activeFields = (["ek", "reg", "name"] as const).filter(
    (field) => patterns[field].length > 0,
  );

  return activeFields.every((field) => {
    const pattern = patterns[field];
    if (field === "ek") {
      const value = row.ekNo == null ? "" : String(row.ekNo);
      return matchesLike(value, pattern);
    }
    if (field === "reg") {
      return row.registrationNos.some((registrationNo) =>
        matchesLike(registrationNo, pattern),
      );
    }
    return matchesLike(row.name, pattern);
  });
}

type LoadDogsInput = {
  where: Prisma.DogWhereInput;
  skip?: number;
  take?: number;
  orderBy?:
    | Prisma.DogOrderByWithRelationInput
    | Prisma.DogOrderByWithRelationInput[];
};

async function loadDogs(input: LoadDogsInput): Promise<RawDogRow[]> {
  const dogs = await prisma.dog.findMany({
    where: input.where,
    skip: input.skip,
    take: input.take,
    orderBy: input.orderBy,
    select: {
      id: true,
      ekNo: true,
      createdAt: true,
      name: true,
      sex: true,
      birthDate: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
      },
      sire: {
        select: {
          name: true,
          registrations: {
            select: {
              registrationNo: true,
              createdAt: true,
            },
          },
        },
      },
      dam: {
        select: {
          name: true,
          registrations: {
            select: {
              registrationNo: true,
              createdAt: true,
            },
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
  });

  return dogs.map((dog) => {
    const sortedRegistrations = sortRegistrationsDesc(dog.registrations);
    const registrationNos = sortedRegistrations.map(
      (registration) => registration.registrationNo,
    );
    const primaryRegistrationNo = sortedRegistrations[0]?.registrationNo ?? "-";

    return {
      id: dog.id,
      ekNo: dog.ekNo,
      createdAt: dog.createdAt,
      name: dog.name,
      sex: dog.sex,
      birthDate: dog.birthDate,
      registrationNos,
      primaryRegistrationNo,
      sire: formatParent({
        name: dog.sire?.name ?? "",
        registrationNo: dog.sire
          ? getLatestRegistrationNo(dog.sire.registrations)
          : null,
      }),
      dam: formatParent({
        name: dog.dam?.name ?? "",
        registrationNo: dog.dam
          ? getLatestRegistrationNo(dog.dam.registrations)
          : null,
      }),
      trialCount: dog._count.trialResults,
      showCount: dog._count.showResults,
    };
  });
}

function toSearchRow(row: RawDogRow): BeagleSearchRowDb {
  return {
    id: row.id,
    ekNo: row.ekNo,
    registrationNo: row.primaryRegistrationNo,
    registrationNos: row.registrationNos,
    createdAt: row.createdAt,
    sex: toSexCode(row.sex),
    name: row.name,
    birthDate: row.birthDate,
    sire: row.sire,
    dam: row.dam,
    trialCount: row.trialCount,
    showCount: row.showCount,
  };
}

function resolveDbOrderBy(
  sort: BeagleSearchSortDb,
): Prisma.DogOrderByWithRelationInput[] | null {
  if (sort === "name-asc") {
    return [{ name: "asc" }, { id: "asc" }];
  }
  if (sort === "birth-desc") {
    return [{ birthDate: { sort: "desc", nulls: "last" } }, { id: "asc" }];
  }
  if (sort === "created-desc") {
    return [{ createdAt: "desc" }, { id: "desc" }];
  }
  return null;
}

export async function searchBeagleDogsDb(
  input: BeagleSearchRequestDb,
): Promise<BeagleSearchResponseDb> {
  const ek = normalizeText(input.ek);
  const reg = normalizeText(input.reg).toUpperCase();
  const name = normalizeText(input.name);
  const multipleRegsOnly = input.multipleRegsOnly === true;

  const mode = resolveMode({ ek, reg, name });
  const effectiveMode: BeagleSearchModeDb =
    mode === "none" && multipleRegsOnly ? "combined" : mode;
  if (mode === "none" && !multipleRegsOnly) {
    return {
      mode: effectiveMode,
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    };
  }

  const sort = parseSort(input.sort);
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);

  const patterns: Record<SearchField, string> = {
    ek: buildPattern("ek", ek),
    reg: buildPattern("reg", reg),
    name: buildPattern("name", name),
  };

  const baseWhere = buildWhere({
    ek,
    reg,
    name,
  });
  const multiRegistrationDogIds = multipleRegsOnly
    ? await loadDogIdsWithMultipleRegistrations()
    : null;

  if (multipleRegsOnly && (multiRegistrationDogIds?.length ?? 0) === 0) {
    return {
      mode: effectiveMode,
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    };
  }

  const where: Prisma.DogWhereInput =
    multipleRegsOnly && multiRegistrationDogIds
      ? {
          AND: [
            baseWhere,
            {
              id: {
                in: multiRegistrationDogIds,
              },
            },
          ],
        }
      : baseWhere;

  const needsWildcardFilter =
    hasWildcard(ek) || hasWildcard(reg) || hasWildcard(name);
  const requiresInMemoryFilter = needsWildcardFilter;
  const dbOrderBy = resolveDbOrderBy(sort);

  if (!requiresInMemoryFilter && dbOrderBy) {
    const total = await prisma.dog.count({ where });
    const totalPages = Math.ceil(total / pageSize);
    const resolvedPage =
      totalPages === 0
        ? 1
        : Math.min(Math.max(1, page), Math.max(1, totalPages));
    const start = (resolvedPage - 1) * pageSize;
    const rows = await loadDogs({
      where,
      orderBy: dbOrderBy,
      skip: start,
      take: pageSize,
    });

    return {
      mode: effectiveMode,
      total,
      totalPages,
      page: resolvedPage,
      items: rows.map(toSearchRow),
    };
  }

  if (!requiresInMemoryFilter && sort === "reg-desc") {
    const orderKeys = await loadRegistrationOrderKeys(where);
    const sortedOrderKeys = [...orderKeys].sort((left, right) => {
      const registrationComparison = compareByRegistrationDesc(
        left.primaryRegistrationNo,
        right.primaryRegistrationNo,
      );
      if (registrationComparison !== 0) return registrationComparison;
      return right.id.localeCompare(left.id, "fi", { sensitivity: "base" });
    });

    const total = sortedOrderKeys.length;
    const totalPages = Math.ceil(total / pageSize);
    const resolvedPage =
      totalPages === 0
        ? 1
        : Math.min(Math.max(1, page), Math.max(1, totalPages));
    const start = (resolvedPage - 1) * pageSize;
    const pageIds = sortedOrderKeys
      .slice(start, start + pageSize)
      .map((item) => item.id);

    if (pageIds.length === 0) {
      return {
        mode: effectiveMode,
        total,
        totalPages,
        page: resolvedPage,
        items: [],
      };
    }

    const rows = await loadDogs({
      where: {
        id: { in: pageIds },
      },
    });

    const orderById = new Map(pageIds.map((id, index) => [id, index]));
    rows.sort(
      (left, right) =>
        (orderById.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
        (orderById.get(right.id) ?? Number.MAX_SAFE_INTEGER),
    );

    return {
      mode: effectiveMode,
      total,
      totalPages,
      page: resolvedPage,
      items: rows.map(toSearchRow),
    };
  }

  const allRows = await loadDogs({ where });
  const filteredRows = allRows.filter((row) => {
    if (needsWildcardFilter && !matchesRow(row, patterns)) {
      return false;
    }
    if (multipleRegsOnly && row.registrationNos.length < 2) {
      return false;
    }
    return true;
  });
  const sortedRows = sortRows(filteredRows, sort);

  const total = sortedRows.length;
  const totalPages = Math.ceil(total / pageSize);
  const resolvedPage =
    totalPages === 0 ? 1 : Math.min(Math.max(1, page), Math.max(1, totalPages));
  const start = (resolvedPage - 1) * pageSize;
  const paged = sortedRows.slice(start, start + pageSize).map(toSearchRow);

  return {
    mode: effectiveMode,
    total,
    totalPages,
    page: resolvedPage,
    items: paged,
  };
}

export async function getNewestBeagleDogsDb(
  limitInput?: number,
): Promise<BeagleSearchRowDb[]> {
  const limit = parseNewestLimit(limitInput);
  const rows = await loadDogs({
    where: {},
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit,
  });
  return rows.map(toSearchRow);
}
