import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminDogAction } from "../create-admin-dog";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  createAdminDogMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  createAdminDogMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  createAdminDog: createAdminDogMock,
}));

describe("createAdminDogAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    createAdminDogMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(
      createAdminDogAction({ name: "Metsapolun Kide", sex: "FEMALE" }),
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
    createAdminDogMock.mockResolvedValue({
      status: 409,
      body: {
        ok: false,
        error: "Dog with same EK number or registration number already exists.",
        code: "DUPLICATE_DOG",
      },
    });

    await expect(
      createAdminDogAction({ name: "Metsapolun Kide", sex: "FEMALE" }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "DUPLICATE_DOG",
      message: "Dog with same EK number or registration number already exists.",
    });
  });

  it("returns created dog data when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: "2026-02-19T10:00:00.000Z",
      sessionId: "s_1",
    });
    createAdminDogMock.mockResolvedValue({
      status: 201,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Metsapolun Kide",
          sex: "FEMALE",
          registrationNo: "FI12345/21",
        },
      },
    });

    await expect(
      createAdminDogAction({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).resolves.toEqual({
      data: {
        id: "dog_1",
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      },
      hasError: false,
    });

    expect(createAdminDogMock).toHaveBeenCalledWith(
      {
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      },
      {
        actorUserId: "u_1",
        actorSessionId: "s_1",
        source: "WEB",
      },
    );
  });
});
