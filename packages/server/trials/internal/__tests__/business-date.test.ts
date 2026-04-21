import { describe, expect, it } from "vitest";
import {
  getTrialBusinessDateStartUtc,
  getTrialBusinessDateUtcRange,
  getTrialBusinessYearUtcRange,
  toTrialBusinessYear,
} from "../business-date";

describe("business-date helpers", () => {
  it("builds a business date start from an iso date", () => {
    expect(getTrialBusinessDateStartUtc("2025-06-01")?.toISOString()).toBe(
      "2025-05-31T21:00:00.000Z",
    );
  });

  it("returns null for invalid iso dates", () => {
    expect(getTrialBusinessDateStartUtc("2025-13-01")).toBeNull();
  });

  it("builds a business date utc range", () => {
    const range = getTrialBusinessDateUtcRange(
      new Date("2025-06-01T00:00:00.000Z"),
    );

    expect(range.start.toISOString()).toBe("2025-05-31T21:00:00.000Z");
    expect(range.endExclusive.toISOString()).toBe("2025-06-01T21:00:00.000Z");
  });

  it("builds a business year utc range and year", () => {
    const range = getTrialBusinessYearUtcRange(2025);

    expect(range?.start.toISOString()).toBe("2024-12-31T22:00:00.000Z");
    expect(range?.endExclusive.toISOString()).toBe("2025-12-31T22:00:00.000Z");
    expect(toTrialBusinessYear(new Date("2025-06-01T00:00:00.000Z"))).toBe(
      2025,
    );
  });
});
