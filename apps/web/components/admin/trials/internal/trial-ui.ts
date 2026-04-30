export type AdminTrialSearchMode = "year" | "range";
export type AdminTrialSearchSort = "date-desc" | "date-asc";

export const ADMIN_TRIAL_PAGE_SIZE = 20;

export function showDash(
  value: string | number | boolean | null | undefined,
): string {
  if (value === null || value === undefined) {
    return "-";
  }

  const normalized = String(value).trim();
  return normalized.length > 0 ? normalized : "-";
}

export function formatPoints(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("fi-FI", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function parseYearInput(value: string): number | null {
  const normalized = value.trim();
  if (!normalized) return null;
  if (!/^\d{4}$/.test(normalized)) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 1900 || parsed > 2100) {
    return null;
  }

  return parsed;
}

export function isDateRangeValid(dateFrom: string, dateTo: string): boolean {
  return Boolean(dateFrom && dateTo && dateFrom <= dateTo);
}
