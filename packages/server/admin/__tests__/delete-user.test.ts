import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminUser } from "../delete-user";

const {
  getAdminUserByIdDbMock,
  countAdminUsersDbMock,
  deleteAdminUserDbMock,
  lockAdminUsersForUpdateDbMock,
  runAdminUserWriteTransactionDbMock,
} = vi.hoisted(() => ({
  getAdminUserByIdDbMock: vi.fn(),
  countAdminUsersDbMock: vi.fn(),
  deleteAdminUserDbMock: vi.fn(),
  lockAdminUsersForUpdateDbMock: vi.fn(),
  runAdminUserWriteTransactionDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getAdminUserByIdDb: getAdminUserByIdDbMock,
  countAdminUsersDb: countAdminUsersDbMock,
  deleteAdminUserDb: deleteAdminUserDbMock,
  lockAdminUsersForUpdateDb: lockAdminUsersForUpdateDbMock,
  runAdminUserWriteTransactionDb: runAdminUserWriteTransactionDbMock,
}));

describe("deleteAdminUser", () => {
  beforeEach(() => {
    getAdminUserByIdDbMock.mockReset();
    countAdminUsersDbMock.mockReset();
    deleteAdminUserDbMock.mockReset();
    lockAdminUsersForUpdateDbMock.mockReset();
    runAdminUserWriteTransactionDbMock.mockImplementation(async (callback) =>
      callback({} as never),
    );
  });

  it("blocks deleting current signed-in admin", async () => {
    await expect(
      deleteAdminUser({ userId: "u1", currentUserId: "u1" }),
    ).resolves.toEqual({
      status: 409,
      body: {
        ok: false,
        error: "Cannot delete the currently signed-in admin.",
        code: "CANNOT_DELETE_SELF",
      },
    });
  });

  it("returns not found when target user is missing", async () => {
    getAdminUserByIdDbMock.mockResolvedValue(null);

    await expect(
      deleteAdminUser({ userId: "u2", currentUserId: "u1" }),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "User not found.",
        code: "NOT_FOUND",
      },
    });
  });

  it("blocks deleting last admin", async () => {
    getAdminUserByIdDbMock.mockResolvedValue({ id: "u2", role: "ADMIN" });
    countAdminUsersDbMock.mockResolvedValue(1);

    await expect(
      deleteAdminUser({ userId: "u2", currentUserId: "u1" }),
    ).resolves.toEqual({
      status: 409,
      body: {
        ok: false,
        error: "Cannot delete the last admin user.",
        code: "LAST_ADMIN",
      },
    });
    expect(lockAdminUsersForUpdateDbMock).toHaveBeenCalledTimes(1);
  });

  it("deletes target user", async () => {
    getAdminUserByIdDbMock.mockResolvedValue({ id: "u2", role: "USER" });
    deleteAdminUserDbMock.mockResolvedValue(true);

    await expect(
      deleteAdminUser({ userId: "u2", currentUserId: "u1" }),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          deletedUserId: "u2",
        },
      },
    });
    expect(deleteAdminUserDbMock).toHaveBeenCalledWith("u2", expect.anything());
  });

  it("returns not found when user is deleted concurrently", async () => {
    getAdminUserByIdDbMock.mockResolvedValue({ id: "u2", role: "USER" });
    deleteAdminUserDbMock.mockResolvedValue(false);

    await expect(
      deleteAdminUser({ userId: "u2", currentUserId: "u1" }),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "User not found.",
        code: "NOT_FOUND",
      },
    });
  });
});
