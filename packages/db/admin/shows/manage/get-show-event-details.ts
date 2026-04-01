import type { Prisma } from "@prisma/client";
import {
  addBusinessIsoDateDays,
  getBusinessDateStartUtc,
  toBusinessDateOnly,
} from "@db/core/date-only";
import { prisma } from "@db/core/prisma";
import { collapseJudge } from "@db/shows/internal/show-judge";
import { parseHeightCm } from "@db/shows/internal/show-row-mappers";
import type {
  AdminShowDetailsEntryRowDb,
  AdminShowDetailsRequestDb,
  AdminShowDetailsResponseDb,
} from "@db/admin/shows/manage/types";

type AdminShowResultDefinition = {
  code: string;
  sortOrder: number;
  isVisibleByDefault: boolean;
  category: {
    code: string;
    sortOrder: number;
  };
};

type AdminShowResultItem = {
  valueCode: string | null;
  valueNumeric: number | { toNumber(): number } | null;
  isAwarded: boolean | null;
  definition: AdminShowResultDefinition;
};

const CATEGORY_CLASS = "KILPAILULUOKKA";
const CATEGORY_QUALITY = "LAATUARVOSTELU";
const LEGACY_QUALITY_CODE = "LEGACY-LAATUARVOSTELU";

function toNumericValue(
  value: AdminShowResultItem["valueNumeric"],
): number | null {
  if (value == null) {
    return null;
  }
  return typeof value === "number" ? value : value.toNumber();
}

function compareItems(
  left: AdminShowResultItem,
  right: AdminShowResultItem,
): number {
  if (
    left.definition.category.sortOrder !== right.definition.category.sortOrder
  ) {
    return (
      left.definition.category.sortOrder - right.definition.category.sortOrder
    );
  }
  if (left.definition.sortOrder !== right.definition.sortOrder) {
    return left.definition.sortOrder - right.definition.sortOrder;
  }
  const leftNumeric = toNumericValue(left.valueNumeric) ?? -1;
  const rightNumeric = toNumericValue(right.valueNumeric) ?? -1;
  if (leftNumeric !== rightNumeric) {
    return leftNumeric - rightNumeric;
  }
  return left.definition.code.localeCompare(right.definition.code, "fi", {
    sensitivity: "base",
  });
}

function parsePupnLabel(item: AdminShowResultItem): string | null {
  const code = item.valueCode?.trim() ?? "";
  const numeric = toNumericValue(item.valueNumeric);

  if (code && numeric !== null && /^(PU|PN)$/i.test(code)) {
    return `${code.toUpperCase()}${numeric}`;
  }
  if (/^(PU|PN)\d+$/i.test(code)) {
    return code.toUpperCase();
  }
  return code || null;
}

function pushUnique(target: string[], seen: Set<string>, value: string | null) {
  const normalized = value?.trim() ?? "";
  if (!normalized || seen.has(normalized)) {
    return;
  }
  seen.add(normalized);
  target.push(normalized);
}

function projectAdminShowResult(items: AdminShowResultItem[]) {
  const sortedItems = [...items].sort(compareItems);
  const classItem =
    sortedItems.find(
      (item) => item.definition.category.code === CATEGORY_CLASS,
    ) ?? null;
  const qualityItem =
    sortedItems.find(
      (item) =>
        item.definition.category.code === CATEGORY_QUALITY &&
        item.definition.isVisibleByDefault,
    ) ?? null;
  const legacyQualityItem =
    sortedItems.find((item) => item.definition.code === LEGACY_QUALITY_CODE) ??
    null;
  const placementItem =
    sortedItems.find((item) => item.definition.code === "SIJOITUS") ?? null;
  const pupnItem =
    sortedItems.find((item) => item.definition.code === "PUPN") ?? null;

  const classCode = classItem?.definition.code ?? null;
  const classPlacementValue = toNumericValue(
    placementItem?.valueNumeric ?? null,
  );
  const classPlacement =
    classPlacementValue != null && classPlacementValue > 0
      ? classPlacementValue
      : null;
  const legacyQualityNumeric = toNumericValue(
    legacyQualityItem?.valueNumeric ?? null,
  );
  const qualityGrade =
    qualityItem?.definition.code ??
    (legacyQualityNumeric !== null ? String(legacyQualityNumeric) : null);
  const awards: string[] = [];
  const seenAwards = new Set<string>();

  for (const item of sortedItems) {
    const code = item.definition.code;
    if (item.definition.category.code === CATEGORY_CLASS) {
      continue;
    }
    if (
      code === "SIJOITUS" ||
      code === "PUPN" ||
      item.definition.category.code === CATEGORY_QUALITY
    ) {
      continue;
    }
    if (item.isAwarded === false) {
      continue;
    }
    if (!item.definition.isVisibleByDefault) {
      continue;
    }
    pushUnique(awards, seenAwards, code);
  }

  return {
    classCode,
    qualityGrade,
    classPlacement,
    pupn: pupnItem ? parsePupnLabel(pupnItem) : null,
    awards,
  };
}

function compareRows(
  left: AdminShowDetailsEntryRowDb,
  right: AdminShowDetailsEntryRowDb,
): number {
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
      ...projectAdminShowResult(row.resultItems as AdminShowResultItem[]),
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
