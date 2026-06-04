import { beforeEach, describe, expect, it, vi } from "vitest";
import { findAdminDogDiseaseDuplicateDb } from "../create-dog-disease";

const { koiranSairausFindFirstMock, prismaMock } = vi.hoisted(() => {
  const koiranSairausFindFirst = vi.fn();

  return {
    koiranSairausFindFirstMock: koiranSairausFindFirst,
    prismaMock: {
      koiranSairaus: {
        findFirst: koiranSairausFindFirst,
      },
    },
  };
});

vi.mock("../../../../core/prisma", () => ({
  prisma: prismaMock,
}));

describe("findAdminDogDiseaseDuplicateDb", () => {
  beforeEach(() => {
    koiranSairausFindFirstMock.mockReset();
  });

  it("looks up duplicate DOG evidence by evidence kind, dog, disease, and registration", async () => {
    koiranSairausFindFirstMock.mockResolvedValue({ id: "row-1" });

    await expect(
      findAdminDogDiseaseDuplicateDb({
        evidenceKind: "DOG",
        dogId: "dog-1",
        sairausId: "sairaus-1",
        rekisterinumero: "FI12345/21",
        isaRekisterinumero: null,
        emaRekisterinumero: null,
      }),
    ).resolves.toEqual({ id: "row-1" });

    expect(koiranSairausFindFirstMock).toHaveBeenCalledWith({
      where: {
        evidenceKind: "DOG",
        dogId: "dog-1",
        sairausId: "sairaus-1",
        rekisterinumero: "FI12345/21",
      },
      select: {
        id: true,
      },
    });
  });

  it("looks up duplicate LITTER evidence by evidence kind, disease, registration, and parents", async () => {
    koiranSairausFindFirstMock.mockResolvedValue(null);

    await expect(
      findAdminDogDiseaseDuplicateDb({
        evidenceKind: "LITTER",
        dogId: null,
        sairausId: "sairaus-1",
        rekisterinumero: "EPI_1/94",
        isaRekisterinumero: "SF14404/90",
        emaRekisterinumero: "SF19531/89",
      }),
    ).resolves.toBeNull();

    expect(koiranSairausFindFirstMock).toHaveBeenCalledWith({
      where: {
        evidenceKind: "LITTER",
        dogId: null,
        sairausId: "sairaus-1",
        rekisterinumero: "EPI_1/94",
        isaRekisterinumero: "SF14404/90",
        emaRekisterinumero: "SF19531/89",
      },
      select: {
        id: true,
      },
    });
  });
});
