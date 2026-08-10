import { parseIsoDateOnlyToUtcDate } from "@server/trials/internal/iso-date";

function addUtcDays(value: Date, days: number): Date {
  const result = new Date(value.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

// Trial dates are PostgreSQL DATE values represented by Prisma as UTC carriers.
export function getTrialDateOnlyStartUtc(isoDate: string): Date | null {
  return parseIsoDateOnlyToUtcDate(isoDate);
}

export function getTrialDateOnlyYearUtcRange(year: number): {
  start: Date;
  endExclusive: Date;
} | null {
  const start = parseIsoDateOnlyToUtcDate(`${year}-01-01`);
  const endExclusive = parseIsoDateOnlyToUtcDate(`${year + 1}-01-01`);
  return start && endExclusive ? { start, endExclusive } : null;
}

export function getTrialDateOnlyUtcRange(value: Date): {
  start: Date;
  endExclusive: Date;
} {
  const start = new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
  return { start, endExclusive: addUtcDays(start, 1) };
}

export function toTrialDateOnlyYear(value: Date): number {
  return value.getUTCFullYear();
}

export function formatTrialDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}
