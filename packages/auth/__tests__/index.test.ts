import { describe, expect, it } from "vitest";
import { authorizeRole, hashPassword, verifyPassword } from "../index";

describe("password hashing", () => {
  it("verifies a correct password", async () => {
    const hash = await hashPassword("p@ssword123");
    await expect(verifyPassword(hash, "p@ssword123")).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("p@ssword123");
    await expect(verifyPassword(hash, "wrong-password")).resolves.toBe(false);
  });

  it("rejects malformed hex hash payloads", async () => {
    await expect(
      verifyPassword("scrypt$salt$zz", "any-password"),
    ).resolves.toBe(false);
  });

  it("rejects malformed hash scheme payloads", async () => {
    await expect(
      verifyPassword("argon2$salt$deadbeef", "any-password"),
    ).resolves.toBe(false);
  });
});

describe("authorizeRole", () => {
  it("returns unauthenticated when user is missing", () => {
    expect(authorizeRole(null, "ADMIN")).toEqual({
      ok: false,
      reason: "UNAUTHENTICATED",
    });
  });

  it("returns forbidden when role does not match", () => {
    expect(authorizeRole({ id: "u_1", role: "USER" }, "ADMIN")).toEqual({
      ok: false,
      reason: "FORBIDDEN",
    });
  });

  it("returns ok when role matches", () => {
    expect(authorizeRole({ id: "u_1", role: "ADMIN" }, "ADMIN")).toEqual({
      ok: true,
      userId: "u_1",
      role: "ADMIN",
    });
  });
});
