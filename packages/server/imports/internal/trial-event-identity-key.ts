import { toEventSourceDatePart } from "./date-key";

// Builds the fallback legacy event identity used by the phase2 canonical import.
// This keeps event grouping deterministic when SKL identifiers are unavailable.
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
