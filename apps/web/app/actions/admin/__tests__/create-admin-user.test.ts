import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminUserAction } from "../create-admin-user";

const { requireAdminLayoutAccessMock, createAdminUserMock } = vi.hoisted(
  () => ({
    requireAdminLayoutAccessMock: vi.fn(),
    createAdminUserMock: vi.fn(),
  }),
);

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@beagle/server", () => ({
  createAdminUser: createAdminUserMock,
}));

describe("createAdminUserAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    createAdminUserMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({
      ok: false,
      status: 403,
    });

    await expect(
      createAdminUserAction({
        email: "user@example.com",
        role: "ADMIN",
        password: "password123456",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
  });

  it("returns mapped service error", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    createAdminUserMock.mockResolvedValue({
      status: 409,
      body: {
        ok: false,
        error: "User with this email already exists.",
        code: "EMAIL_EXISTS",
      },
    });

    await expect(
      createAdminUserAction({
        email: "user@example.com",
        role: "ADMIN",
        password: "password123456",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "EMAIL_EXISTS",
      message: "User with this email already exists.",
    });
  });

  it("returns data when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    createAdminUserMock.mockResolvedValue({
      status: 201,
      body: {
        ok: true,
        data: {
          id: "u_1",
          email: "user@example.com",
          name: "User",
          role: "USER",
          status: "active",
          createdAt: "2026-02-19T10:00:00.000Z",
        },
      },
    });

    await expect(
      createAdminUserAction({
        email: "user@example.com",
        role: "ADMIN",
        password: "password123456",
      }),
    ).resolves.toEqual({
      data: {
        id: "u_1",
        email: "user@example.com",
        name: "User",
        role: "USER",
        status: "active",
        createdAt: "2026-02-19T10:00:00.000Z",
      },
      hasError: false,
    });
  });
});
