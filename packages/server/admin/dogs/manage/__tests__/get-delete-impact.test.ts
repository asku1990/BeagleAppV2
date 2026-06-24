import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminDogDeleteImpact } from "../get-delete-impact";

const { getAdminDogDeleteImpactDbMock } = vi.hoisted(() => ({
  getAdminDogDeleteImpactDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getAdminDogDeleteImpactDb: getAdminDogDeleteImpactDbMock,
}));

describe("getAdminDogDeleteImpact", () => {
  beforeEach(() => {
    getAdminDogDeleteImpactDbMock.mockReset();
  });

  it("returns 400 for invalid dog id", async () => {
    await expect(getAdminDogDeleteImpact({ id: " " })).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Dog id is required.",
        code: "INVALID_DOG_ID",
      },
    });

    expect(getAdminDogDeleteImpactDbMock).not.toHaveBeenCalled();
  });

  it("returns 404 when dog is missing", async () => {
    getAdminDogDeleteImpactDbMock.mockResolvedValue(null);

    await expect(getAdminDogDeleteImpact({ id: "dog_1" })).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "Dog not found.",
        code: "DOG_NOT_FOUND",
      },
    });
  });

  it("returns impact when db lookup succeeds", async () => {
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
    getAdminDogDeleteImpactDbMock.mockResolvedValue(impact);

    await expect(getAdminDogDeleteImpact({ id: " dog_1 " })).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: impact,
      },
    });
    expect(getAdminDogDeleteImpactDbMock).toHaveBeenCalledWith("dog_1");
  });
});
