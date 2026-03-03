import type { BeagleSearchModeDb } from "../repository";
import type { SearchField } from "./types";

export function resolveMode(input: {
  ek: string;
  reg: string;
  name: string;
}): BeagleSearchModeDb {
  const filledFields: SearchField[] = [];
  if (input.ek) filledFields.push("ek");
  if (input.reg) filledFields.push("reg");
  if (input.name) filledFields.push("name");

  if (filledFields.length === 0) return "none";
  if (filledFields.length === 1) return filledFields[0];
  return "combined";
}
