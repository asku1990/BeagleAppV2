const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDateOnly(value: string | undefined): string | null {
  const normalized = value?.trim() ?? "";
  if (!normalized) {
    return null;
  }
  if (!ISO_DATE_ONLY_PATTERN.test(normalized)) {
    return null;
  }

  const date = new Date(`${normalized}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const normalizedAgain = `${year}-${month}-${day}`;
  return normalizedAgain === normalized ? normalized : null;
}

export function parseIsoDateOnlyToUtcDate(value: string): Date | null {
  const isoDateOnly = parseIsoDateOnly(value);
  if (!isoDateOnly) {
    return null;
  }
  return new Date(`${isoDateOnly}T00:00:00.000Z`);
}
