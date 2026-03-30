import { normalizeRegistrationNo } from "../../../dogs/manage/normalization";

type WorkbookCell = string | number | boolean | Date | null | undefined;

export function normalizeWorkbookTextCell(value: WorkbookCell): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  return null;
}

export function normalizeWorkbookLookupText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

export function normalizeWorkbookComparisonToken(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase()
    .replace(/[^A-ZÅÄÖ0-9]/g, "");
}

export function normalizeWorkbookRegistrationNo(
  value: WorkbookCell,
): string | null {
  const text = normalizeWorkbookTextCell(value);
  if (!text) {
    return null;
  }

  return normalizeRegistrationNo(text);
}

export function isWorkbookRegistrationNoValid(value: string): boolean {
  return /^[\p{L}\p{N}/.-]+$/u.test(value);
}

function excelSerialToUtcDate(serial: number, date1904: boolean): Date | null {
  if (!Number.isFinite(serial)) {
    return null;
  }

  const wholeDays = Math.floor(serial);
  // Excel's 1900 date system has a fake 1900-02-29 at serial 60, so serials
  // at or after that point need to be shifted back by one day.
  const adjustedDays = date1904 || wholeDays < 60 ? wholeDays : wholeDays - 1;
  const baseDate = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 31);
  const date = new Date(baseDate + adjustedDays * 24 * 60 * 60 * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function normalizeWorkbookDateIso(
  value: WorkbookCell,
  options?: { date1904?: boolean },
): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const parsed = excelSerialToUtcDate(value, options?.date1904 === true);
    return parsed ? parsed.toISOString().slice(0, 10) : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const yyyyMmDd = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (yyyyMmDd?.[1]) {
      return yyyyMmDd[1];
    }

    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime())
      ? null
      : parsed.toISOString().slice(0, 10);
  }

  return null;
}

export function normalizeWorkbookInteger(
  value: WorkbookCell,
): number | null | "INVALID" {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isInteger(value) && value >= 0 ? value : "INVALID";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (!/^\d+$/u.test(trimmed)) {
      return "INVALID";
    }

    return Number.parseInt(trimmed, 10);
  }

  return "INVALID";
}

export function isNonEmptyWorkbookRow(row: WorkbookCell[]): boolean {
  return row.some((cell) => normalizeWorkbookTextCell(cell) !== null);
}
