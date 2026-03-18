import {
  addBusinessIsoDateDays,
  getBusinessDateStartUtc,
  toBusinessDateOnly,
} from "../core/date-only";
import { prisma } from "../core/prisma";
import { projectCanonicalShowResult } from "./internal/canonical-result-presentation";
import { collapseJudge } from "./internal/show-judge";
import {
  compareDetailRows,
  parseHeightCm,
  toSexCode,
} from "./internal/show-row-mappers";
import type {
  BeagleShowDetailsRequestDb,
  BeagleShowDetailsResponseDb,
  BeagleShowDetailsRowDb,
} from "./types";

export async function getBeagleShowDetailsDb(
  input: BeagleShowDetailsRequestDb,
): Promise<BeagleShowDetailsResponseDb | null> {
  const eventDateIso = toBusinessDateOnly(input.eventDate);
  const rangeStart = getBusinessDateStartUtc(eventDateIso);
  const nextEventDateIso = addBusinessIsoDateDays(eventDateIso, 1);
  const rangeEnd = nextEventDateIso
    ? getBusinessDateStartUtc(nextEventDateIso)
    : null;
  if (!rangeStart || !rangeEnd) {
    return null;
  }

  const event = await prisma.showEvent.findFirst({
    where: {
      eventDate: {
        gte: rangeStart,
        lt: rangeEnd,
      },
      eventPlace: input.eventPlace,
    },
    select: {
      eventDate: true,
      eventPlace: true,
      eventType: true,
      entries: {
        where: {
          dogId: {
            not: null,
          },
        },
        select: {
          id: true,
          judge: true,
          critiqueText: true,
          heightText: true,
          dog: {
            select: {
              id: true,
              name: true,
              sex: true,
              registrations: {
                select: {
                  registrationNo: true,
                },
                orderBy: [{ createdAt: "asc" }, { registrationNo: "asc" }],
                take: 1,
              },
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
      },
    },
  });

  if (!event || event.entries.length === 0) {
    return null;
  }

  const items: BeagleShowDetailsRowDb[] = event.entries
    .filter(
      (
        row,
      ): row is typeof row & {
        dog: NonNullable<typeof row.dog>;
      } => row.dog !== null,
    )
    .map((row) => ({
      id: row.id,
      dogId: row.dog.id,
      registrationNo: row.dog.registrations[0]?.registrationNo ?? "-",
      name: row.dog.name,
      sex: toSexCode(row.dog.sex),
      ...projectCanonicalShowResult(event.eventType, row.resultItems),
      critiqueText: row.critiqueText,
      heightCm: parseHeightCm(row.heightText),
      judge: row.judge,
    }))
    .sort(compareDetailRows);

  return {
    eventDate: event.eventDate,
    eventPlace: event.eventPlace,
    judge: collapseJudge(event.entries),
    dogCount: items.length,
    items,
  };
}
