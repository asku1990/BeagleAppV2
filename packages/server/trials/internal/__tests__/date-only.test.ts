import { describe, expect, it } from "vitest";
import {
  getTrialDateOnlyStartUtc,
  getTrialDateOnlyUtcRange,
  getTrialDateOnlyYearUtcRange,
  toTrialDateOnlyYear,
} from "@server/trials/core/date-only";

describe("trial date-only helpers", () => {
  it("builds a date-only UTC carrier from an ISO date", () => {
    expect(getTrialDateOnlyStartUtc("2025-06-01")?.toISOString()).toBe(
      "2025-06-01T00:00:00.000Z",
    );
  });

  it("returns null for invalid ISO dates", () => {
    expect(getTrialDateOnlyStartUtc("2025-13-01")).toBeNull();
  });

  it("builds an inclusive day range with an exclusive next-day boundary", () => {
    const range = getTrialDateOnlyUtcRange(
      new Date("2025-06-01T00:00:00.000Z"),
    );

    expect(range.start.toISOString()).toBe("2025-06-01T00:00:00.000Z");
    expect(range.endExclusive.toISOString()).toBe("2025-06-02T00:00:00.000Z");
  });

  it("builds a date-only year range and reads its UTC carrier year", () => {
    const range = getTrialDateOnlyYearUtcRange(2025);

    expect(range?.start.toISOString()).toBe("2025-01-01T00:00:00.000Z");
    expect(range?.endExclusive.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(toTrialDateOnlyYear(new Date("2025-06-01T00:00:00.000Z"))).toBe(
      2025,
    );
  });
});
