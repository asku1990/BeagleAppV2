const MIN_SEASON_YEAR = 2016;
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
    const season =
      month >= 8
        ? date.getUTCFullYear()
        : month <= 2
          ? date.getUTCFullYear() - 1
          : null;
    if (season !== null && season >= MIN_SEASON_YEAR) seasons.add(season);
  }
  return [...seasons].sort((left, right) => right - left);
}
