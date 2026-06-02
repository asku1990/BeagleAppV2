import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminDogDiseaseAction } from "../create-admin-dog-disease";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  createAdminDogDiseaseMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  createAdminDogDiseaseMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  createAdminDogDisease: createAdminDogDiseaseMock,
}));

describe("createAdminDogDiseaseAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    createAdminDogDiseaseMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(
      createAdminDogDiseaseAction({
        evidenceKind: "DOG",
        diseaseCode: "epi",
        registrationNo: "FI12345/21",
        public: false,
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
  });

  it("passes audit context to the service", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      sessionId: "s_1",
    });
    createAdminDogDiseaseMock.mockResolvedValue({
      status: 201,
      body: {
        ok: true,
        data: { id: "row-1" },
      },
    });

    const input = {
      evidenceKind: "DOG" as const,
      diseaseCode: "epi",
      registrationNo: "FI12345/21",
      public: false,
    };

    await expect(createAdminDogDiseaseAction(input)).resolves.toEqual({
      data: { id: "row-1" },
      hasError: false,
    });
    expect(createAdminDogDiseaseMock).toHaveBeenCalledWith(input, {
      actorUserId: "u_1",
      actorSessionId: "s_1",
      source: "WEB",
    });
  });
});
