import { describe, expect, it } from "vitest";
import { normalizeDogName } from "@beagle/domain";

describe("domain", () => {
  it("normalizes dog names", () => {
    expect(normalizeDogName("  Milo  ")).toBe("Milo");
  });
});
