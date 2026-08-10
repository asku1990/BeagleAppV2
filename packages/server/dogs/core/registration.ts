// Normalizes and validates canonical dog registration identifiers shared across domains.
const REGISTRATION_NO_PATTERN = /^[\p{L}\p{N}/.-]+$/u;

export function normalizeRegistrationNo(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : null;
}

export function isValidRegistrationNo(value: string): boolean {
  return REGISTRATION_NO_PATTERN.test(value);
}
