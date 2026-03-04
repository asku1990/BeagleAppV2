const BIRTH_YEAR_PATTERN = /^\d{4}$/;
const MIN_BIRTH_YEAR = 1000;
const MAX_BIRTH_YEAR = 9999;

export function normalizeBirthYearInput(
  value: string | null | undefined,
): string {
  const normalized = (value ?? "").trim();
  if (!BIRTH_YEAR_PATTERN.test(normalized)) {
    return "";
  }

  const parsed = Number.parseInt(normalized, 10);
  if (
    !Number.isFinite(parsed) ||
    parsed < MIN_BIRTH_YEAR ||
    parsed > MAX_BIRTH_YEAR
  ) {
    return "";
  }

  return normalized;
}

export function parseBirthYearInput(
  value: string | null | undefined,
): number | undefined {
  const normalized = normalizeBirthYearInput(value);
  if (!normalized) {
    return undefined;
  }

  return Number.parseInt(normalized, 10);
}
