import { DogSex, type Prisma } from "@prisma/client";
import { BUSINESS_TIME_ZONE, toBusinessDateOnly } from "../core/date-only";
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

export type BeagleShowDogRowDb = {
  id: string;
  place: string;
  date: Date;
  result: string | null;
  judge: string | null;
  heightCm: number | null;
};

function parseIsoDateOnlyParts(
  value: string,
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  if (
    utcDate.getUTCFullYear() !== year ||
    utcDate.getUTCMonth() !== month - 1 ||
    utcDate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const year = Number.parseInt(
    parts.find((part) => part.type === "year")?.value ?? "0",
    10,
  );
  const month = Number.parseInt(
    parts.find((part) => part.type === "month")?.value ?? "0",
    10,
  );
  const day = Number.parseInt(
    parts.find((part) => part.type === "day")?.value ?? "0",
    10,
  );
  const hour = Number.parseInt(
    parts.find((part) => part.type === "hour")?.value ?? "0",
    10,
  );
  const minute = Number.parseInt(
    parts.find((part) => part.type === "minute")?.value ?? "0",
    10,
  );
  const second = Number.parseInt(
    parts.find((part) => part.type === "second")?.value ?? "0",
    10,
  );
  // Some runtimes can still emit 24 for midnight. Treat it as 00 of the same
  // calendar day to avoid introducing a +24h offset drift.
  const normalizedHour = hour === 24 ? 0 : hour;
  const asUtc = Date.UTC(
    year,
    month - 1,
    day,
    normalizedHour,
    minute,
    second,
    0,
  );
  return asUtc - date.getTime();
}

function toBusinessDateStartUtc(isoDate: string): Date | null {
  const parsed = parseIsoDateOnlyParts(isoDate);
  if (!parsed) {
    return null;
  }

  const { year, month, day } = parsed;
  const midnightAsUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0);
  let utcTimeMs = midnightAsUtcMs;

  for (let index = 0; index < 3; index += 1) {
    const offsetMs = getTimeZoneOffsetMs(
      new Date(utcTimeMs),
      BUSINESS_TIME_ZONE,
    );
    utcTimeMs = midnightAsUtcMs - offsetMs;
  }

  return new Date(utcTimeMs);
}

function addIsoDateDays(isoDate: string, days: number): string | null {
  const parsed = parseIsoDateOnlyParts(isoDate);
  if (!parsed) {
    return null;
  }
  const base = new Date(
    Date.UTC(parsed.year, parsed.month - 1, parsed.day, 0, 0, 0, 0),
  );
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
}

function normalizeUtcDateToBusinessDateStart(value: Date): Date | null {
  const isoDate = toBusinessDateOnly(value);
  return toBusinessDateStartUtc(isoDate);
}

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
    const start = toBusinessDateStartUtc(`${year}-01-01`);
    const end = toBusinessDateStartUtc(`${year + 1}-01-01`);
    if (!start || !end) {
      return {};
    }
    return {
      eventDate: {
        gte: start,
        lt: end,
      },
    };
  }

  if (input.mode === "range" && input.dateFrom && input.dateTo) {
    const start = normalizeUtcDateToBusinessDateStart(input.dateFrom);
    const end = normalizeUtcDateToBusinessDateStart(input.dateTo);
    if (!start || !end) {
      return {};
    }

    return {
      eventDate: {
        gte: start,
        lt: end,
      },
    };
  }

  return {};
}

const BUSINESS_YEAR_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
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
  const pageRows = rows.slice(pagination.start, pagination.start + pageSize);

  const judgeRows =
    pageRows.length === 0
      ? []
      : await prisma.showResult.findMany({
          where: {
            OR: pageRows.map((row) => ({
              eventDate: row.eventDate,
              eventPlace: row.eventPlace,
            })),
          },
          select: {
            eventDate: true,
            eventPlace: true,
            judge: true,
          },
        });

  const judgeByEvent = new Map<string, string | null>();
  for (const row of judgeRows) {
    const key = `${row.eventDate.toISOString()}::${row.eventPlace}`;
    const normalizedJudge = row.judge?.trim() ?? "";
    if (!normalizedJudge) {
      continue;
    }
    const existing = judgeByEvent.get(key);
    if (existing == null) {
      judgeByEvent.set(key, normalizedJudge);
      continue;
    }
    if (existing !== normalizedJudge) {
      judgeByEvent.set(key, null);
    }
  }

  const items = pageRows.map((row) => {
    const key = `${row.eventDate.toISOString()}::${row.eventPlace}`;
    const judge = judgeByEvent.get(key);
    return {
      ...row,
      judge: judge === undefined ? null : judge,
    };
  });

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
  const eventDateIso = toBusinessDateOnly(input.eventDate);
  const rangeStart = toBusinessDateStartUtc(eventDateIso);
  const nextEventDateIso = addIsoDateDays(eventDateIso, 1);
  const rangeEnd = nextEventDateIso
    ? toBusinessDateStartUtc(nextEventDateIso)
    : null;
  if (!rangeStart || !rangeEnd) {
    return null;
  }

  const rows = await prisma.showResult.findMany({
    where: {
      eventDate: {
        gte: rangeStart,
        lt: rangeEnd,
      },
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

export async function getBeagleShowsForDogDb(
  dogId: string,
): Promise<BeagleShowDogRowDb[]> {
  const rows = await prisma.showResult.findMany({
    where: { dogId },
    select: {
      id: true,
      eventPlace: true,
      eventDate: true,
      resultText: true,
      judge: true,
      heightText: true,
    },
    orderBy: [{ eventDate: "desc" }, { eventPlace: "asc" }, { id: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    place: row.eventPlace,
    date: row.eventDate,
    result: row.resultText,
    judge: row.judge,
    heightCm: parseHeightCm(row.heightText),
  }));
}
