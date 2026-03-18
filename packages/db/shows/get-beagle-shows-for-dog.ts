import { prisma } from "../core/prisma";
import { projectCanonicalShowResult } from "./internal/canonical-result-presentation";
import { parseHeightCm } from "./internal/show-row-mappers";
import type { BeagleShowDogRowDb } from "./types";

export async function getBeagleShowsForDogDb(
  dogId: string,
): Promise<BeagleShowDogRowDb[]> {
  const rows = await prisma.showEntry.findMany({
    where: { dogId },
    select: {
      id: true,
      judge: true,
      heightText: true,
      critiqueText: true,
      showEvent: {
        select: {
          eventPlace: true,
          eventDate: true,
          eventType: true,
        },
      },
      resultItems: {
        select: {
          valueCode: true,
          valueNumeric: true,
          isAwarded: true,
          definition: {
            select: {
              code: true,
              sortOrder: true,
              isVisibleByDefault: true,
              category: {
                select: {
                  code: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [
      { showEvent: { eventDate: "desc" } },
      { showEvent: { eventPlace: "asc" } },
      { id: "asc" },
    ],
  });

  return rows.map((row) => ({
    id: row.id,
    place: row.showEvent.eventPlace,
    date: row.showEvent.eventDate,
    ...projectCanonicalShowResult(row.showEvent.eventType, row.resultItems),
    critiqueText: row.critiqueText,
    judge: row.judge,
    heightCm: parseHeightCm(row.heightText),
  }));
}
