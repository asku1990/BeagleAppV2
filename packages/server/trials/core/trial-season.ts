import { parseIsoDateOnlyToUtcDate } from "@server/trials/internal/iso-date";

export type TrialSeason = { startYear: number; endYear: number };

// Trial seasons run from August 1 (inclusive) to the following August 1 (exclusive).
export function parseTrialSeason(
  value: string | undefined,
): TrialSeason | null {
  if (typeof value !== "string") return null;
  const match = value?.trim().match(/^(\d{4})-(\d{4})$/);
  if (!match) return null;
  const startYear = Number.parseInt(match[1], 10);
  const endYear = Number.parseInt(match[2], 10);
  if (startYear < 1900 || startYear > 2100 || endYear !== startYear + 1) {
    return null;
  }
  return { startYear, endYear };
}

export function formatTrialSeason(season: TrialSeason): string {
  return `${season.startYear}-${season.endYear}`;
}

export function getTrialSeasonUtcRange(value: TrialSeason): {
  start: Date;
  endExclusive: Date;
} {
  return {
    start: parseIsoDateOnlyToUtcDate(`${value.startYear}-08-01`) as Date,
    endExclusive: parseIsoDateOnlyToUtcDate(`${value.endYear}-08-01`) as Date,
  };
}

export function toTrialSeason(value: Date): TrialSeason {
  const year = value.getUTCFullYear();
  const startYear = value.getUTCMonth() >= 7 ? year : year - 1;
  return { startYear, endYear: startYear + 1 };
}
