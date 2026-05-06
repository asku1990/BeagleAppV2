import type { KoiratietokantaAjokWarning } from "@beagle/contracts";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

export function normalizeText(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const normalized = String(value).trim();
  if (!normalized || normalized === "-") return null;
  if (/^-+\s*-\s*-+$/.test(normalized)) return null;
  return normalized.replace(/\s+/g, " ");
}

export function parseInteger(value: unknown): number | null {
  const text = normalizeText(value);
  if (!text || !/^-?\d+$/.test(text)) return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function parseDecimal(value: unknown): number | null {
  const text = normalizeText(value);
  if (!text) return null;
  const normalized = text.replace(",", ".");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseBooleanFlag(value: unknown): boolean | null {
  if (value === true || value === 1) return true;
  if (value === false || value === 0) return false;
  const text = normalizeText(value)?.toLowerCase();
  if (!text) return null;
  if (text === "1" || text === "true") return true;
  if (text === "0" || text === "false") return false;
  return null;
}

export function parseKoepvm(value: unknown): Date | null {
  const text = normalizeText(value);
  const match = text?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function maybeWarnInvalidOptionalValue(
  payload: Record<string, unknown>,
  field: string,
  warnings: KoiratietokantaAjokWarning[],
): void {
  if (!(field in payload)) return;
  const normalized = normalizeText(payload[field]);
  if (normalized !== null) {
    warnings.push({
      code: "OPTIONAL_FIELD_PARSE_FAILED",
      field,
      message: "Optional field value could not be parsed.",
    });
  }
}

export function parseOptionalInteger(
  payload: Record<string, unknown>,
  field: string,
  warnings: KoiratietokantaAjokWarning[],
): number | null {
  const parsed = parseInteger(payload[field]);
  if (parsed !== null) return parsed;
  maybeWarnInvalidOptionalValue(payload, field, warnings);
  return null;
}

export function parseOptionalDecimal(
  payload: Record<string, unknown>,
  field: string,
  warnings: KoiratietokantaAjokWarning[],
): number | null {
  const parsed = parseDecimal(payload[field]);
  if (parsed !== null) return parsed;
  maybeWarnInvalidOptionalValue(payload, field, warnings);
  return null;
}
