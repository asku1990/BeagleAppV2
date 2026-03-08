import { describe, expect, it } from "vitest";
import { BUSINESS_TIME_ZONE, toBusinessDateOnly } from "../date-only";

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
});
