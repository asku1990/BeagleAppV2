import type { BeagleTrialSearchSort } from "@beagle/contracts";

export type { BeagleTrialSearchSort };

export type BeagleTrialsFilterMode = "year" | "range";

export type BeagleTrialsQueryState = {
  mode: BeagleTrialsFilterMode;
  year: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
  sort: BeagleTrialSearchSort;
};

export const BEAGLE_TRIALS_DEFAULT_PAGE_SIZE = 10;
export const BEAGLE_TRIALS_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const BEAGLE_TRIALS_DEFAULT_SORT: BeagleTrialSearchSort = "date-desc";
