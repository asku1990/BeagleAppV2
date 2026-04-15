import { toEventSourceDatePart } from "./date-key";

function normalizePart(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\|/g, "/");
}

// Builds a deterministic legacy fallback event key when SKL id is unavailable.
export function toTrialLegacyEventKey(input: {
  koepaiva: Date;
  koekunta: string;
  kennelpiiri: string | null;
  kennelpiirinro: string | null;
}): string {
  return [
    toEventSourceDatePart(input.koepaiva),
    normalizePart(input.koekunta),
    normalizePart(input.kennelpiiri),
    normalizePart(input.kennelpiirinro),
  ].join("|");
}
