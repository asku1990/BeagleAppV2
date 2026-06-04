import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminDogDiseaseAction } from "../delete-admin-dog-disease";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  deleteAdminDogDiseaseMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  deleteAdminDogDiseaseMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  deleteAdminDogDisease: deleteAdminDogDiseaseMock,
}));

describe("deleteAdminDogDiseaseAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    deleteAdminDogDiseaseMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(deleteAdminDogDiseaseAction({ id: "row-1" })).resolves.toEqual(
      {
        data: null,
        hasError: true,
        errorCode: "FORBIDDEN",
        message: "Admin access required.",
      },
    );
  });

  it("passes audit context to the service", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.test",
      name: "Admin",
      role: "ADMIN",
      sessionId: "s_1",
    });
    deleteAdminDogDiseaseMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: { deletedDiseaseId: "row-1" },
      },
    });

    await expect(deleteAdminDogDiseaseAction({ id: "row-1" })).resolves.toEqual(
      {
        data: { deletedDiseaseId: "row-1" },
        hasError: false,
      },
    );
    expect(deleteAdminDogDiseaseMock).toHaveBeenCalledWith(
      { id: "row-1" },
      {
        id: "u_1",
        email: "admin@example.test",
        username: "Admin",
        role: "ADMIN",
      },
      {
        actorUserId: "u_1",
        actorSessionId: "s_1",
        source: "WEB",
      },
    );
  });
});
