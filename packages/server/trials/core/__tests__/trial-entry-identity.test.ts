import { describe, expect, it } from "vitest";
import {
  isValidTrialRegistrationNo,
  normalizeTrialRegistrationNo,
} from "@server/trials/core/trial-entry-identity";

describe("trial entry registration-number helpers", () => {
  it.each([
    "FI12345/21",
    "FI12345A/21",
    "EST.REG-12345",
    "ABC/DEF/1234/20",
    "ÅÄÖ123/24",
    "FI١٢٣/٢٤",
  ])("accepts supported international registration format %s", (value) => {
    expect(isValidTrialRegistrationNo(value)).toBe(true);
  });

  it.each(["", "BAD VALUE", "FI_123/24", "FI:123/24", "FI@123/24"])(
    "rejects unsupported registration format %s",
    (value) => {
      expect(isValidTrialRegistrationNo(value)).toBe(false);
    },
  );

  it("trims and uppercases registration numbers", () => {
    expect(normalizeTrialRegistrationNo("  fi.ab-123/24  ")).toBe(
      "FI.AB-123/24",
    );
  });

  it.each([null, "", "   "])("normalizes empty value %s to null", (value) => {
    expect(normalizeTrialRegistrationNo(value)).toBeNull();
  });
});
