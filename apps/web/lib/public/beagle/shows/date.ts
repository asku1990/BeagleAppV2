function parseLocalIsoDate(input: string): Date | null {
  const trimmed = input.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function normalizeIsoDateOnlyInput(
  input: string | null | undefined,
): string {
  const trimmed = (input ?? "").trim();
  return parseLocalIsoDate(trimmed) ? trimmed : "";
}

export function formatIsoDateForDisplay(
  value: string,
  locale: "fi" | "sv",
): string {
  const parsed = parseLocalIsoDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return "-";
  }

  const localeTag = locale === "fi" ? "fi-FI" : "sv-FI";
  return new Intl.DateTimeFormat(localeTag).format(parsed);
}
