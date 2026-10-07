import { describe, expect, it } from "vitest";
import {
  formatTrialSeason,
  getTrialSeasonUtcRange,
  parseTrialSeason,
  toTrialSeason,
} from "../trial-season";

describe("trial seasons", () => {
  it("maps August 1 to the new season and July 31 to the previous season", () => {
    expect(
      formatTrialSeason(toTrialSeason(new Date("2025-08-01T00:00:00Z"))),
    ).toBe("2025-2026");
    expect(
      formatTrialSeason(toTrialSeason(new Date("2026-07-31T00:00:00Z"))),
    ).toBe("2025-2026");
    expect(
      formatTrialSeason(toTrialSeason(new Date("2025-01-15T00:00:00Z"))),
    ).toBe("2024-2025");
  });

  it("rejects invalid and nonconsecutive season strings", () => {
    expect(parseTrialSeason("2025")).toBeNull();
    expect(parseTrialSeason("2025-2027")).toBeNull();
    expect(parseTrialSeason("2025-2026x")).toBeNull();
    expect(parseTrialSeason(2025 as unknown as string)).toBeNull();
  });

  it("builds an August-to-August half-open range", () => {
    const season = parseTrialSeason("2025-2026");
    expect(season).not.toBeNull();
    expect(getTrialSeasonUtcRange(season!)).toEqual({
      start: new Date("2025-08-01T00:00:00.000Z"),
      endExclusive: new Date("2026-08-01T00:00:00.000Z"),
    });
  });
});
