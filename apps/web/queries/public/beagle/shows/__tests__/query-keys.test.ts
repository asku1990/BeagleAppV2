import { describe, expect, it } from "vitest";
import {
  beagleShowDetailsQueryKey,
  beagleShowDetailsQueryKeyRoot,
  beagleShowSearchQueryKey,
  beagleShowSearchQueryKeyRoot,
} from "../query-keys";

describe("beagle show query keys", () => {
  it("builds search key with normalized values", () => {
    expect(
      beagleShowSearchQueryKey({
        year: 2025.9,
        dateFrom: " 2025-01-01 ",
        dateTo: "2025-12-31",
        page: 2.4,
        pageSize: 25.9,
        sort: "date-asc",
      }),
    ).toEqual([
      ...beagleShowSearchQueryKeyRoot,
      2025,
      "2025-01-01",
      "2025-12-31",
      2,
      25,
      "date-asc",
    ]);
  });

  it("builds search key defaults for empty input", () => {
    expect(beagleShowSearchQueryKey()).toEqual([
      ...beagleShowSearchQueryKeyRoot,
      null,
      null,
      null,
      1,
      10,
      "date-desc",
    ]);
  });

  it("builds details key with trimmed show id", () => {
    expect(beagleShowDetailsQueryKey(" s_1 ")).toEqual([
      ...beagleShowDetailsQueryKeyRoot,
      "s_1",
    ]);
  });
});
