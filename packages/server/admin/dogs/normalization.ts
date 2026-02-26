const DEFAULT_LOOKUP_LIMIT = 20;
const MAX_LOOKUP_LIMIT = 100;
const MAX_DB_INT = 2_147_483_647;

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
