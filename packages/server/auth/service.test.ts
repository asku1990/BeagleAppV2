import { describe, expect, it, vi } from "vitest";
import { createAuthService } from "./service";

describe("auth service", () => {
  it("returns 400 for missing login fields", async () => {
    const service = createAuthService({
      createSession: vi.fn(),
      createUser: vi.fn(),
      deleteSession: vi.fn(),
      findUserByEmail: vi.fn(),
      findUserBySessionToken: vi.fn(),
      hashPassword: vi.fn(),
      verifyPassword: vi.fn(),
    } as never);

    const result = await service.login({ email: "" });
    expect(result.status).toBe(400);
    expect(result.body.ok).toBe(false);
  });

  it("returns 401 for unknown session token", async () => {
    const service = createAuthService({
      createSession: vi.fn(),
      createUser: vi.fn(),
      deleteSession: vi.fn(),
      findUserByEmail: vi.fn(),
      findUserBySessionToken: vi.fn().mockResolvedValue(null),
      hashPassword: vi.fn(),
      verifyPassword: vi.fn(),
    } as never);

    const result = await service.me("bad-token");
    expect(result.status).toBe(401);
    expect(result.body.ok).toBe(false);
  });

  it("returns 409 when username already exists", async () => {
    const service = createAuthService({
      createSession: vi.fn(),
      createUser: vi.fn().mockRejectedValue({
        code: "P2002",
        meta: { target: ["User_username_key"] },
      }),
      deleteSession: vi.fn(),
      findUserByEmail: vi.fn().mockResolvedValue(null),
      findUserBySessionToken: vi.fn(),
      hashPassword: vi.fn().mockResolvedValue("hash"),
      verifyPassword: vi.fn(),
    } as never);

    const result = await service.register({
      email: "test@example.com",
      password: "password123",
      username: "taken-name",
    });

    expect(result.status).toBe(409);
    expect(result.body).toEqual({
      ok: false,
      error: "Username already exists.",
    });
  });

  it("returns 409 fallback when unique target is unknown", async () => {
    const service = createAuthService({
      createSession: vi.fn(),
      createUser: vi.fn().mockRejectedValue({
        code: "P2002",
        meta: {},
      }),
      deleteSession: vi.fn(),
      findUserByEmail: vi.fn().mockResolvedValue(null),
      findUserBySessionToken: vi.fn(),
      hashPassword: vi.fn().mockResolvedValue("hash"),
      verifyPassword: vi.fn(),
    } as never);

    const result = await service.register({
      email: "test@example.com",
      password: "password123",
      username: "taken-name",
    });

    expect(result.status).toBe(409);
    expect(result.body).toEqual({
      ok: false,
      error: "Account already exists.",
    });
  });
});
