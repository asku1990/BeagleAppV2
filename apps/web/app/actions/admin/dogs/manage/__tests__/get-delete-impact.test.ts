import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminDogDeleteImpactAction } from "../get-delete-impact";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  getAdminDogDeleteImpactMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  getAdminDogDeleteImpactMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  getAdminDogDeleteImpact: getAdminDogDeleteImpactMock,
}));

describe("getAdminDogDeleteImpactAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    getAdminDogDeleteImpactMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(
      getAdminDogDeleteImpactAction({ id: "dog_1" }),
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
      sessionId: "s_1",
    });
    getAdminDogDeleteImpactMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        error: "Dog not found.",
        code: "DOG_NOT_FOUND",
      },
    });

    await expect(
      getAdminDogDeleteImpactAction({ id: "dog_1" }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "DOG_NOT_FOUND",
      message: "Dog not found.",
    });
  });

  it("returns impact when service succeeds", async () => {
    const impact = {
      dogId: "dog_1",
      deleted: {
        registrations: 1,
        ownerships: 2,
        titles: 3,
        legacyTrialResults: 4,
      },
      detached: {
        canonicalTrialEntries: 5,
        showEntries: 6,
        diseaseRows: 7,
        sireReferences: 8,
        damReferences: 9,
      },
      orphanWarnings: { owners: [], breeder: null },
    };
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      sessionId: "s_1",
    });
    getAdminDogDeleteImpactMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: impact },
    });

    await expect(
      getAdminDogDeleteImpactAction({ id: "dog_1" }),
    ).resolves.toEqual({
      data: impact,
      hasError: false,
    });
  });
});
