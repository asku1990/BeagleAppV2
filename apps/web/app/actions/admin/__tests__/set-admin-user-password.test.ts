import { beforeEach, describe, expect, it, vi } from "vitest";
import { setAdminUserPasswordAction } from "../set-admin-user-password";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  setAdminUserPasswordMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  setAdminUserPasswordMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  setAdminUserPassword: setAdminUserPasswordMock,
}));

describe("setAdminUserPasswordAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    setAdminUserPasswordMock.mockReset();
  });

  it("returns forbidden when caller is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(
      setAdminUserPasswordAction({
        userId: "u_2",
        newPassword: "validpassword123",
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
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: "2026-02-19T10:00:00.000Z",
      sessionId: "s_1",
    });
    setAdminUserPasswordMock.mockResolvedValue({
      status: 400,
      body: {
        ok: false,
        error: "Password does not meet length requirements.",
        code: "INVALID_PASSWORD",
      },
    });

    await expect(
      setAdminUserPasswordAction({ userId: "u_2", newPassword: "short" }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INVALID_PASSWORD",
      message: "Password does not meet length requirements.",
    });
    expect(setAdminUserPasswordMock).toHaveBeenCalledWith(
      { userId: "u_2", newPassword: "short" },
      {
        actorUserId: "u_1",
        actorSessionId: "s_1",
        source: "WEB",
      },
    );
  });

  it("returns data when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: "2026-02-19T10:00:00.000Z",
      sessionId: "s_1",
    });
    setAdminUserPasswordMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          userId: "u_2",
        },
      },
    });

    await expect(
      setAdminUserPasswordAction({
        userId: "u_2",
        newPassword: "validpassword123",
      }),
    ).resolves.toEqual({
      data: {
        userId: "u_2",
      },
      hasError: false,
    });
  });
});
