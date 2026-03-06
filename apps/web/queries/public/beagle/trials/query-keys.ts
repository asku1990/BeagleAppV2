import type { BeagleTrialSearchRequest } from "@beagle/contracts";

export const beagleTrialsQueryKeyRoot = ["beagle", "trials"] as const;
export const beagleTrialSearchQueryKeyRoot = [
  ...beagleTrialsQueryKeyRoot,
  "search",
] as const;
export const beagleTrialDetailsQueryKeyRoot = [
  ...beagleTrialsQueryKeyRoot,
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
  value: BeagleTrialSearchRequest["sort"],
): BeagleTrialSearchRequest["sort"] {
  return value ?? "date-desc";
}

export function beagleTrialSearchQueryKey(
  input: BeagleTrialSearchRequest = {},
) {
  return [
    ...beagleTrialSearchQueryKeyRoot,
    normalizeNumber(input.year, null),
    normalizeDate(input.dateFrom),
    normalizeDate(input.dateTo),
    normalizeNumber(input.page, 1),
    normalizeNumber(input.pageSize, 10),
    normalizeSort(input.sort),
  ] as const;
}

export function beagleTrialDetailsQueryKey(trialId: string) {
  return [...beagleTrialDetailsQueryKeyRoot, trialId.trim()] as const;
}
