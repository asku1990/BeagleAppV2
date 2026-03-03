import { describe, expect, it } from "vitest";
import { requireAdmin } from "../service";

describe("requireAdmin", () => {
  it("returns 401 when user is missing", () => {
    expect(requireAdmin(null)).toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });
  });

  it("returns 403 when user is not admin", () => {
    expect(
      requireAdmin({
        id: "u1",
        email: "u@example.com",
        username: null,
        role: "USER",
      }),
    ).toEqual({
      status: 403,
      body: {
        ok: false,
        error: "Admin role required.",
        code: "FORBIDDEN",
      },
    });
  });

  it("returns success when user is admin", () => {
    expect(
      requireAdmin({
        id: "a1",
        email: "a@example.com",
        username: "admin",
        role: "ADMIN",
      }),
    ).toEqual({
      status: 200,
      body: {
        ok: true,
        data: { authorized: true },
      },
    });
  });
});
