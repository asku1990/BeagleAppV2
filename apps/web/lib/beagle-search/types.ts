import type {
  BeagleSearchMode,
  BeagleSearchResponse,
  BeagleSearchRow,
  BeagleSearchSort,
} from "@beagle/contracts";

export type { BeagleSearchMode, BeagleSearchSort };
export type BeagleSearchResultRow = BeagleSearchRow;

export type BeagleSearchQueryState = {
  ek: string;
  reg: string;
  name: string;
  page: number;
  sort: BeagleSearchSort;
  adv: boolean;
};

export type BeagleSearchComputation = BeagleSearchResponse;

export const BEAGLE_PAGE_SIZE = 10;

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
