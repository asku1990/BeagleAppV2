const DEFAULT_LOOKUP_LIMIT = 20;
const MAX_LOOKUP_LIMIT = 100;
const MAX_DB_INT = 2_147_483_647;
const REGISTRATION_NO_PATTERN = /^[\p{L}\p{N}/.-]+$/u;

export type AdminDogTitleInputNormalized = {
  awardedOn: Date | null;
  titleCode: string;
  titleName: string | null;
  sortOrder: number;
};

export type ParseAdminDogTitlesErrorCode =
  | "INVALID_TITLE_CODE"
  | "INVALID_TITLE_AWARDED_ON"
  | "INVALID_TITLE_SORT_ORDER"
  | "DUPLICATE_DOG_TITLE";

export type ParseAdminDogTitlesResult =
  | {
      ok: true;
      titles: AdminDogTitleInputNormalized[];
    }
  | {
      ok: false;
      code: ParseAdminDogTitlesErrorCode;
      error: string;
    };

export function normalizeRequiredText(value: string): string | null {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeOptionalText(
  value: string | undefined,
): string | null {
  const normalized = (value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

export function normalizeDistinctNames(value: string[] | undefined): string[] {
  const seen = new Set<string>();
  for (const rawName of value ?? []) {
    const normalized = rawName.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
  }

  return Array.from(seen);
}

export function parseDogSex(
  value: string,
): "MALE" | "FEMALE" | "UNKNOWN" | null {
  if (value === "MALE" || value === "FEMALE" || value === "UNKNOWN") {
    return value;
  }

  return null;
}

export function parseBirthDate(
  value: string | null | undefined,
): Date | null | "INVALID" {
  const normalized = normalizeOptionalText(value ?? undefined);
  if (!normalized) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/u.test(normalized)) {
    return "INVALID";
  }

  const parsed = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return "INVALID";
  }

  const [year, month, day] = normalized.split("-").map(Number);
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() + 1 !== month ||
    parsed.getUTCDate() !== day
  ) {
    return "INVALID";
  }

  return parsed;
}

export function parsePositiveInteger(
  value: number | null | undefined,
): number | null | "INVALID" {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value <= 0 || value > MAX_DB_INT) {
    return "INVALID";
  }

  return value;
}

function parseNonNegativeInteger(
  value: number | null | undefined,
): number | null | "INVALID" {
  if (value === undefined || value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 0 || value > MAX_DB_INT) {
    return "INVALID";
  }

  return value;
}

export function hasMaxLength(value: string | null, maxLength: number): boolean {
  return !value || value.length <= maxLength;
}

export function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim();
}

export function parseLookupLimit(value: number | undefined): number {
  if (!Number.isFinite(value)) {
    return DEFAULT_LOOKUP_LIMIT;
  }

  return Math.min(
    MAX_LOOKUP_LIMIT,
    Math.max(1, Math.floor(value ?? DEFAULT_LOOKUP_LIMIT)),
  );
}

export function normalizeRegistrationNo(value: string): string | null {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  return normalized.toUpperCase();
}

export function normalizeRegistrationNos(
  values: string[] | undefined,
): string[] {
  const normalizedValues: string[] = [];

  for (const value of values ?? []) {
    const normalized = normalizeRegistrationNo(value);
    if (!normalized) {
      continue;
    }
    normalizedValues.push(normalized);
  }

  return normalizedValues;
}

export function isValidRegistrationNo(value: string): boolean {
  return REGISTRATION_NO_PATTERN.test(value);
}

export function parseAdminDogTitles(
  titlesInput:
    | Array<{
        awardedOn?: string | null;
        titleCode: string;
        titleName?: string | null;
        sortOrder?: number;
      }>
    | undefined,
): ParseAdminDogTitlesResult {
  const normalizedTitles: AdminDogTitleInputNormalized[] = [];
  const duplicateKeys = new Set<string>();

  for (const [index, input] of (titlesInput ?? []).entries()) {
    const titleCode = normalizeRequiredText(input.titleCode)?.toUpperCase();
    if (!titleCode) {
      return {
        ok: false,
        code: "INVALID_TITLE_CODE",
        error: "Title code is required.",
      };
    }

    const awardedOn = parseBirthDate(input.awardedOn);
    if (awardedOn === "INVALID") {
      return {
        ok: false,
        code: "INVALID_TITLE_AWARDED_ON",
        error: "Title awarded date must use YYYY-MM-DD format.",
      };
    }

    const sortOrder = parseNonNegativeInteger(input.sortOrder);
    if (sortOrder === "INVALID") {
      return {
        ok: false,
        code: "INVALID_TITLE_SORT_ORDER",
        error: "Title sort order must be a non-negative integer.",
      };
    }

    const duplicateKey = `${titleCode}::${awardedOn ? awardedOn.toISOString().slice(0, 10) : ""}`;
    if (duplicateKeys.has(duplicateKey)) {
      return {
        ok: false,
        code: "DUPLICATE_DOG_TITLE",
        error: "Duplicate dog titles are not allowed.",
      };
    }
    duplicateKeys.add(duplicateKey);

    normalizedTitles.push({
      awardedOn,
      titleCode,
      titleName: normalizeOptionalText(input.titleName ?? undefined),
      sortOrder: sortOrder ?? index,
    });
  }

  return { ok: true, titles: normalizedTitles };
}
