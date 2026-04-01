import type { Prisma } from "@prisma/client";
import {
  addBusinessIsoDateDays,
  getBusinessDateStartUtc,
  toBusinessDateOnly,
} from "@db/core/date-only";
import { prisma } from "@db/core/prisma";
import type {
  AdminShowDetailsEntryRowDb,
  AdminShowDetailsRequestDb,
  AdminShowDetailsResponseDb,
} from "@db/admin/shows/manage/types";
import { collapseJudge } from "@db/shows/internal/show-judge";
import { parseHeightCm } from "@db/shows/internal/show-row-mappers";
import { buildAdminShowOptions } from "./internal/build-admin-show-options";
import {
  compareAdminShowDetailRows,
  projectAdminShowResult,
} from "./internal/project-admin-show-result";
import type {
  AdminShowResultDefinitionOptionRow,
  AdminShowResultItemDb,
} from "./internal/result-types";

// Reads one admin show event and projects canonical entry fields plus editor
// option lists from result definitions, while preserving legacy-compatible values.
export async function getAdminShowEventDetailsDb(
  input: AdminShowDetailsRequestDb,
): Promise<AdminShowDetailsResponseDb | null> {
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
  const resolvedEventWhere = {
    ...eventWhere,
  } satisfies Prisma.ShowEventWhereInput;

  const eventSelect = {
    eventLookupKey: true,
    eventDate: true,
    eventPlace: true,
    eventCity: true,
    eventName: true,
    eventType: true,
    organizer: true,
    entries: {
      select: {
        id: true,
        judge: true,
        critiqueText: true,
        heightText: true,
        registrationNoSnapshot: true,
        dogNameSnapshot: true,
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
        where: resolvedEventWhere,
        ...eventQuery,
      })
    : await prisma.showEvent
        .findMany({
          where: resolvedEventWhere,
          take: 2,
          ...eventQuery,
        })
        .then((rows) => (rows.length === 1 ? rows[0] : null));

  if (!event) {
    return null;
  }

  const items: AdminShowDetailsEntryRowDb[] = event.entries
    .map((row) => ({
      id: row.id,
      registrationNo: row.registrationNoSnapshot,
      dogName: row.dogNameSnapshot,
      judge: row.judge,
      critiqueText: row.critiqueText,
      heightCm: parseHeightCm(row.heightText),
      ...projectAdminShowResult(row.resultItems as AdminShowResultItemDb[]),
    }))
    .sort(compareAdminShowDetailRows);

  const definitionRows = await prisma.showResultDefinition.findMany({
    where: {
      isEnabled: true,
      category: {
        isEnabled: true,
      },
    },
    select: {
      code: true,
      labelFi: true,
      sortOrder: true,
      isVisibleByDefault: true,
      category: {
        select: {
          code: true,
          sortOrder: true,
        },
      },
    },
    orderBy: [
      {
        category: {
          sortOrder: "asc",
        },
      },
      {
        sortOrder: "asc",
      },
      {
        code: "asc",
      },
    ],
  });

  const options = buildAdminShowOptions(
    definitionRows as AdminShowResultDefinitionOptionRow[],
  );

  return {
    eventKey: event.eventLookupKey,
    eventDate: event.eventDate,
    eventPlace: event.eventPlace,
    eventCity: event.eventCity,
    eventName: event.eventName,
    eventType: event.eventType,
    organizer: event.organizer,
    judge: collapseJudge(event.entries),
    dogCount: items.length,
    items,
    options,
  };
}
