import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadDogDiseaseFactsDb,
  loadDogEpiDiseaseFactsDb,
} from "../epi-disease-facts";

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

  it("loads real EPI/Lafora facts with canonical dog parents", async () => {
    koiranSairausFindManyMock.mockResolvedValueOnce([
      {
        dogId: "dog-1",
        isaDogId: "stale-sire",
        emaDogId: "stale-dam",
        sairausKoodi: "LEPIS",
        dog: {
          sireId: "canonical-sire",
          damId: "canonical-dam",
        },
      },
      {
        dogId: null,
        isaDogId: "dog-2",
        emaDogId: "dog-3",
        sairausKoodi: "EPI",
        dog: null,
      },
    ]);

    const result = await loadDogEpiDiseaseFactsDb(["dog-1", "dog-2", "dog-1"]);

    expect(koiranSairausFindManyMock).toHaveBeenCalledWith({
      where: {
        sairausKoodi: { in: ["epi", "lepis", "lepik", "lepit"] },
        OR: [
          { dogId: { in: ["dog-1", "dog-2"] } },
          { dog: { sireId: { in: ["dog-1", "dog-2"] } } },
          { dog: { damId: { in: ["dog-1", "dog-2"] } } },
          { dogId: null, isaDogId: { in: ["dog-1", "dog-2"] } },
          { dogId: null, emaDogId: { in: ["dog-1", "dog-2"] } },
        ],
      },
      select: {
        dogId: true,
        isaDogId: true,
        emaDogId: true,
        sairausKoodi: true,
        dog: {
          select: {
            sireId: true,
            damId: true,
          },
        },
      },
    });

    expect(result).toEqual([
      {
        dogId: "dog-1",
        isaDogId: "canonical-sire",
        emaDogId: "canonical-dam",
        sairausKoodi: "lepis",
        evidenceKind: "DOG",
      },
      {
        dogId: null,
        isaDogId: "dog-2",
        emaDogId: "dog-3",
        sairausKoodi: "epi",
        evidenceKind: "LITTER",
      },
    ]);
  });

  it("loads a custom disease code set for virtual pairing", async () => {
    koiranSairausFindManyMock.mockResolvedValueOnce([
      {
        dogId: "dog-1",
        isaDogId: "stale-sire",
        emaDogId: "stale-dam",
        sairausKoodi: "PUR",
        dog: {
          sireId: null,
          damId: "canonical-dam",
        },
      },
    ]);

    const result = await loadDogDiseaseFactsDb(
      ["dog-1"],
      ["epi", "pur", "ap", "yp", "rp"],
    );

    expect(koiranSairausFindManyMock).toHaveBeenCalledWith({
      where: {
        sairausKoodi: { in: ["epi", "pur", "ap", "yp", "rp"] },
        OR: [
          { dogId: { in: ["dog-1"] } },
          { dog: { sireId: { in: ["dog-1"] } } },
          { dog: { damId: { in: ["dog-1"] } } },
          { dogId: null, isaDogId: { in: ["dog-1"] } },
          { dogId: null, emaDogId: { in: ["dog-1"] } },
        ],
      },
      select: {
        dogId: true,
        isaDogId: true,
        emaDogId: true,
        sairausKoodi: true,
        dog: {
          select: {
            sireId: true,
            damId: true,
          },
        },
      },
    });

    expect(result).toEqual([
      {
        dogId: "dog-1",
        isaDogId: null,
        emaDogId: "canonical-dam",
        sairausKoodi: "pur",
        evidenceKind: "DOG",
      },
    ]);
  });
});
