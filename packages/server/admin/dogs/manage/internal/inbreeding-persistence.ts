import { loadDogPedigreeAncestryForParentsDb } from "@beagle/db";
import {
  calculateInbreedingCoefficientForParentsPct,
  getInbreedingAncestryLoadDepth,
} from "@server/dogs/core";
import type { ParentRef } from "./parent-resolution";

export async function calculatePersistedInbreedingCoefficientPct(
  sire: ParentRef | null,
  dam: ParentRef | null,
): Promise<number | null> {
  if (!sire || !dam) {
    return null;
  }

  const ancestry = await loadDogPedigreeAncestryForParentsDb(
    sire.id,
    dam.id,
    getInbreedingAncestryLoadDepth(9),
  );
  return calculateInbreedingCoefficientForParentsPct(
    sire.id,
    dam.id,
    ancestry,
    9,
  );
}
