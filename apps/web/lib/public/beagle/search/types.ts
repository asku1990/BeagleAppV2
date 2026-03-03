import type {
  BeagleSearchMode,
  BeagleSearchResponse,
  BeagleSearchRow,
  BeagleSearchSex,
  BeagleSearchSort,
} from "@beagle/contracts";

export type { BeagleSearchMode, BeagleSearchSort };
export type BeagleSearchAdvancedSex = "any" | BeagleSearchSex;
export type BeagleSearchResultRow = BeagleSearchRow;

export type BeagleSearchQueryState = {
  ek: string;
  reg: string;
  name: string;
  sex: BeagleSearchAdvancedSex;
  birthYearFrom: string;
  birthYearTo: string;
  ekOnly: boolean;
  multipleRegsOnly: boolean;
  page: number;
  pageSize: number;
  sort: BeagleSearchSort;
  adv: boolean;
};

export type BeagleSearchComputation = BeagleSearchResponse;

export const BEAGLE_DEFAULT_PAGE_SIZE = 10;
export const BEAGLE_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type BeagleSearchQuickAction =
  | "pedigree"
  | "trials"
  | "siblings"
  | "offspring";

export const BEAGLE_ROW_ACTIONS: BeagleSearchQuickAction[] = [
  "pedigree",
  "trials",
  "siblings",
  "offspring",
];
