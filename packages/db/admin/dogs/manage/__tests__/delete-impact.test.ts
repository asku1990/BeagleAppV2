import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminDogDeleteImpactDb } from "../delete-impact";

const { dogFindUniqueMock } = vi.hoisted(() => ({
  dogFindUniqueMock: vi.fn(),
}));

vi.mock("@db/core/prisma", () => ({
  prisma: {
    dog: {
      findUnique: dogFindUniqueMock,
    },
  },
}));

describe("getAdminDogDeleteImpactDb", () => {
  beforeEach(() => {
    dogFindUniqueMock.mockReset();
  });

  it("returns null when dog is missing", async () => {
    dogFindUniqueMock.mockResolvedValue(null);

    await expect(getAdminDogDeleteImpactDb("dog_1")).resolves.toBeNull();
  });

  it("maps delete, detach, and orphan counts", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog_1",
      breeder: {
        id: "breeder_1",
        name: "Metsapolun",
        _count: { dogs: 1 },
      },
      ownerships: [
        {
          owner: {
            id: "owner_1",
            name: "Tiina Virtanen",
            ownerships: [{ dogId: "dog_1" }, { dogId: "dog_1" }],
          },
        },
        {
          owner: {
            id: "owner_1",
            name: "Tiina Virtanen",
            ownerships: [{ dogId: "dog_1" }, { dogId: "dog_1" }],
          },
        },
        {
          owner: {
            id: "owner_2",
            name: "Antti Virtanen",
            ownerships: [{ dogId: "dog_1" }, { dogId: "dog_2" }],
          },
        },
      ],
      _count: {
        registrations: 2,
        ownerships: 2,
        titles: 1,
        trialResults: 4,
        trialEntries: 5,
        showEntries: 6,
        sairaudet: 7,
        siredPuppies: 8,
        whelpedPuppies: 9,
      },
    });

    await expect(getAdminDogDeleteImpactDb("dog_1")).resolves.toEqual({
      dogId: "dog_1",
      deleted: {
        registrations: 2,
        ownerships: 2,
        titles: 1,
        legacyTrialResults: 4,
      },
      detached: {
        canonicalTrialEntries: 5,
        showEntries: 6,
        diseaseRows: 7,
        sireReferences: 8,
        damReferences: 9,
      },
      orphanWarnings: {
        owners: [{ id: "owner_1", name: "Tiina Virtanen" }],
        breeder: { id: "breeder_1", name: "Metsapolun" },
      },
    });
  });
});
