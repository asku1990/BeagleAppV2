// Formats public trial values consistently for wide views and clipboard output.
import { parseLocalIsoDate } from "@/lib/public/beagle/dogs/profile";
import type { BeagleDogProfileTrialRowDto } from "@beagle/contracts";

export const FALLBACK_VALUE = "-";

export function formatDate(value: string, locale: "fi" | "sv"): string {
  const parsed = parseLocalIsoDate(value);
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return FALLBACK_VALUE;
  }
  return new Intl.DateTimeFormat(locale === "fi" ? "fi-FI" : "sv-FI").format(
    parsed,
  );
}

export function formatNumber(value: number | null): string {
  if (value == null) return FALLBACK_VALUE;
  return value.toFixed(2);
}

export function formatPlacement(row: BeagleDogProfileTrialRowDto): string {
  const rank = row.rank?.trim();
  const classCount = row.koiriaLuokassa;

  if (row.koetyyppi === "KOKOKAUDENKOE") {
    return rank && classCount != null ? `${rank} / ${classCount} KK` : "KK";
  }

  if (row.koetyyppi === "PITKAKOE") {
    return rank && classCount != null ? `${rank} / ${classCount} PK` : "PK";
  }

  if (rank && classCount != null) {
    return `${rank} / ${classCount}`;
  }

  return rank || FALLBACK_VALUE;
}
