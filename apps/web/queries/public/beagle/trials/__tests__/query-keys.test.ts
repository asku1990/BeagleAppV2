import { describe, expect, it } from "vitest";
import {
  beagleTrialDetailsQueryKey,
  beagleTrialDetailsQueryKeyRoot,
  beagleTrialSearchQueryKey,
  beagleTrialSearchQueryKeyRoot,
} from "../query-keys";

describe("beagle trial query keys", () => {
  it("builds search key with normalized values", () => {
    expect(
      beagleTrialSearchQueryKey({
        year: 2025.9,
        dateFrom: " 2025-01-01 ",
        dateTo: "2025-12-31",
        page: 2.4,
        pageSize: 25.9,
        sort: "date-asc",
      }),
    ).toEqual([
      ...beagleTrialSearchQueryKeyRoot,
      2025,
      "2025-01-01",
      "2025-12-31",
      2,
      25,
      "date-asc",
    ]);
  });

  it("builds search key defaults for empty input", () => {
    expect(beagleTrialSearchQueryKey()).toEqual([
      ...beagleTrialSearchQueryKeyRoot,
      null,
      null,
      null,
      1,
      10,
      "date-desc",
    ]);
  });

  it("builds details key with trimmed trial id", () => {
    expect(beagleTrialDetailsQueryKey(" s_1 ")).toEqual([
      ...beagleTrialDetailsQueryKeyRoot,
      "s_1",
    ]);
  });
});
