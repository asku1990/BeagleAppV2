import { describe, expect, it } from "vitest";
import {
  BUSINESS_TIME_ZONE,
  getBusinessDateUtcRange,
  toBusinessDateOnly,
} from "../date-only";

describe("toBusinessDateOnly", () => {
  it("uses the Helsinki business timezone", () => {
    expect(BUSINESS_TIME_ZONE).toBe("Europe/Helsinki");
  });

  it("serializes a UTC date to a date-only string", () => {
    expect(toBusinessDateOnly(new Date("2024-01-01T00:00:00.000Z"))).toBe(
      "2024-01-01",
    );
  });

  it("keeps a Helsinki local midnight on the same calendar date", () => {
    expect(toBusinessDateOnly(new Date("2020-01-01T00:00:00+02:00"))).toBe(
      "2020-01-01",
    );
  });

  it("handles daylight saving transitions in Helsinki", () => {
    expect(toBusinessDateOnly(new Date("2022-03-26T22:30:00.000Z"))).toBe(
      "2022-03-27",
    );
    expect(toBusinessDateOnly(new Date("2022-10-29T22:30:00.000Z"))).toBe(
      "2022-10-30",
    );
  });

  it("builds UTC range boundaries for a Helsinki business date", () => {
    const range = getBusinessDateUtcRange(
      new Date("2020-04-01T12:00:00+03:00"),
    );
    expect(range.start.toISOString()).toBe("2020-03-31T21:00:00.000Z");
    expect(range.endExclusive.toISOString()).toBe("2020-04-01T21:00:00.000Z");
  });

  it("builds correct UTC boundaries across DST switch days", () => {
    const springForward = getBusinessDateUtcRange(
      new Date("2022-03-27T12:00:00+03:00"),
    );
    expect(springForward.start.toISOString()).toBe("2022-03-26T22:00:00.000Z");
    expect(springForward.endExclusive.toISOString()).toBe(
      "2022-03-27T21:00:00.000Z",
    );

    const fallBack = getBusinessDateUtcRange(
      new Date("2022-10-30T12:00:00+02:00"),
    );
    expect(fallBack.start.toISOString()).toBe("2022-10-29T21:00:00.000Z");
    expect(fallBack.endExclusive.toISOString()).toBe(
      "2022-10-30T22:00:00.000Z",
    );
  });
});
