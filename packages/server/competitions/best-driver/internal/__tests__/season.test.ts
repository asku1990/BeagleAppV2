import { describe, expect, it } from "vitest";
import {
  collectBestDriverSeasons,
  getBestDriverSeasonRange,
  getCurrentBestDriverSeason,
  parseBestDriverSeason,
} from "../season";

describe("best driver season helpers", () => {
  it("accepts only four-digit seasons in the supported range", () => {
    expect(parseBestDriverSeason(undefined)).toBeNull();
    expect(parseBestDriverSeason(2025.9)).toBe(2025);
    expect(parseBestDriverSeason(2016)).toBe(2016);
    expect(parseBestDriverSeason(2015)).toBeNaN();
    expect(parseBestDriverSeason(2101)).toBeNaN();
  });

  it("uses August as the season boundary in Helsinki time", () => {
    expect(
      getCurrentBestDriverSeason(new Date("2025-07-31T20:00:00.000Z")),
    ).toBe(2024);
    expect(
      getCurrentBestDriverSeason(new Date("2025-07-31T22:00:00.000Z")),
    ).toBe(2025);
  });

  it("builds the exclusive competition date range", () => {
    expect(getBestDriverSeasonRange(2025)).toEqual({
      startExclusive: new Date("2025-08-01T00:00:00.000Z"),
      endExclusive: new Date("2026-03-01T00:00:00.000Z"),
    });
  });

  it("collects seasons from August through February event dates", () => {
    expect(
      collectBestDriverSeasons(
        [
          new Date("2026-02-28T00:00:00.000Z"),
          new Date("2025-08-02T00:00:00.000Z"),
          new Date("2016-02-28T00:00:00.000Z"),
          new Date("2015-08-02T00:00:00.000Z"),
          new Date("2025-05-01T00:00:00.000Z"),
        ],
        2026,
      ),
    ).toEqual([2026, 2025]);
  });
});
