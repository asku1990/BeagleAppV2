import { describe, expect, it } from "vitest";
import { BUSINESS_TIME_ZONE, toBusinessDateInputValue } from "../date";

describe("toBusinessDateInputValue", () => {
  it("uses the configured Helsinki business timezone", () => {
    expect(BUSINESS_TIME_ZONE).toBe("Europe/Helsinki");
  });

  it("uses the next Helsinki date shortly after winter midnight", () => {
    expect(toBusinessDateInputValue(new Date("2026-01-01T22:30:00.000Z"))).toBe(
      "2026-01-02",
    );
  });

  it("uses the next Helsinki date shortly after summer midnight", () => {
    expect(toBusinessDateInputValue(new Date("2026-07-19T21:30:00.000Z"))).toBe(
      "2026-07-20",
    );
  });
});
