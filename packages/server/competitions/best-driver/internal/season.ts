const MIN_SEASON_YEAR = 1900;
const MAX_SEASON_YEAR = 2100;

export function parseBestDriverSeason(
  value: number | undefined,
): number | null {
  if (!Number.isFinite(value)) return value == null ? null : Number.NaN;
  const year = Math.trunc(value as number);
  return year >= MIN_SEASON_YEAR && year <= MAX_SEASON_YEAR ? year : Number.NaN;
}

export function getCurrentBestDriverSeason(now = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Helsinki",
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  return month >= 8 ? year : year - 1;
}

export function getBestDriverSeasonRange(season: number): {
  startExclusive: Date;
  endExclusive: Date;
} {
  return {
    startExclusive: new Date(Date.UTC(season, 7, 1)),
    endExclusive: new Date(Date.UTC(season + 1, 2, 1)),
  };
}

export function collectBestDriverSeasons(
  eventDates: Date[],
  currentSeason: number,
): number[] {
  const seasons = new Set<number>([currentSeason]);
  for (const date of eventDates) {
    const month = date.getUTCMonth() + 1;
    if (month >= 8) seasons.add(date.getUTCFullYear());
    else if (month <= 2) seasons.add(date.getUTCFullYear() - 1);
  }
  return [...seasons].sort((left, right) => right - left);
}
