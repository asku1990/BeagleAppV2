// Registration identifiers vary by country, so validate a safe character set
// instead of enforcing a country-specific shape.
const REGISTRATION_NO_PATTERN = /^[\p{L}\p{N}/.-]+$/u;

export function normalizeTrialRegistrationNo(
  value: string | null,
): string | null {
  const normalized = value?.trim().toUpperCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

export function isValidTrialRegistrationNo(value: string): boolean {
  return REGISTRATION_NO_PATTERN.test(value);
}
