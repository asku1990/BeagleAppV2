const EMAIL_ADDRESS_PATTERN =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export function normalizeEmailAddress(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmailAddress(email: string): boolean {
  return EMAIL_ADDRESS_PATTERN.test(email);
}

export function normalizeAndValidateEmailAddress(email: string): string | null {
  const normalized = normalizeEmailAddress(email);
  if (!normalized || !isValidEmailAddress(normalized)) {
    return null;
  }
  return normalized;
}
