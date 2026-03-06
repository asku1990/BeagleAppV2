import type { BeagleShowSearchRequest } from "@beagle/contracts";

export const beagleShowsQueryKeyRoot = ["beagle", "shows"] as const;
export const beagleShowSearchQueryKeyRoot = [
  ...beagleShowsQueryKeyRoot,
  "search",
] as const;
export const beagleShowDetailsQueryKeyRoot = [
  ...beagleShowsQueryKeyRoot,
  "details",
] as const;

function normalizeDate(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function normalizeNumber(
  value: number | undefined,
  fallback: number | null,
): number | null {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.trunc(value as number);
}

function normalizeSort(
  value: BeagleShowSearchRequest["sort"],
): BeagleShowSearchRequest["sort"] {
  return value ?? "date-desc";
}

export function beagleShowSearchQueryKey(input: BeagleShowSearchRequest = {}) {
  return [
    ...beagleShowSearchQueryKeyRoot,
    normalizeNumber(input.year, null),
    normalizeDate(input.dateFrom),
    normalizeDate(input.dateTo),
    normalizeNumber(input.page, 1),
    normalizeNumber(input.pageSize, 10),
    normalizeSort(input.sort),
  ] as const;
}

export function beagleShowDetailsQueryKey(showId: string) {
  return [...beagleShowDetailsQueryKeyRoot, showId.trim()] as const;
}
