import { beforeEach, describe, expect, it, vi } from "vitest";
import { setAdminUserPassword } from "../set-user-password";

const { getAdminUserByIdDbMock, setAdminUserPasswordDbMock, hashPasswordMock } =
  vi.hoisted(() => ({
    getAdminUserByIdDbMock: vi.fn(),
    setAdminUserPasswordDbMock: vi.fn(),
    hashPasswordMock: vi.fn(),
  }));

vi.mock("@beagle/db", () => ({
  getAdminUserByIdDb: getAdminUserByIdDbMock,
  setAdminUserPasswordDb: setAdminUserPasswordDbMock,
}));

vi.mock("better-auth/crypto", () => ({
  hashPassword: hashPasswordMock,
}));

describe("setAdminUserPassword", () => {
  beforeEach(() => {
    getAdminUserByIdDbMock.mockReset();
    setAdminUserPasswordDbMock.mockReset();
    hashPasswordMock.mockReset();
  });

  it("returns 400 for invalid password", async () => {
    await expect(
      setAdminUserPassword({ userId: "u_1", newPassword: "short" }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Password does not meet length requirements.",
        code: "INVALID_PASSWORD",
      },
    });
  });

  it("returns 404 when user does not exist", async () => {
    getAdminUserByIdDbMock.mockResolvedValue(null);

    await expect(
      setAdminUserPassword({
        userId: "u_missing",
        newPassword: "validpassword123",
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

  it("updates password and returns 200", async () => {
    getAdminUserByIdDbMock.mockResolvedValue({
      id: "u_1",
      email: "user@example.com",
      role: "ADMIN",
      banned: false,
    });
    hashPasswordMock.mockResolvedValue("hashed-password");

    await expect(
      setAdminUserPassword({
        userId: "u_1",
        newPassword: "validpassword123",
      }),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          userId: "u_1",
        },
      },
    });

    expect(setAdminUserPasswordDbMock).toHaveBeenCalledWith({
      userId: "u_1",
      passwordHash: "hashed-password",
    });
  });
});
