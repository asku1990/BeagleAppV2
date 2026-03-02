import { describe, expect, it } from "vitest";
import type { BeagleSearchQueryState } from "@/lib/public/beagle/search";
import {
  beagleNewestQueryKey,
  beagleNewestQueryKeyRoot,
  beagleSearchQueryKey,
  beagleSearchQueryKeyRoot,
} from "../query-keys";

describe("beagle search query keys", () => {
  it("builds beagle search key", () => {
    const state: BeagleSearchQueryState = {
      ek: "100",
      reg: "FI-123",
      name: "Kide",
      sex: "female",
      birthYearFrom: "2019",
      birthYearTo: "2022",
      ekOnly: false,
      multipleRegsOnly: true,
      page: 2,
      pageSize: 25,
      sort: "created-desc",
      adv: true,
    };

    expect(beagleSearchQueryKey(state)).toEqual([
      ...beagleSearchQueryKeyRoot,
      "100",
      "FI-123",
      "Kide",
      "female",
      "2019",
      "2022",
      false,
      true,
      2,
      25,
      "created-desc",
    ]);
  });

  it("builds newest key", () => {
    expect(beagleNewestQueryKey(10)).toEqual([...beagleNewestQueryKeyRoot, 10]);
  });
});
