import { describe, expect, it } from "vitest";
import {
  isValidRegistrationNo,
  normalizeRegistrationNo,
} from "@server/dogs/core/registration";

describe("registration-number helpers", () => {
  it.each([
    "FI12345/21",
    "FI12345A/21",
    "EST.REG-12345",
    "ABC/DEF/1234/20",
    "ÅÄÖ123/24",
    "FI١٢٣/٢٤",
  ])("accepts supported international registration format %s", (value) => {
    expect(isValidRegistrationNo(value)).toBe(true);
  });

  it.each(["", "BAD VALUE", "FI_123/24", "FI:123/24", "FI@123/24"])(
    "rejects unsupported registration format %s",
    (value) => {
      expect(isValidRegistrationNo(value)).toBe(false);
    },
  );

  it("trims and uppercases registration numbers", () => {
    expect(normalizeRegistrationNo("  fi.ab-123/24  ")).toBe("FI.AB-123/24");
  });

  it.each([null, undefined, 123, "", "   "])(
    "normalizes invalid or empty value %s to null",
    (value) => {
      expect(normalizeRegistrationNo(value)).toBeNull();
    },
  );
});
