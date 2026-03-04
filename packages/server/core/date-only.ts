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
