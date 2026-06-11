import type { DogEpiDiseaseFactDb } from "@beagle/db/dogs/core/epi-disease-facts";
import type { DogPedigreeAncestryDb } from "@beagle/db/dogs/core/pedigree-ancestry";
import { calculateDogEpiSummary } from "@server/dogs/core";

// Thin compatibility wrapper around the shared dog-health calculator.
export type AdminDogEpiSummary = ReturnType<typeof calculateDogEpiSummary>;

export function calculateAdminDogEpiSummary(
  rootDogId: string,
  ancestry: DogPedigreeAncestryDb,
  diseaseFacts: DogEpiDiseaseFactDb[],
): AdminDogEpiSummary {
  return calculateDogEpiSummary(rootDogId, ancestry, diseaseFacts);
}
