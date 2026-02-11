import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../index";

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
});
