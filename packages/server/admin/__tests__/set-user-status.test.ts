import { beforeEach, describe, expect, it, vi } from "vitest";
import { setAdminUserStatus } from "../set-user-status";

const { getAdminUserByIdDbMock, setAdminUserStatusDbMock } = vi.hoisted(() => ({
  getAdminUserByIdDbMock: vi.fn(),
  setAdminUserStatusDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getAdminUserByIdDb: getAdminUserByIdDbMock,
  setAdminUserStatusDb: setAdminUserStatusDbMock,
}));

describe("setAdminUserStatus", () => {
  beforeEach(() => {
    getAdminUserByIdDbMock.mockReset();
    setAdminUserStatusDbMock.mockReset();
  });

  it("blocks suspending current signed-in admin", async () => {
    await expect(
      setAdminUserStatus({
        userId: "u1",
        status: "suspended",
        currentUserId: "u1",
      }),
    ).resolves.toEqual({
      status: 409,
      body: {
        ok: false,
        error: "Cannot suspend the currently signed-in admin.",
        code: "CANNOT_SUSPEND_SELF",
      },
    });
  });

  it("returns not found when target user is missing", async () => {
    getAdminUserByIdDbMock.mockResolvedValue(null);

    await expect(
      setAdminUserStatus({
        userId: "u2",
        status: "suspended",
        currentUserId: "u1",
      }),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "User not found.",
        code: "NOT_FOUND",
      },
    });
  });

  it("returns 400 for invalid status value", async () => {
    await expect(
      setAdminUserStatus({
        userId: "u2",
        status: "paused" as "active",
        currentUserId: "u1",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Status must be either active or suspended.",
        code: "INVALID_STATUS",
      },
    });
    expect(getAdminUserByIdDbMock).not.toHaveBeenCalled();
    expect(setAdminUserStatusDbMock).not.toHaveBeenCalled();
  });

  it("returns 500 when user lookup fails", async () => {
    getAdminUserByIdDbMock.mockRejectedValue(new Error("db fail"));

    await expect(
      setAdminUserStatus({
        userId: "u2",
        status: "suspended",
        currentUserId: "u1",
      }),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to update user status.",
        code: "INTERNAL_ERROR",
      },
    });
    expect(setAdminUserStatusDbMock).not.toHaveBeenCalled();
  });

  it("updates user status when target exists", async () => {
    getAdminUserByIdDbMock.mockResolvedValue({ id: "u2", role: "USER" });
    setAdminUserStatusDbMock.mockResolvedValue(undefined);

    await expect(
      setAdminUserStatus({
        userId: "u2",
        status: "suspended",
        currentUserId: "u1",
      }),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          userId: "u2",
          status: "suspended",
        },
      },
    });
    expect(setAdminUserStatusDbMock).toHaveBeenCalledWith({
      userId: "u2",
      status: "suspended",
    });
  });
});
