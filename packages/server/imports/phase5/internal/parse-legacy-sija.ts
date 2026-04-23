import { TrialEntryKoetyyppi } from "@beagle/db";

export type ParsedLegacySija = {
  sija: string | null;
  koiriaLuokassa: number | null;
  koetyyppi: TrialEntryKoetyyppi;
  unclear: boolean;
};

function normalizePart(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized.length > 0 ? normalized : null;
}

function parseNullableInteger(value: string | null): number | null {
  if (!value) {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseLegacySija(
  rawValue: string | null | undefined,
): ParsedLegacySija {
  const normalized = normalizePart(rawValue);
  if (!normalized) {
    return {
      sija: null,
      koiriaLuokassa: null,
      koetyyppi: TrialEntryKoetyyppi.NORMAL,
      unclear: false,
    };
  }

  const parts = normalized
    .split("|")
    .map((part) => normalizePart(part))
    .filter((part): part is string => part !== null);

  if (parts.length === 2) {
    const [left, right] = parts;
    const leftUpper = left.toUpperCase();
    const rightUpper = right.toUpperCase();

    if (leftUpper === "PK") {
      return {
        sija: null,
        koiriaLuokassa: parseNullableInteger(right),
        koetyyppi: TrialEntryKoetyyppi.PITKAKOE,
        unclear: parseNullableInteger(right) === null,
      };
    }

    if ((leftUpper === "-" || leftUpper === "") && rightUpper === "KK") {
      return {
        sija: null,
        koiriaLuokassa: null,
        koetyyppi: TrialEntryKoetyyppi.KOKOKAUDENKOE,
        unclear: false,
      };
    }

    const koiriaLuokassa = parseNullableInteger(right);
    if (koiriaLuokassa !== null) {
      return {
        sija: left,
        koiriaLuokassa,
        koetyyppi: TrialEntryKoetyyppi.NORMAL,
        unclear: false,
      };
    }
  }

  return {
    sija: null,
    koiriaLuokassa: null,
    koetyyppi: TrialEntryKoetyyppi.NORMAL,
    unclear: true,
  };
}
