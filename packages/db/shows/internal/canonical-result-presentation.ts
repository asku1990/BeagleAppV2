// Projects canonical show result items into the structured public read model
// used by show detail and dog-profile show views.
import type { BeagleShowStructuredResultDb } from "../types";

type CanonicalResultDefinition = {
  code: string;
  sortOrder: number;
  isVisibleByDefault: boolean;
  category: {
    code: string;
    sortOrder: number;
  };
};

type CanonicalResultItem = {
  valueCode: string | null;
  valueNumeric: number | { toNumber(): number } | null;
  isAwarded: boolean | null;
  definition: CanonicalResultDefinition;
};

const CATEGORY_CLASS = "KILPAILULUOKKA";
const CATEGORY_QUALITY = "LAATUARVOSTELU";
const LEGACY_QUALITY_CODE = "LEGACY-LAATUARVOSTELU";

function toNumericValue(
  value: CanonicalResultItem["valueNumeric"],
): number | null {
  if (value == null) {
    return null;
  }
  return typeof value === "number" ? value : value.toNumber();
}

function compareItems(
  left: CanonicalResultItem,
  right: CanonicalResultItem,
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

function parsePupnLabel(item: CanonicalResultItem): string | null {
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

export function projectCanonicalShowResult(
  showType: string | null,
  items: CanonicalResultItem[],
): BeagleShowStructuredResultDb {
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
    showType: showType?.trim() || null,
    classCode,
    qualityGrade,
    classPlacement,
    pupn: pupnItem ? parsePupnLabel(pupnItem) : null,
    awards,
  };
}
