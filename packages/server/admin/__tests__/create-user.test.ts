import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminUser } from "../create-user";

const { createAdminUserDbMock, hashPasswordMock } = vi.hoisted(() => ({
  createAdminUserDbMock: vi.fn(),
  hashPasswordMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  createAdminUserDb: createAdminUserDbMock,
}));

vi.mock("better-auth/crypto", () => ({
  hashPassword: hashPasswordMock,
}));

describe("createAdminUser", () => {
  beforeEach(() => {
    createAdminUserDbMock.mockReset();
    hashPasswordMock.mockReset();
  });

  it("returns 400 for invalid email", async () => {
    await expect(
      createAdminUser({
        email: "invalid",
        role: "ADMIN",
        password: "password123456",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Email must be a valid email address.",
        code: "INVALID_EMAIL",
      },
    });
  });

  it("returns 400 for email without domain dot", async () => {
    await expect(
      createAdminUser({
        email: "testi@t.t",
        role: "ADMIN",
        password: "password123456",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Email must be a valid email address.",
        code: "INVALID_EMAIL",
      },
    });
  });

  it("returns 400 for too short password", async () => {
    await expect(
      createAdminUser({
        email: "user@example.com",
        role: "ADMIN",
        password: "short",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Password must be 12-128 characters.",
        code: "INVALID_PASSWORD",
      },
    });
  });

  it("returns 400 for invalid role", async () => {
    await expect(
      createAdminUser({
        email: "user@example.com",
        role: "SUPERADMIN" as "ADMIN",
        password: "password123456",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Role must be either USER or ADMIN.",
        code: "INVALID_ROLE",
      },
    });
    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(createAdminUserDbMock).not.toHaveBeenCalled();
  });

  it("creates user and returns 201", async () => {
    hashPasswordMock.mockResolvedValue("hashed");
    createAdminUserDbMock.mockResolvedValue({
      id: "u_1",
      email: "user@example.com",
      name: "Tester",
      role: "USER",
      banned: false,
      createdAt: new Date("2026-02-19T10:00:00.000Z"),
    });

    await expect(
      createAdminUser({
        email: "User@Example.com",
        name: " Tester ",
        role: "USER",
        password: "password123456",
      }),
    ).resolves.toEqual({
      status: 201,
      body: {
        ok: true,
        data: {
          id: "u_1",
          email: "user@example.com",
          name: "Tester",
          role: "USER",
          status: "active",
          createdAt: "2026-02-19T10:00:00.000Z",
        },
      },
    });

    expect(createAdminUserDbMock).toHaveBeenCalledWith(
      {
        email: "user@example.com",
        name: "Tester",
        role: "USER",
        passwordHash: "hashed",
      },
      undefined,
    );
  });

  it("returns 409 when email exists", async () => {
    hashPasswordMock.mockResolvedValue("hashed");
    createAdminUserDbMock.mockRejectedValue({ code: "P2002" });

    await expect(
      createAdminUser({
        email: "user@example.com",
        role: "ADMIN",
        password: "password123456",
      }),
    ).resolves.toEqual({
      status: 409,
      body: {
        ok: false,
        error: "User with this email already exists.",
        code: "EMAIL_EXISTS",
      },
    });
  });
});
