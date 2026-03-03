const DEFAULT_NEWEST_LIMIT = 5;
const MAX_NEWEST_LIMIT = 20;

export function parseNewestLimit(input: number | undefined): number {
  if (!Number.isFinite(input)) return DEFAULT_NEWEST_LIMIT;
  const parsed = Math.floor(input ?? DEFAULT_NEWEST_LIMIT);
  return Math.min(MAX_NEWEST_LIMIT, Math.max(1, parsed));
}
