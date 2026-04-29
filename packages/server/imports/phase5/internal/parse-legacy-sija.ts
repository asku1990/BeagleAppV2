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

function parsePrefixedInteger(value: string, prefix: string): number | null {
  const match = new RegExp(`^${prefix}\\s*(\\d+)$`, "i").exec(value);
  if (!match) {
    return null;
  }

  return parseNullableInteger(match[1] ?? null);
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

  if (normalized === "-") {
    return {
      sija: null,
      koiriaLuokassa: null,
      koetyyppi: TrialEntryKoetyyppi.NORMAL,
      unclear: false,
    };
  }

  if (normalized.toUpperCase() === "KK") {
    return {
      sija: null,
      koiriaLuokassa: null,
      koetyyppi: TrialEntryKoetyyppi.KOKOKAUDENKOE,
      unclear: false,
    };
  }

  if (/^-+\d+$/.test(normalized)) {
    const koiriaLuokassa = parseNullableInteger(normalized.replace(/^-+/, ""));
    if (koiriaLuokassa !== null && koiriaLuokassa > 0) {
      return {
        sija: null,
        koiriaLuokassa,
        koetyyppi: TrialEntryKoetyyppi.NORMAL,
        unclear: false,
      };
    }
  }

  const separatorNormalized = normalized.replace(
    /(?<=[\p{L}\p{N}])(?:[.\-]+)(?=[\p{L}\p{N}])/gu,
    "|",
  );

  const parts = separatorNormalized
    .split("|")
    .map((part) => normalizePart(part))
    .filter((part): part is string => part !== null);

  if (parts.length === 2) {
    const [left, right] = parts;
    const leftUpper = left.toUpperCase();
    const rightUpper = right.toUpperCase();

    if (leftUpper.startsWith("PK") || rightUpper.startsWith("PK")) {
      const pkPart = leftUpper.startsWith("PK") ? left : right;
      const otherPart = leftUpper.startsWith("PK") ? right : left;
      const koiriaLuokassa =
        parseNullableInteger(otherPart) ?? parsePrefixedInteger(pkPart, "PK");

      return {
        sija: "PK",
        koiriaLuokassa,
        koetyyppi: TrialEntryKoetyyppi.PITKAKOE,
        unclear: false,
      };
    }

    if (leftUpper.startsWith("KK") || rightUpper.startsWith("KK")) {
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
