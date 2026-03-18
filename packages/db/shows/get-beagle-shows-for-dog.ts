import { prisma } from "../core/prisma";
import { formatCanonicalShowResultText } from "./internal/canonical-result-text";
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
      showEvent: {
        select: {
          eventPlace: true,
          eventDate: true,
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
    result: formatCanonicalShowResultText(
      row.showEvent.eventDate,
      row.resultItems,
    ),
    judge: row.judge,
    heightCm: parseHeightCm(row.heightText),
  }));
}
