import type {
  AdminShowResultOptionDb,
  AdminShowResultOptionsDb,
} from "@db/admin/shows/manage/types";
import { LEGACY_QUALITY_MAX, LEGACY_QUALITY_MIN } from "./legacy-quality";
import {
  CATEGORY_CLASS,
  CATEGORY_PLACEMENT,
  CATEGORY_PUPN,
  CATEGORY_QUALITY,
  LEGACY_QUALITY_CODE,
  PLACEMENT_CODE,
  PUPN_CODE,
  type AdminShowResultDefinitionOptionRow,
} from "./result-types";

const PUPN_MAX_RANK = 4;

function buildDefinitionOptionLabel(
  definition: AdminShowResultDefinitionOptionRow,
): string {
  return definition.code;
}

function toDefinitionOption(
  definition: AdminShowResultDefinitionOptionRow,
): AdminShowResultOptionDb {
  return {
    value: definition.code,
    label: buildDefinitionOptionLabel(definition),
  };
}

function buildPupnValueOptions(): AdminShowResultOptionDb[] {
  const options: AdminShowResultOptionDb[] = [];
  for (let rank = 1; rank <= PUPN_MAX_RANK; rank += 1) {
    options.push({ value: `PU${rank}`, label: `PU${rank}` });
  }
  for (let rank = 1; rank <= PUPN_MAX_RANK; rank += 1) {
    options.push({ value: `PN${rank}`, label: `PN${rank}` });
  }
  return options;
}

function buildLegacyQualityValueOptions(): AdminShowResultOptionDb[] {
  const options: AdminShowResultOptionDb[] = [];
  for (
    let value = LEGACY_QUALITY_MIN;
    value <= LEGACY_QUALITY_MAX;
    value += 1
  ) {
    const text = String(value);
    options.push({ value: text, label: text });
  }
  return options;
}

export function buildAdminShowOptions(
  definitions: AdminShowResultDefinitionOptionRow[],
): AdminShowResultOptionsDb {
  const classOptions = definitions
    .filter(
      (definition) =>
        definition.category.code === CATEGORY_CLASS &&
        definition.code !== PUPN_CODE &&
        definition.isVisibleByDefault,
    )
    .map(toDefinitionOption);

  const showLegacyQualityValues = definitions.some(
    (definition) =>
      definition.code === LEGACY_QUALITY_CODE && definition.isVisibleByDefault,
  );
  const qualityOptions = [
    ...definitions
      .filter(
        (definition) =>
          definition.category.code === CATEGORY_QUALITY &&
          definition.isVisibleByDefault &&
          definition.code !== LEGACY_QUALITY_CODE,
      )
      .map(toDefinitionOption),
    ...(showLegacyQualityValues ? buildLegacyQualityValueOptions() : []),
  ];

  const awardOptions = definitions
    .filter((definition) => {
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
    })
    .map(toDefinitionOption);

  const hasPupnDefinition = definitions.some(
    (definition) =>
      (definition.code === PUPN_CODE ||
        definition.category.code === CATEGORY_PUPN) &&
      definition.isVisibleByDefault,
  );
  const pupnOptions = hasPupnDefinition ? buildPupnValueOptions() : [];

  return {
    classOptions,
    qualityOptions,
    awardOptions,
    pupnOptions,
  };
}
