type CanonicalResultDefinition = {
  code: string;
  sortOrder: number;
  category: {
    code: string;
    sortOrder: number;
  };
};

type CanonicalResultItem = {
  valueCode: string | null;
  valueNumeric: number | null;
  isAwarded: boolean | null;
  definition: CanonicalResultDefinition;
};

const LEGACY_QUALITY_DEFINITION_CODE = "LEGACY-LAATUARVOSTELU";
const QUALITY_CODES = new Set(["ERI", "EH", "H", "T", "EVA", "HYL"]);

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
  if ((left.valueNumeric ?? -1) !== (right.valueNumeric ?? -1)) {
    return (left.valueNumeric ?? -1) - (right.valueNumeric ?? -1);
  }
  return left.definition.code.localeCompare(right.definition.code, "fi", {
    sensitivity: "base",
  });
}

function pushUnique(target: string[], seen: Set<string>, value: string | null) {
  const normalized = value?.trim() ?? "";
  if (!normalized || seen.has(normalized)) {
    return;
  }
  seen.add(normalized);
  target.push(normalized);
}

export function formatCanonicalShowResultText(
  eventDate: Date,
  items: CanonicalResultItem[],
): string | null {
  const sortedItems = [...items].sort(compareItems);
  const classItem =
    sortedItems.find(
      (item) => item.definition.category.code === "KILPAILULUOKKA",
    ) ?? null;
  const qualityItem =
    sortedItems.find((item) => QUALITY_CODES.has(item.definition.code)) ?? null;
  const legacyQualityItem =
    sortedItems.find(
      (item) => item.definition.code === LEGACY_QUALITY_DEFINITION_CODE,
    ) ?? null;
  const placementItem =
    sortedItems.find((item) => item.definition.code === "SIJOITUS") ?? null;
  const awardItems = sortedItems.filter((item) => {
    const code = item.definition.code;
    return (
      item.definition.category.code !== "KILPAILULUOKKA" &&
      code !== "SIJOITUS" &&
      code !== LEGACY_QUALITY_DEFINITION_CODE &&
      !QUALITY_CODES.has(code)
    );
  });

  const eventDateIso = eventDate.toISOString().slice(0, 10);
  const classCode = classItem?.definition.code ?? null;
  const qualityCode = qualityItem?.definition.code ?? null;
  const placement = placementItem?.valueNumeric ?? null;
  const legacyQualityDigit = legacyQualityItem?.valueNumeric ?? null;
  const tokens: string[] = [];
  const seen = new Set<string>();

  if (classCode && legacyQualityDigit !== null && eventDateIso < "2003-01-01") {
    pushUnique(tokens, seen, `${classCode}${legacyQualityDigit}`);
  } else if (classCode && qualityCode) {
    pushUnique(tokens, seen, `${classCode}-${qualityCode}`);
  } else if (classCode && placement === null) {
    pushUnique(tokens, seen, classCode);
  } else if (qualityCode) {
    pushUnique(tokens, seen, qualityCode);
  }

  if (classCode && placement !== null) {
    if (placement === 0) {
      pushUnique(tokens, seen, `${classCode}0`);
    } else {
      pushUnique(tokens, seen, `${classCode}K${placement}`);
    }
  }

  for (const item of awardItems) {
    if (item.definition.code === "PUPN") {
      pushUnique(tokens, seen, item.valueCode);
      continue;
    }
    if (item.isAwarded === false) {
      continue;
    }
    pushUnique(tokens, seen, item.definition.code);
  }

  return tokens.length > 0 ? tokens.join(", ") : null;
}
