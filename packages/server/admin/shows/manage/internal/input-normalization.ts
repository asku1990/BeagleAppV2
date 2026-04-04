export function normalizeRequiredText(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

export function normalizeOptionalText(value: string): string | null {
  const normalized = normalizeRequiredText(value);
  return normalized.length > 0 ? normalized : null;
}
