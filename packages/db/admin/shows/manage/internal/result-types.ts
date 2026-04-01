export const CATEGORY_CLASS = "KILPAILULUOKKA";
export const CATEGORY_QUALITY = "LAATUARVOSTELU";
export const CATEGORY_PLACEMENT = "SIJOITUS";
export const CATEGORY_PUPN = "PUPN";

export const LEGACY_QUALITY_CODE = "LEGACY-LAATUARVOSTELU";
export const PLACEMENT_CODE = "SIJOITUS";
export const PUPN_CODE = "PUPN";

type AdminShowResultCategoryMeta = {
  code: string;
  sortOrder: number;
};

export type AdminShowResultDefinitionProjection = {
  code: string;
  sortOrder: number;
  isVisibleByDefault: boolean;
  category: AdminShowResultCategoryMeta;
};

export type AdminShowResultDefinitionOptionRow = {
  code: string;
  labelFi: string;
  sortOrder: number;
  isVisibleByDefault: boolean;
  category: AdminShowResultCategoryMeta;
};

export type AdminShowResultItemDb = {
  valueCode: string | null;
  valueNumeric: number | { toNumber(): number } | null;
  isAwarded: boolean | null;
  definition: AdminShowResultDefinitionProjection;
};
