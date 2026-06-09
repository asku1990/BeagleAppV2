import type { Prisma } from "@prisma/client";

import type { AdminDogDiseaseBrowseRequestDb } from "../types";

// Builds the Prisma where-clause for admin dog disease browsing.
// Keeps disease-code and free-text filtering centralized in the DB layer.
export function buildDiseaseBrowseWhere(
  input: Pick<AdminDogDiseaseBrowseRequestDb, "selectedDiseaseCode" | "query">,
): Prisma.KoiranSairausWhereInput {
  return {
    ...(input.selectedDiseaseCode !== null
      ? {
          sairaus: { koodi: input.selectedDiseaseCode },
        }
      : {}),
    ...(input.query
      ? {
          OR: [
            {
              rekisterinumero: {
                contains: input.query,
                mode: "insensitive" as const,
              },
            },
            {
              dog: {
                name: {
                  contains: input.query,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),
  };
}
