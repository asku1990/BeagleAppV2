import type { Prisma } from "@prisma/client";
import {
  addBusinessIsoDateDays,
  getBusinessDateStartUtc,
  toBusinessDateOnly,
} from "../../../core/date-only";
import { prisma } from "../../../core/prisma";
import { projectCanonicalShowResult } from "../../../shows/internal/canonical-result-presentation";
import { collapseJudge } from "../../../shows/internal/show-judge";
import { parseHeightCm } from "../../../shows/internal/show-row-mappers";
import type {
  AdminShowDetailsEntryRowDb,
  AdminShowDetailsRequestDb,
  AdminShowDetailsResponseDb,
} from "./types";

function compareRows(
  left: AdminShowDetailsEntryRowDb,
  right: AdminShowDetailsEntryRowDb,
): number {
  const showTypeComparison = (left.showType ?? "").localeCompare(
    right.showType ?? "",
    "fi",
    { sensitivity: "base" },
  );
  if (showTypeComparison !== 0) return showTypeComparison;

  const qualityComparison = (left.qualityGrade ?? "").localeCompare(
    right.qualityGrade ?? "",
    "fi",
    { sensitivity: "base" },
  );
  if (qualityComparison !== 0) return qualityComparison;

  const placementComparison =
    (left.classPlacement ?? Number.POSITIVE_INFINITY) -
    (right.classPlacement ?? Number.POSITIVE_INFINITY);
  if (placementComparison !== 0) return placementComparison;

  const pupnComparison = (left.pupn ?? "").localeCompare(
    right.pupn ?? "",
    "fi",
    { sensitivity: "base" },
  );
  if (pupnComparison !== 0) return pupnComparison;

  const awardsComparison = left.awards
    .join(", ")
    .localeCompare(right.awards.join(", "), "fi", { sensitivity: "base" });
  if (awardsComparison !== 0) return awardsComparison;

  const nameComparison = left.dogName.localeCompare(right.dogName, "fi", {
    sensitivity: "base",
  });
  if (nameComparison !== 0) return nameComparison;

  return left.registrationNo.localeCompare(right.registrationNo, "fi", {
    sensitivity: "base",
  });
}

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
      ...projectCanonicalShowResult(event.eventType, row.resultItems),
    }))
    .sort(compareRows);

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
  };
}
