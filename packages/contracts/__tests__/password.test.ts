import { describe, expect, it } from "vitest";
import {
  isValidPasswordLength,
  normalizeAndValidatePassword,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "../validation/password";

describe("password validation", () => {
  it("exposes min/max password constants", () => {
    expect(PASSWORD_MIN_LENGTH).toBe(12);
    expect(PASSWORD_MAX_LENGTH).toBe(128);
  });

  it("accepts password lengths within bounds", () => {
    expect(isValidPasswordLength("a".repeat(PASSWORD_MIN_LENGTH))).toBe(true);
    expect(isValidPasswordLength("a".repeat(PASSWORD_MAX_LENGTH))).toBe(true);
  });

  it("rejects password lengths outside bounds", () => {
    expect(isValidPasswordLength("a".repeat(PASSWORD_MIN_LENGTH - 1))).toBe(
      false,
    );
    expect(isValidPasswordLength("a".repeat(PASSWORD_MAX_LENGTH + 1))).toBe(
      false,
    );
  });

  it("trims before validation", () => {
    expect(normalizeAndValidatePassword("  validpassword12  ")).toBe(
      "validpassword12",
    );
    expect(normalizeAndValidatePassword("  short  ")).toBeNull();
  });
});
