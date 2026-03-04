import { beforeEach, describe, expect, it, vi } from "vitest";
import { setAdminUserStatusAction } from "../set-admin-user-status";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  setAdminUserStatusMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  setAdminUserStatusMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  setAdminUserStatus: setAdminUserStatusMock,
}));

describe("setAdminUserStatusAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    setAdminUserStatusMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({
      ok: false,
      status: 403,
    });

    await expect(
      setAdminUserStatusAction({ userId: "u_2", status: "suspended" }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
  });

  it("returns mapped service error", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: "2026-02-19T10:00:00.000Z",
    });
    setAdminUserStatusMock.mockResolvedValue({
      status: 409,
      body: {
        ok: false,
        error: "Cannot suspend the currently signed-in admin.",
        code: "CANNOT_SUSPEND_SELF",
      },
    });

    await expect(
      setAdminUserStatusAction({ userId: "u_1", status: "suspended" }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "CANNOT_SUSPEND_SELF",
      message: "Cannot suspend the currently signed-in admin.",
    });
  });

  it("returns data when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: "2026-02-19T10:00:00.000Z",
    });
    setAdminUserStatusMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          userId: "u_2",
          status: "suspended",
        },
      },
    });

    await expect(
      setAdminUserStatusAction({ userId: "u_2", status: "suspended" }),
    ).resolves.toEqual({
      data: {
        userId: "u_2",
        status: "suspended",
      },
      hasError: false,
    });
  });
});
