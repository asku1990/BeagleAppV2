import { describe, expect, it } from "vitest";
import {
  BUSINESS_TIME_ZONE,
  isFutureBusinessDate,
  toBusinessDateOnly,
  toDateOnly,
} from "../date-only";

describe("toBusinessDateOnly", () => {
  it("uses configured business timezone", () => {
    expect(BUSINESS_TIME_ZONE).toBe("Europe/Helsinki");
  });

  it("serializes UTC midnight date values", () => {
    expect(toBusinessDateOnly(new Date("2024-01-01T00:00:00.000Z"))).toBe(
      "2024-01-01",
    );
  });

  it("keeps local calendar date for positive offsets", () => {
    expect(toBusinessDateOnly(new Date("2020-01-01T00:00:00+02:00"))).toBe(
      "2020-01-01",
    );
  });

  it("handles DST-season values", () => {
    expect(toBusinessDateOnly(new Date("2022-03-26T22:30:00.000Z"))).toBe(
      "2022-03-27",
    );
    expect(toBusinessDateOnly(new Date("2022-10-29T22:30:00.000Z"))).toBe(
      "2022-10-30",
    );
  });
});

describe("toDateOnly", () => {
  it("preserves the stored UTC calendar date without Helsinki conversion", () => {
    const value = new Date("2024-01-14T22:00:00.000Z");

    expect(toDateOnly(value)).toBe("2024-01-14");
    expect(toBusinessDateOnly(value)).toBe("2024-01-15");
  });

  it("serializes Prisma DATE values as YYYY-MM-DD", () => {
    expect(toDateOnly(new Date("2024-01-15T00:00:00.000Z"))).toBe("2024-01-15");
  });
});

describe("isFutureBusinessDate", () => {
  const helsinkiBeforeMidnight = new Date("2026-07-19T20:59:59.999Z");
  const helsinkiAfterMidnight = new Date("2026-07-19T21:30:00.000Z");

  it("changes business today at Helsinki midnight", () => {
    const july20 = new Date("2026-07-20T00:00:00.000Z");

    expect(isFutureBusinessDate(july20, helsinkiBeforeMidnight)).toBe(true);
    expect(isFutureBusinessDate(july20, helsinkiAfterMidnight)).toBe(false);
  });

  it("accepts past and current Helsinki business dates", () => {
    expect(
      isFutureBusinessDate(
        new Date("2026-07-19T00:00:00.000Z"),
        helsinkiAfterMidnight,
      ),
    ).toBe(false);
    expect(
      isFutureBusinessDate(
        new Date("2026-07-20T00:00:00.000Z"),
        helsinkiAfterMidnight,
      ),
    ).toBe(false);
  });

  it("rejects a date after the current Helsinki business date", () => {
    expect(
      isFutureBusinessDate(
        new Date("2026-07-21T00:00:00.000Z"),
        helsinkiAfterMidnight,
      ),
    ).toBe(true);
  });
});
