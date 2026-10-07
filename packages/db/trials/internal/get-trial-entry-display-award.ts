import type { TrialEntryHuomautus } from "@prisma/client";

// Selects the public result code without hiding a valid numeric award for an interruption.
export function getTrialEntryDisplayAward(
  pa: string | null,
  huomautus: TrialEntryHuomautus | null,
): string | null {
  if (huomautus === "LUOPUI") return "L";
  if (huomautus === "SULJETTU") return "S";
  if (huomautus === "KESKEYTETTY" && (!pa || pa === "0")) return "K";
  return pa;
}
