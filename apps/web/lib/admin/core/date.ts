function parseIsoDateParts(
  value: string,
): { year: number; month: number; day: number } | null {
  const normalized = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(normalized);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
}

export function normalizeDateForInput(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return value.slice(0, 10);
}

export function formatDateForFinland(value: string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const parsed = parseIsoDateParts(value);
  if (!parsed) {
    return value;
  }

  const utcDate = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
  return new Intl.DateTimeFormat("fi-FI", { timeZone: "UTC" }).format(utcDate);
}
