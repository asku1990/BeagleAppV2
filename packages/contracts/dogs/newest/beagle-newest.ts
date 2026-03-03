import type { BeagleSearchRow } from "../search/beagle-search";

export type BeagleNewestRequest = {
  limit?: number;
};

export type BeagleNewestResponse = {
  items: BeagleSearchRow[];
};
