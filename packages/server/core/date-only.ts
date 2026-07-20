export const BUSINESS_TIME_ZONE = "Europe/Helsinki";

const BUSINESS_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function toBusinessDateOnly(value: Date): string {
  const parts = BUSINESS_DATE_FORMATTER.formatToParts(value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Failed to serialize date-only value.");
  }

  return `${year}-${month}-${day}`;
}

/** Serializes a Prisma date-only value without applying timezone conversion. */
export function toDateOnly(value: Date): string {
  if (Number.isNaN(value.getTime())) {
    throw new Error("Failed to serialize date-only value.");
  }

  const year = String(value.getUTCFullYear()).padStart(4, "0");
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Compares an already validated YYYY-MM-DD value with the current Helsinki
 * business date. Canonical date-only strings are ordered lexicographically;
 * this helper does not validate arbitrary strings.
 */
export function isFutureBusinessDate(
  dateOnly: string,
  now: Date = new Date(),
): boolean {
  return dateOnly > toBusinessDateOnly(now);
}
