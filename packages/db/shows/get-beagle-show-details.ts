import type { Prisma } from "@prisma/client";
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

  const eventWhere = input.eventKey
    ? {
        eventLookupKey: input.eventKey,
      }
    : {
        eventDate: {
          gte: rangeStart,
          lt: rangeEnd,
        },
        eventPlace: input.eventPlace,
      };
  const nonEmptyEventWhere = {
    ...eventWhere,
    entries: {
      some: {},
    },
  } satisfies Prisma.ShowEventWhereInput;
  const registrationOrderBy: Prisma.DogRegistrationOrderByWithRelationInput[] =
    [{ createdAt: "asc" }, { registrationNo: "asc" }];
  const eventSelect = {
    eventLookupKey: true,
    eventDate: true,
    eventPlace: true,
    eventType: true,
    entries: {
      select: {
        id: true,
        judge: true,
        critiqueText: true,
        heightText: true,
        registrationNoSnapshot: true,
        dogNameSnapshot: true,
        dog: {
          select: {
            id: true,
            name: true,
            sex: true,
            registrations: {
              select: {
                registrationNo: true,
              },
              orderBy: registrationOrderBy,
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
  } satisfies Prisma.ShowEventSelect;
  const eventQuery = {
    select: eventSelect,
  } as const;

  const event = input.eventKey
    ? await prisma.showEvent.findFirst({
        where: nonEmptyEventWhere,
        ...eventQuery,
      })
    : await prisma.showEvent
        .findMany({
          where: nonEmptyEventWhere,
          take: 2,
          ...eventQuery,
        })
        .then((rows) => (rows.length === 1 ? rows[0] : null));

  if (!event || event.entries.length === 0) {
    return null;
  }

  const items: BeagleShowDetailsRowDb[] = event.entries
    .map((row) => ({
      id: row.id,
      dogId: row.dog?.id ?? null,
      registrationNo:
        row.dog?.registrations[0]?.registrationNo ?? row.registrationNoSnapshot,
      name: row.dog?.name ?? row.dogNameSnapshot,
      sex: row.dog ? toSexCode(row.dog.sex) : "-",
      ...projectCanonicalShowResult(event.eventType, row.resultItems),
      critiqueText: row.critiqueText,
      heightCm: parseHeightCm(row.heightText),
      judge: row.judge,
    }))
    .sort(compareDetailRows);

  return {
    eventKey: event.eventLookupKey,
    eventDate: event.eventDate,
    eventPlace: event.eventPlace,
    judge: collapseJudge(event.entries),
    dogCount: items.length,
    items,
  };
}
