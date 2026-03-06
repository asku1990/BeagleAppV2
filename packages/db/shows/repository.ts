import { DogSex, type Prisma } from "@prisma/client";
import { prisma } from "../core/prisma";

export type BeagleShowSearchSortDb = "date-desc" | "date-asc";
export type BeagleShowSearchModeDb = "year" | "range";

export type BeagleShowSearchRequestDb = {
  mode: BeagleShowSearchModeDb;
  year?: number;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  pageSize?: number;
  sort?: BeagleShowSearchSortDb;
};

export type BeagleShowSearchRowDb = {
  eventDate: Date;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
};

export type BeagleShowSearchResponseDb = {
  mode: BeagleShowSearchModeDb;
  year: number | null;
  dateFrom: Date | null;
  dateTo: Date | null;
  availableYears: number[];
  total: number;
  totalPages: number;
  page: number;
  items: BeagleShowSearchRowDb[];
};

export type BeagleShowDetailsRequestDb = {
  eventDate: Date;
  eventPlace: string;
};

export type BeagleShowDetailsRowDb = {
  id: string;
  dogId: string;
  registrationNo: string;
  name: string;
  sex: "U" | "N" | "-";
  result: string | null;
  heightCm: number | null;
  judge: string | null;
};

export type BeagleShowDetailsResponseDb = {
  eventDate: Date;
  eventPlace: string;
  judge: string | null;
  dogCount: number;
  items: BeagleShowDetailsRowDb[];
};

function parsePage(value: number | undefined): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.floor(value ?? 1));
}

function parsePageSize(value: number | undefined): number {
  if (!Number.isFinite(value)) return 10;
  return Math.min(100, Math.max(1, Math.floor(value ?? 10)));
}

function resolvePagination(
  total: number,
  page: number,
  pageSize: number,
): {
  totalPages: number;
  page: number;
  start: number;
} {
  if (total === 0) {
    return { totalPages: 0, page: 1, start: 0 };
  }

  const totalPages = Math.ceil(total / pageSize);
  const clampedPage = Math.min(Math.max(1, page), totalPages);
  return {
    totalPages,
    page: clampedPage,
    start: (clampedPage - 1) * pageSize,
  };
}

function normalizeSort(
  value: BeagleShowSearchSortDb | undefined,
): BeagleShowSearchSortDb {
  return value === "date-asc" ? "date-asc" : "date-desc";
}

function buildWhere(
  input: BeagleShowSearchRequestDb,
): Prisma.ShowResultWhereInput {
  if (input.mode === "year" && Number.isFinite(input.year)) {
    const year = Math.floor(input.year ?? 0);
    return {
      eventDate: {
        gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
        lt: new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0)),
      },
    };
  }

  if (input.mode === "range" && input.dateFrom && input.dateTo) {
    return {
      eventDate: {
        gte: input.dateFrom,
        lt: input.dateTo,
      },
    };
  }

  return {};
}

const BUSINESS_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Helsinki",
  year: "numeric",
});

function toBusinessYear(value: Date): number {
  const year = BUSINESS_YEAR_FORMATTER.formatToParts(value).find(
    (part) => part.type === "year",
  )?.value;
  if (!year) return value.getUTCFullYear();
  const parsed = Number.parseInt(year, 10);
  return Number.isFinite(parsed) ? parsed : value.getUTCFullYear();
}

function compareRows(
  left: BeagleShowSearchRowDb,
  right: BeagleShowSearchRowDb,
  sort: BeagleShowSearchSortDb,
): number {
  const dateComparison =
    sort === "date-asc"
      ? left.eventDate.getTime() - right.eventDate.getTime()
      : right.eventDate.getTime() - left.eventDate.getTime();
  if (dateComparison !== 0) return dateComparison;
  return left.eventPlace.localeCompare(right.eventPlace, "fi", {
    sensitivity: "base",
  });
}

export async function searchBeagleShowsDb(
  input: BeagleShowSearchRequestDb,
): Promise<BeagleShowSearchResponseDb> {
  const page = parsePage(input.page);
  const pageSize = parsePageSize(input.pageSize);
  const sort = normalizeSort(input.sort);
  const where = buildWhere(input);

  const [yearRows, groupedRows] = await Promise.all([
    prisma.showResult.groupBy({
      by: ["eventDate"],
    }),
    prisma.showResult.groupBy({
      by: ["eventDate", "eventPlace"],
      where,
      _count: { _all: true },
      _max: { judge: true },
    }),
  ]);

  const availableYears = Array.from(
    new Set(yearRows.map((row) => toBusinessYear(row.eventDate))),
  ).sort((left, right) => right - left);

  const rows: BeagleShowSearchRowDb[] = groupedRows
    .map((row) => ({
      eventDate: row.eventDate,
      eventPlace: row.eventPlace,
      judge: row._max.judge ?? null,
      dogCount: row._count._all,
    }))
    .sort((left, right) => compareRows(left, right, sort));

  const total = rows.length;
  const pagination = resolvePagination(total, page, pageSize);
  const items = rows.slice(pagination.start, pagination.start + pageSize);

  return {
    mode: input.mode,
    year:
      input.mode === "year" && Number.isFinite(input.year)
        ? Math.floor(input.year ?? 0)
        : null,
    dateFrom: input.mode === "range" ? (input.dateFrom ?? null) : null,
    dateTo: input.mode === "range" ? (input.dateTo ?? null) : null,
    availableYears,
    total,
    totalPages: pagination.totalPages,
    page: pagination.page,
    items,
  };
}

function toSexCode(value: DogSex): "U" | "N" | "-" {
  if (value === DogSex.MALE) return "U";
  if (value === DogSex.FEMALE) return "N";
  return "-";
}

function parseHeightCm(value: string | null): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function compareDetailRows(
  left: BeagleShowDetailsRowDb,
  right: BeagleShowDetailsRowDb,
): number {
  const sexOrder: Record<BeagleShowDetailsRowDb["sex"], number> = {
    U: 0,
    N: 1,
    "-": 2,
  };
  const sexComparison = sexOrder[left.sex] - sexOrder[right.sex];
  if (sexComparison !== 0) return sexComparison;

  const resultComparison = (left.result ?? "").localeCompare(
    right.result ?? "",
    "fi",
    {
      sensitivity: "base",
    },
  );
  if (resultComparison !== 0) return resultComparison;

  const nameComparison = left.name.localeCompare(right.name, "fi", {
    sensitivity: "base",
  });
  if (nameComparison !== 0) return nameComparison;

  return left.registrationNo.localeCompare(right.registrationNo, "fi", {
    sensitivity: "base",
  });
}

export async function getBeagleShowDetailsDb(
  input: BeagleShowDetailsRequestDb,
): Promise<BeagleShowDetailsResponseDb | null> {
  const rows = await prisma.showResult.findMany({
    where: {
      eventDate: input.eventDate,
      eventPlace: input.eventPlace,
    },
    include: {
      dog: {
        select: {
          id: true,
          name: true,
          sex: true,
          registrations: {
            select: {
              registrationNo: true,
            },
            orderBy: [{ createdAt: "asc" }, { registrationNo: "asc" }],
            take: 1,
          },
        },
      },
    },
  });

  if (rows.length === 0) {
    return null;
  }

  const items: BeagleShowDetailsRowDb[] = rows
    .map((row) => ({
      id: row.id,
      dogId: row.dog.id,
      registrationNo: row.dog.registrations[0]?.registrationNo ?? "-",
      name: row.dog.name,
      sex: toSexCode(row.dog.sex),
      result: row.resultText,
      heightCm: parseHeightCm(row.heightText),
      judge: row.judge,
    }))
    .sort(compareDetailRows);

  const judges = Array.from(
    new Set(
      rows
        .map((row) => row.judge?.trim())
        .filter((judge): judge is string => Boolean(judge)),
    ),
  );

  return {
    eventDate: rows[0].eventDate,
    eventPlace: rows[0].eventPlace,
    judge: judges.length === 1 ? judges[0] : null,
    dogCount: items.length,
    items,
  };
}
