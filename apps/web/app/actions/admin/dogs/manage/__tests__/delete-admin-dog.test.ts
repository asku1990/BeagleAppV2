import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminDogAction } from "../delete-admin-dog";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  deleteAdminDogMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  deleteAdminDogMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  deleteAdminDog: deleteAdminDogMock,
}));

describe("deleteAdminDogAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    deleteAdminDogMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(deleteAdminDogAction({ id: "dog_1" })).resolves.toEqual({
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
      createdAt: null,
      sessionId: "s_1",
    });
    deleteAdminDogMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        error: "Dog not found.",
        code: "DOG_NOT_FOUND",
      },
    });

    await expect(deleteAdminDogAction({ id: "dog_1" })).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "DOG_NOT_FOUND",
      message: "Dog not found.",
    });
  });

  it("returns deleted dog response when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    deleteAdminDogMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          deletedDogId: "dog_1",
        },
      },
    });

    await expect(deleteAdminDogAction({ id: "dog_1" })).resolves.toEqual({
      data: {
        deletedDogId: "dog_1",
      },
      hasError: false,
    });
  });
});
