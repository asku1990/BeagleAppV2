import { describe, expect, it } from "vitest";
import { toEventSourceDatePart, toOwnershipDateKey } from "../date-key";

describe("imports date keys", () => {
  it("returns __NULL__ for missing ownership date", () => {
    expect(toOwnershipDateKey(null)).toBe("__NULL__");
  });

  it("serializes ownership date keys in business timezone", () => {
    expect(toOwnershipDateKey(new Date("2020-01-01T00:00:00+02:00"))).toBe(
      "2020-01-01",
    );
  });

  it("serializes source key date part in business timezone", () => {
    expect(toEventSourceDatePart(new Date("2022-03-15T00:00:00+02:00"))).toBe(
      "2022-03-15",
    );
  });
});
