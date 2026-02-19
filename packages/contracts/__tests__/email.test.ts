import { describe, expect, it } from "vitest";
import {
  isValidEmailAddress,
  normalizeAndValidateEmailAddress,
  normalizeEmailAddress,
} from "../validation/email";

describe("email validation", () => {
  it("normalizes email to lowercase and trims whitespace", () => {
    expect(normalizeEmailAddress(" User@Example.com ")).toBe(
      "user@example.com",
    );
  });

  it("accepts a valid email", () => {
    expect(isValidEmailAddress("user@example.com")).toBe(true);
    expect(normalizeAndValidateEmailAddress(" User@Example.com ")).toBe(
      "user@example.com",
    );
  });

  it("rejects invalid emails", () => {
    expect(normalizeAndValidateEmailAddress("amin@rr")).toBeNull();
    expect(normalizeAndValidateEmailAddress("testi@t.t")).toBeNull();
    expect(normalizeAndValidateEmailAddress("not-an-email")).toBeNull();
  });
});
