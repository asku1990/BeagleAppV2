import { TrialEntryHuomautus } from "@beagle/db";

export type LegacyVaraNormalizationResult = {
  huomautus: TrialEntryHuomautus | null;
  unknownRawValue: string | null;
};

export function normalizeLegacyVara(
  value: string | null,
): LegacyVaraNormalizationResult {
  const trimmed = value?.trim() ?? "";
  const normalized = trimmed.replace(/[;\s]/g, "");

  if (!normalized || normalized === "NUL") {
    return { huomautus: null, unknownRawValue: null };
  }

  if (normalized === "L") {
    return { huomautus: TrialEntryHuomautus.LUOPUI, unknownRawValue: null };
  }

  if (normalized === "S") {
    return { huomautus: TrialEntryHuomautus.SULJETTU, unknownRawValue: null };
  }

  if (normalized === "K") {
    return {
      huomautus: TrialEntryHuomautus.KESKEYTETTY,
      unknownRawValue: null,
    };
  }

  return { huomautus: null, unknownRawValue: trimmed };
}
