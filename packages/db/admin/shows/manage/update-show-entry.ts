import { prisma } from "@db/core/prisma";
import { resolveAdminShowEventTargetDb } from "./internal/event-target";
import { isLegacyQualityValue } from "./internal/legacy-quality";
import {
  CATEGORY_CLASS,
  CATEGORY_PLACEMENT,
  CATEGORY_PUPN,
  CATEGORY_QUALITY,
  LEGACY_QUALITY_CODE,
  PLACEMENT_CODE,
  PUPN_CODE,
} from "./internal/result-types";
import type {
  UpdateAdminShowEntryWriteRequestDb,
  UpdateAdminShowEntryWriteResultDb,
} from "./types";

type EditableDefinition = {
  id: string;
  code: string;
  isVisibleByDefault: boolean;
  category: {
    code: string;
  };
};

type NextResultItemWrite = {
  definitionId: string;
  definitionCode: string;
  valueCode: string | null;
  valueNumeric: number | null;
  isAwarded: boolean | null;
};

async function resolveEventId(
  tx: Parameters<typeof resolveAdminShowEventTargetDb>[0],
  input: Pick<
    UpdateAdminShowEntryWriteRequestDb,
    "eventKey" | "eventDate" | "eventPlace"
  >,
): Promise<string | null> {
  const event = await resolveAdminShowEventTargetDb<{ id: string }>(tx, input, {
    id: true,
  });
  return event?.id ?? null;
}

function isLegacyQualityNumeric(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null;
  }
  const numeric = Number.parseInt(value, 10);
  if (!Number.isFinite(numeric)) {
    return null;
  }
  if (!isLegacyQualityValue(numeric)) {
    return null;
  }
  return numeric;
}

function toItemValueDiscriminator(item: NextResultItemWrite): string {
  if (item.valueCode) {
    return item.valueCode;
  }
  if (item.valueNumeric !== null) {
    return String(item.valueNumeric);
  }
  if (item.isAwarded === true) {
    return "FLAG";
  }
  return "VALUE";
}

// Persists one admin entry update and synchronizes the editable definition-backed
// result items in one transaction without touching non-editable legacy items.
export async function updateAdminShowEntryWriteDb(
  input: UpdateAdminShowEntryWriteRequestDb,
): Promise<UpdateAdminShowEntryWriteResultDb> {
  return prisma.$transaction(async (tx) => {
    const eventId = await resolveEventId(tx, {
      eventKey: input.eventKey,
      eventDate: input.eventDate,
      eventPlace: input.eventPlace,
    });
    if (!eventId) {
      return { status: "not_found" };
    }

    const entry = await tx.showEntry.findFirst({
      where: {
        id: input.entryId,
        showEventId: eventId,
      },
      select: {
        id: true,
        entryLookupKey: true,
      },
    });
    if (!entry) {
      return { status: "not_found" };
    }

    await tx.showEntry.update({
      where: { id: entry.id },
      data: {
        judge: input.judge,
        critiqueText: input.critiqueText,
        heightText: input.heightText,
      },
    });

    const definitions = (await tx.showResultDefinition.findMany({
      where: {
        isEnabled: true,
      },
      select: {
        id: true,
        code: true,
        isVisibleByDefault: true,
        category: {
          select: {
            code: true,
          },
        },
      },
    })) as EditableDefinition[];

    const definitionsByCode = new Map(
      definitions.map((definition) => [definition.code, definition]),
    );
    const visibleClassDefinitions = definitions.filter(
      (definition) =>
        definition.isVisibleByDefault &&
        definition.category.code === CATEGORY_CLASS &&
        definition.code !== PUPN_CODE,
    );
    const visibleQualityDefinitions = definitions.filter(
      (definition) =>
        definition.isVisibleByDefault &&
        definition.category.code === CATEGORY_QUALITY &&
        definition.code !== LEGACY_QUALITY_CODE,
    );
    const legacyQualityDefinition = definitionsByCode.get(LEGACY_QUALITY_CODE);
    const placementDefinition = definitionsByCode.get(PLACEMENT_CODE);
    const pupnDefinition = definitionsByCode.get(PUPN_CODE);
    const visibleAwardDefinitions = definitions.filter((definition) => {
      if (!definition.isVisibleByDefault) {
        return false;
      }
      if (definition.category.code === CATEGORY_CLASS) {
        return false;
      }
      if (definition.category.code === CATEGORY_QUALITY) {
        return false;
      }
      if (definition.category.code === CATEGORY_PLACEMENT) {
        return false;
      }
      if (definition.category.code === CATEGORY_PUPN) {
        return false;
      }
      if (
        definition.code === PLACEMENT_CODE ||
        definition.code === PUPN_CODE ||
        definition.code === LEGACY_QUALITY_CODE
      ) {
        return false;
      }
      return true;
    });

    const nextResultItems: NextResultItemWrite[] = [];

    if (input.classCode) {
      const classDefinition = visibleClassDefinitions.find(
        (definition) => definition.code === input.classCode,
      );
      if (!classDefinition) {
        return { status: "invalid_class_code" };
      }
      nextResultItems.push({
        definitionId: classDefinition.id,
        definitionCode: classDefinition.code,
        valueCode: null,
        valueNumeric: null,
        isAwarded: null,
      });
    }

    if (input.qualityGrade) {
      const qualityDefinition = visibleQualityDefinitions.find(
        (definition) => definition.code === input.qualityGrade,
      );
      if (qualityDefinition) {
        nextResultItems.push({
          definitionId: qualityDefinition.id,
          definitionCode: qualityDefinition.code,
          valueCode: null,
          valueNumeric: null,
          isAwarded: null,
        });
      } else {
        const legacyQualityNumeric = isLegacyQualityNumeric(input.qualityGrade);
        if (!legacyQualityDefinition || legacyQualityNumeric === null) {
          return { status: "invalid_quality_grade" };
        }
        nextResultItems.push({
          definitionId: legacyQualityDefinition.id,
          definitionCode: legacyQualityDefinition.code,
          valueCode: null,
          valueNumeric: legacyQualityNumeric,
          isAwarded: null,
        });
      }
    }

    if (input.classPlacement !== null) {
      if (!placementDefinition) {
        return { status: "missing_placement_definition" };
      }
      nextResultItems.push({
        definitionId: placementDefinition.id,
        definitionCode: placementDefinition.code,
        valueCode: null,
        valueNumeric: input.classPlacement,
        isAwarded: null,
      });
    }

    if (input.pupn) {
      if (!pupnDefinition) {
        return { status: "missing_pupn_definition" };
      }
      nextResultItems.push({
        definitionId: pupnDefinition.id,
        definitionCode: pupnDefinition.code,
        valueCode: input.pupn,
        valueNumeric: null,
        isAwarded: null,
      });
    }

    const seenAwardCodes = new Set<string>();
    for (const awardCode of input.awards) {
      if (seenAwardCodes.has(awardCode)) {
        continue;
      }
      seenAwardCodes.add(awardCode);

      const awardDefinition = visibleAwardDefinitions.find(
        (definition) => definition.code === awardCode,
      );
      if (!awardDefinition) {
        return {
          status: "invalid_award_code",
          awardCode,
        };
      }
      nextResultItems.push({
        definitionId: awardDefinition.id,
        definitionCode: awardDefinition.code,
        valueCode: null,
        valueNumeric: null,
        isAwarded: true,
      });
    }

    const managedDefinitionIds = new Set<string>([
      ...visibleClassDefinitions.map((definition) => definition.id),
      ...visibleQualityDefinitions.map((definition) => definition.id),
      ...visibleAwardDefinitions.map((definition) => definition.id),
      ...(legacyQualityDefinition ? [legacyQualityDefinition.id] : []),
      ...(placementDefinition ? [placementDefinition.id] : []),
      ...(pupnDefinition ? [pupnDefinition.id] : []),
    ]);

    if (managedDefinitionIds.size > 0) {
      await tx.showResultItem.deleteMany({
        where: {
          showEntryId: entry.id,
          definitionId: {
            in: [...managedDefinitionIds],
          },
        },
      });
    }

    if (nextResultItems.length > 0) {
      const countersByBaseLookup = new Map<string, number>();
      await tx.showResultItem.createMany({
        data: nextResultItems.map((item) => {
          const itemValueDiscriminator = toItemValueDiscriminator(item);
          const baseLookupKey = `${entry.entryLookupKey}|${item.definitionCode}|${itemValueDiscriminator}`;
          const nextCounter =
            (countersByBaseLookup.get(baseLookupKey) ?? 0) + 1;
          countersByBaseLookup.set(baseLookupKey, nextCounter);

          return {
            showEntryId: entry.id,
            definitionId: item.definitionId,
            sourceTag: "MANUAL_ADMIN",
            itemLookupKey: `${baseLookupKey}|${nextCounter}`,
            valueCode: item.valueCode,
            valueNumeric: item.valueNumeric,
            isAwarded: item.isAwarded,
          };
        }),
      });
    }

    return {
      status: "updated",
      entryId: entry.id,
    };
  });
}
