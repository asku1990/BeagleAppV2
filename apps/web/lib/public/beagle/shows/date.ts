import { parseLocalIsoDate } from "../date";

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
