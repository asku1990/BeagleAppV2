import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminUserAction } from "../delete-admin-user";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  deleteAdminUserMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  deleteAdminUserMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  deleteAdminUser: deleteAdminUserMock,
}));

describe("deleteAdminUserAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    deleteAdminUserMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({
      ok: false,
      status: 403,
    });

    await expect(deleteAdminUserAction({ userId: "u_2" })).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
    expect(deleteAdminUserMock).not.toHaveBeenCalled();
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
    deleteAdminUserMock.mockResolvedValue({
      status: 409,
      body: {
        ok: false,
        error: "Cannot delete the currently signed-in admin.",
        code: "CANNOT_DELETE_SELF",
      },
    });

    await expect(deleteAdminUserAction({ userId: "u_1" })).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "CANNOT_DELETE_SELF",
      message: "Cannot delete the currently signed-in admin.",
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
    deleteAdminUserMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          deletedUserId: "u_2",
        },
      },
    });

    await expect(deleteAdminUserAction({ userId: "u_2" })).resolves.toEqual({
      data: {
        deletedUserId: "u_2",
      },
      hasError: false,
    });
  });
});
