import { describe, expect, it } from "vitest";
import { BUSINESS_TIME_ZONE, toBusinessDateOnly } from "../date-only";

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
