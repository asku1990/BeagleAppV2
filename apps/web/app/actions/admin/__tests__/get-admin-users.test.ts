import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminUsersAction } from "../get-admin-users";

const { requireAdminLayoutAccessMock, listAdminUsersMock } = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  listAdminUsersMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@beagle/server", () => ({
  listAdminUsers: listAdminUsersMock,
}));

describe("getAdminUsersAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    listAdminUsersMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({
      ok: false,
      status: 403,
    });

    await expect(getAdminUsersAction()).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
    });
    expect(listAdminUsersMock).not.toHaveBeenCalled();
  });

  it("returns unauthenticated when no session exists", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(getAdminUsersAction()).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
    });
    expect(listAdminUsersMock).not.toHaveBeenCalled();
  });

  it("returns service error code when listing fails", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    listAdminUsersMock.mockResolvedValue({
      status: 500,
      body: {
        ok: false,
        error: "Failed to list users.",
        code: "INTERNAL_ERROR",
      },
    });

    await expect(getAdminUsersAction()).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INTERNAL_ERROR",
    });
  });

  it("returns users when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    listAdminUsersMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [
            {
              id: "u_1",
              email: "admin@example.com",
              name: "Admin",
              role: "ADMIN",
              status: "active",
              createdAt: "2026-02-19T10:00:00.000Z",
              lastSignInAt: "2026-02-19T11:00:00.000Z",
            },
          ],
        },
      },
    });

    await expect(getAdminUsersAction()).resolves.toEqual({
      data: {
        items: [
          {
            id: "u_1",
            email: "admin@example.com",
            name: "Admin",
            role: "ADMIN",
            status: "active",
            createdAt: "2026-02-19T10:00:00.000Z",
            lastSignInAt: "2026-02-19T11:00:00.000Z",
          },
        ],
      },
      hasError: false,
    });
  });
});
