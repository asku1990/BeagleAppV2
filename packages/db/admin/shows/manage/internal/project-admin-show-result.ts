import type { AdminShowDetailsEntryRowDb } from "@db/admin/shows/manage/types";
import {
  CATEGORY_CLASS,
  CATEGORY_QUALITY,
  LEGACY_QUALITY_CODE,
  PLACEMENT_CODE,
  PUPN_CODE,
  type AdminShowResultItemDb,
} from "./result-types";

function toNumericValue(
  value: AdminShowResultItemDb["valueNumeric"],
): number | null {
  if (value == null) {
    return null;
  }
  return typeof value === "number" ? value : value.toNumber();
}

function compareItems(
  left: AdminShowResultItemDb,
  right: AdminShowResultItemDb,
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

function parsePupnLabel(item: AdminShowResultItemDb): string | null {
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

export function projectAdminShowResult(items: AdminShowResultItemDb[]) {
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
    sortedItems.find((item) => item.definition.code === PLACEMENT_CODE) ?? null;
  const pupnItem =
    sortedItems.find((item) => item.definition.code === PUPN_CODE) ?? null;

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
      code === PLACEMENT_CODE ||
      code === PUPN_CODE ||
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

export function compareAdminShowDetailRows(
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
    {
      sensitivity: "base",
    },
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
