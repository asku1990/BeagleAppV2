import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadDogEpiDiseaseFactsDb } from "../epi-disease-facts";

const { koiranSairausFindManyMock, prismaMock } = vi.hoisted(() => {
  const koiranSairausFindMany = vi.fn();

  return {
    koiranSairausFindManyMock: koiranSairausFindMany,
    prismaMock: {
      koiranSairaus: {
        findMany: koiranSairausFindMany,
      },
    },
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: prismaMock,
}));

describe("loadDogEpiDiseaseFactsDb", () => {
  beforeEach(() => {
    koiranSairausFindManyMock.mockReset();
  });

  it("returns an empty array when related dog ids are empty", async () => {
    const result = await loadDogEpiDiseaseFactsDb([]);

    expect(result).toEqual([]);
    expect(koiranSairausFindManyMock).not.toHaveBeenCalled();
  });

  it("loads only EPI/Lafora disease facts and lowercases disease code", async () => {
    koiranSairausFindManyMock.mockResolvedValueOnce([
      {
        dogId: "dog-1",
        isaDogId: null,
        emaDogId: "dog-3",
        sairausKoodi: "LEPIS",
      },
      {
        dogId: null,
        isaDogId: "dog-2",
        emaDogId: null,
        sairausKoodi: "EPI",
      },
    ]);

    const result = await loadDogEpiDiseaseFactsDb(["dog-1", "dog-2", "dog-1"]);

    expect(koiranSairausFindManyMock).toHaveBeenCalledWith({
      where: {
        sairausKoodi: { in: ["epi", "lepis", "lepik", "lepit"] },
        OR: [
          { dogId: { in: ["dog-1", "dog-2"] } },
          { isaDogId: { in: ["dog-1", "dog-2"] } },
          { emaDogId: { in: ["dog-1", "dog-2"] } },
        ],
      },
      select: {
        dogId: true,
        isaDogId: true,
        emaDogId: true,
        sairausKoodi: true,
      },
    });

    expect(result).toEqual([
      {
        dogId: "dog-1",
        isaDogId: null,
        emaDogId: "dog-3",
        sairausKoodi: "lepis",
      },
      {
        dogId: null,
        isaDogId: "dog-2",
        emaDogId: null,
        sairausKoodi: "epi",
      },
    ]);
  });
});
