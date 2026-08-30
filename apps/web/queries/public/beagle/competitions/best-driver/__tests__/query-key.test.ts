import { describe, expect, it } from "vitest";
import { bestDriverRankingQueryKey } from "../query-key";

describe("bestDriverRankingQueryKey", () => {
  it("uses null for the default season", () => {
    expect(bestDriverRankingQueryKey()).toEqual([
      "beagle",
      "competitions",
      "best-driver",
      null,
    ]);
  });

  it("includes the requested season", () => {
    expect(bestDriverRankingQueryKey({ season: 2025 })).toEqual([
      "beagle",
      "competitions",
      "best-driver",
      2025,
    ]);
  });
});
