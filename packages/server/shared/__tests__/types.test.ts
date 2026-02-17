import { describe, expect, it } from "vitest";
import { hasAdminRole, normalizeRole } from "../types";

describe("shared types helpers", () => {
  it("detects admin role correctly", () => {
    expect(hasAdminRole(null)).toBe(false);
    expect(
      hasAdminRole({
        id: "u1",
        email: "u@example.com",
        username: null,
        role: "USER",
      }),
    ).toBe(false);
    expect(
      hasAdminRole({
        id: "a1",
        email: "a@example.com",
        username: "admin",
        role: "ADMIN",
      }),
    ).toBe(true);
  });

  it("normalizes unknown role values to USER", () => {
    expect(normalizeRole("ADMIN")).toBe("ADMIN");
    expect(normalizeRole("USER")).toBe("USER");
    expect(normalizeRole("guest")).toBe("USER");
  });
});
