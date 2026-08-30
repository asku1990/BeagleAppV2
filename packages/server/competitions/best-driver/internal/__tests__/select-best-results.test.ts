import { describe, expect, it } from "vitest";
import type { BestDriverCandidateDb } from "@beagle/db";
import {
  getBestDriverTotalPoints,
  selectBestDriverResults,
} from "../select-best-results";

function candidate(
  id: string,
  points: number,
  overrides: Partial<BestDriverCandidateDb> = {},
): BestDriverCandidateDb {
  return {
    trialEntryId: id,
    trialEventId: `event-${id}`,
    dogId: "dog-1",
    dogName: "Aatu",
    dogSex: "MALE",
    registrationNo: "FI-1/20",
    eventDate: new Date("2025-08-02T00:00:00.000Z"),
    eventPlace: "Helsinki",
    kennelDistrict: "Etelä",
    kennelDistrictNo: "01",
    weather: "L",
    trialType: "NORMAL",
    placement: "1",
    points,
    ...overrides,
  };
}

describe("selectBestDriverResults", () => {
  it("selects the highest-scoring valid triple", () => {
    const results = selectBestDriverResults([
      candidate("a", 90, { weather: "P", kennelDistrictNo: "01" }),
      candidate("b", 89, { kennelDistrictNo: "02" }),
      candidate("c", 80, { kennelDistrictNo: "01" }),
      candidate("d", 88, { kennelDistrictNo: "03" }),
    ]);

    expect(results?.map((result) => result.trialEntryId)).toEqual([
      "a",
      "b",
      "d",
    ]);
    expect(getBestDriverTotalPoints(results ?? [])).toBe(267);
  });

  it.each([
    [
      "without bare-ground result",
      [
        { weather: "L", kennelDistrictNo: "01" },
        { kennelDistrictNo: "02" },
        { kennelDistrictNo: "01" },
      ],
    ],
    [
      "from one district",
      [
        { weather: "P", kennelDistrictNo: "01" },
        { kennelDistrictNo: "01" },
        { kennelDistrictNo: "01" },
      ],
    ],
    [
      "with two whole-season trials",
      [
        { weather: "P", kennelDistrictNo: "01", trialType: "KOKOKAUDENKOE" },
        { kennelDistrictNo: "02", trialType: "KOKOKAUDENKOE" },
        { kennelDistrictNo: "01" },
      ],
    ],
  ] as const)("rejects a triple %s", (_label, overrides) => {
    const results = selectBestDriverResults(
      overrides.map((override, index) =>
        candidate(String.fromCharCode(97 + index), 90 - index, override),
      ),
    );

    expect(results).toBeNull();
  });
});
