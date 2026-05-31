import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadDogDiseaseFactsDb,
  loadDogEpiDiseaseFactsDb,
} from "../epi-disease-facts";

const { dogRegistrationFindManyMock, koiranSairausFindManyMock, prismaMock } =
  vi.hoisted(() => {
    const dogRegistrationFindMany = vi.fn();
    const koiranSairausFindMany = vi.fn();

    return {
      dogRegistrationFindManyMock: dogRegistrationFindMany,
      koiranSairausFindManyMock: koiranSairausFindMany,
      prismaMock: {
        dogRegistration: {
          findMany: dogRegistrationFindMany,
        },
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
    dogRegistrationFindManyMock.mockReset();
    koiranSairausFindManyMock.mockReset();
  });

  it("returns an empty array when related dog ids are empty", async () => {
    const result = await loadDogEpiDiseaseFactsDb([]);

    expect(result).toEqual([]);
    expect(dogRegistrationFindManyMock).not.toHaveBeenCalled();
    expect(koiranSairausFindManyMock).not.toHaveBeenCalled();
  });

  it("loads real EPI/Lafora facts with canonical dog parents", async () => {
    dogRegistrationFindManyMock.mockResolvedValueOnce([
      { dogId: "dog-1", registrationNo: "FI00001/21" },
      { dogId: "dog-2", registrationNo: "FI00002/21" },
      { dogId: "dog-3", registrationNo: "FI00003/21" },
    ]);
    koiranSairausFindManyMock.mockResolvedValueOnce([
      {
        dogId: "dog-1",
        evidenceKind: "DOG",
        isaRekisterinumero: "STALE-SIRE",
        emaRekisterinumero: "STALE-DAM",
        sairausKoodi: "LEPIS",
        dog: {
          sireId: "canonical-sire",
          damId: "canonical-dam",
        },
      },
      {
        dogId: null,
        evidenceKind: "LITTER",
        isaRekisterinumero: "FI00002/21",
        emaRekisterinumero: "FI00003/21",
        sairausKoodi: "EPI",
        dog: null,
      },
    ]);

    const result = await loadDogEpiDiseaseFactsDb(["dog-1", "dog-2", "dog-1"]);

    expect(dogRegistrationFindManyMock).toHaveBeenCalledWith({
      where: {
        dogId: { in: ["dog-1", "dog-2"] },
      },
      select: {
        dogId: true,
        registrationNo: true,
      },
    });
    expect(koiranSairausFindManyMock).toHaveBeenCalledWith({
      where: {
        sairausKoodi: { in: ["epi", "lepis", "lepik", "lepit"] },
        OR: [
          {
            evidenceKind: "DOG",
            OR: [
              { dogId: { in: ["dog-1", "dog-2"] } },
              { dog: { sireId: { in: ["dog-1", "dog-2"] } } },
              { dog: { damId: { in: ["dog-1", "dog-2"] } } },
            ],
          },
          {
            evidenceKind: "LITTER",
            OR: [
              {
                isaRekisterinumero: {
                  in: ["FI00001/21", "FI00002/21", "FI00003/21"],
                },
              },
              {
                emaRekisterinumero: {
                  in: ["FI00001/21", "FI00002/21", "FI00003/21"],
                },
              },
            ],
          },
        ],
      },
      select: {
        dogId: true,
        evidenceKind: true,
        isaRekisterinumero: true,
        emaRekisterinumero: true,
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
    dogRegistrationFindManyMock.mockResolvedValueOnce([
      { dogId: "dog-1", registrationNo: "FI00001/21" },
    ]);
    koiranSairausFindManyMock.mockResolvedValueOnce([
      {
        dogId: "dog-1",
        evidenceKind: "DOG",
        isaRekisterinumero: "STALE-SIRE",
        emaRekisterinumero: "STALE-DAM",
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
          {
            evidenceKind: "DOG",
            OR: [
              { dogId: { in: ["dog-1"] } },
              { dog: { sireId: { in: ["dog-1"] } } },
              { dog: { damId: { in: ["dog-1"] } } },
            ],
          },
          {
            evidenceKind: "LITTER",
            OR: [
              { isaRekisterinumero: { in: ["FI00001/21"] } },
              { emaRekisterinumero: { in: ["FI00001/21"] } },
            ],
          },
        ],
      },
      select: {
        dogId: true,
        evidenceKind: true,
        isaRekisterinumero: true,
        emaRekisterinumero: true,
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
