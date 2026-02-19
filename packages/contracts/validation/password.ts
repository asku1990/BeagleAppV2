export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export function isValidPasswordLength(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    password.length <= PASSWORD_MAX_LENGTH
  );
}

export function normalizeAndValidatePassword(password: string): string | null {
  const normalized = password.trim();
  if (!isValidPasswordLength(normalized)) {
    return null;
  }
  return normalized;
}
