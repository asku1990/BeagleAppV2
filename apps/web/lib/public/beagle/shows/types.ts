import type { BeagleShowSearchSort } from "@beagle/contracts";

export type { BeagleShowSearchSort };

export type BeagleShowsFilterMode = "year" | "range";

export type BeagleShowsQueryState = {
  mode: BeagleShowsFilterMode;
  year: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
  sort: BeagleShowSearchSort;
};

export const BEAGLE_SHOWS_DEFAULT_PAGE_SIZE = 10;
export const BEAGLE_SHOWS_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const BEAGLE_SHOWS_DEFAULT_SORT: BeagleShowSearchSort = "date-desc";
