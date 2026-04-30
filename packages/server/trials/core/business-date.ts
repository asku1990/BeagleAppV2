import { BUSINESS_TIME_ZONE, toBusinessDateOnly } from "@server/core/date-only";

function parseIsoDateOnlyParts(value: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) {
    return null;
  }

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

  const midnightAsUtcMs = Date.UTC(
    parsed.year,
    parsed.month - 1,
    parsed.day,
    0,
    0,
    0,
    0,
  );
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

export function getTrialBusinessDateStartUtc(isoDate: string): Date | null {
  return toBusinessDateStartUtc(isoDate);
}

export function getTrialBusinessYearUtcRange(year: number): {
  start: Date;
  endExclusive: Date;
} | null {
  const start = toBusinessDateStartUtc(`${year}-01-01`);
  const endExclusive = toBusinessDateStartUtc(`${year + 1}-01-01`);
  if (!start || !endExclusive) {
    return null;
  }

  return { start, endExclusive };
}

export function getTrialBusinessDateUtcRange(value: Date): {
  start: Date;
  endExclusive: Date;
} {
  const isoDate = toBusinessDateOnly(value);
  const start = toBusinessDateStartUtc(isoDate);
  const nextIsoDate = addIsoDateDays(isoDate, 1);
  const endExclusive = nextIsoDate ? toBusinessDateStartUtc(nextIsoDate) : null;

  if (!start || !endExclusive) {
    throw new Error("Failed to build business date UTC range.");
  }

  return { start, endExclusive };
}

export function toTrialBusinessYear(value: Date): number {
  const year = toBusinessDateOnly(value).slice(0, 4);
  const parsed = Number.parseInt(year, 10);
  return Number.isFinite(parsed) ? parsed : value.getUTCFullYear();
}
