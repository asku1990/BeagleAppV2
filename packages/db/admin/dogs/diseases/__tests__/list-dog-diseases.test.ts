import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";
import type { AdminDogDiseaseDefinitionOptionDb } from "../types";

const {
  dogFindManyMock,
  koiranSairausCountMock,
  koiranSairausFindManyMock,
  sairausFindManyMock,
  prismaMock,
} = vi.hoisted(() => {
  const dogFindMany = vi.fn();
  const koiranSairausCount = vi.fn();
  const koiranSairausFindMany = vi.fn();
  const sairausFindMany = vi.fn();

  return {
    dogFindManyMock: dogFindMany,
    koiranSairausCountMock: koiranSairausCount,
    koiranSairausFindManyMock: koiranSairausFindMany,
    sairausFindManyMock: sairausFindMany,
    prismaMock: {
      dog: {
        findMany: dogFindMany,
      },
      koiranSairaus: {
        count: koiranSairausCount,
        findMany: koiranSairausFindMany,
      },
      sairaus: {
        findMany: sairausFindMany,
      },
    },
  };
});

vi.mock("../../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { listAdminDogDiseasesDb } from "../list-dog-diseases";
import { listAdminDogDiseaseDefinitionsDb } from "../list-dog-disease-definitions";

const diseaseDefinitions: AdminDogDiseaseDefinitionOptionDb[] = [
  {
    diseaseCode: "epi",
    diseaseText: "Epilepsia",
    count: 174,
  },
  {
    diseaseCode: "pur",
    diseaseText: "Purema",
    count: 8,
  },
];

describe("listAdminDogDiseasesDb", () => {
  beforeEach(() => {
    dogFindManyMock.mockReset();
    koiranSairausCountMock.mockReset();
    koiranSairausFindManyMock.mockReset();
    sairausFindManyMock.mockReset();
  });

  it("loads disease definitions as browse options", async () => {
    sairausFindManyMock.mockResolvedValue([
      {
        koodi: "epi",
        sairausTeksti: "Epilepsia",
        _count: { koirat: 174 },
      },
      {
        koodi: "pur",
        sairausTeksti: "Purema",
        _count: { koirat: 8 },
      },
    ]);

    await expect(listAdminDogDiseaseDefinitionsDb()).resolves.toEqual([
      {
        diseaseCode: "epi",
        diseaseText: "Epilepsia",
        count: 174,
      },
      {
        diseaseCode: "pur",
        diseaseText: "Purema",
        count: 8,
      },
    ]);

    expect(sairausFindManyMock).toHaveBeenCalledWith({
      select: {
        koodi: true,
        sairausTeksti: true,
        _count: {
          select: {
            koirat: true,
          },
        },
      },
      orderBy: [{ sairausTeksti: "asc" }, { koodi: "asc" }],
    });
  });

  it("maps default Epilepsia selection, counts, and dog rows", async () => {
    sairausFindManyMock.mockResolvedValue([
      {
        koodi: "epi",
        sairausTeksti: "Epilepsia",
        _count: { koirat: 174 },
      },
      {
        koodi: "pur",
        sairausTeksti: "Purema",
        _count: { koirat: 8 },
      },
    ]);
    koiranSairausCountMock.mockResolvedValue(1);
    koiranSairausFindManyMock.mockResolvedValue([
      {
        id: "disease-1",
        evidenceKind: "DOG",
        rekisterinumero: "FI12345/21",
        pentue: "PENTUE-1",
        kuvaus: "Kuvaus koiralle",
        julkinen: true,
        isaRekisterinumero: null,
        emaRekisterinumero: null,
        tietolahde: "Lomake",
        sairaus: { koodi: "epi", sairausTeksti: "Epilepsia" },
        dog: {
          id: "dog-1",
          name: "Metsapolun Kide",
          sex: DogSex.FEMALE,
          ekNo: 5588,
          sire: {
            name: "Korven Aatos",
            registrations: [{ registrationNo: "FI54321/20" }],
          },
          dam: {
            name: "Havupolun Helmi",
            registrations: [{ registrationNo: "FI77777/18" }],
          },
          _count: { trialResults: 7, showEntries: 4 },
        },
      },
    ]);

    const result = await listAdminDogDiseasesDb(
      {
        selectedDiseaseCode: "epi",
        query: "",
        page: 1,
        pageSize: 15,
      },
      diseaseDefinitions,
    );

    expect(result.selectedDiseaseCode).toBe("epi");
    expect(result.total).toBe(1);
    expect(result.diseaseOptions).toEqual([
      { diseaseCode: "epi", diseaseText: "Epilepsia", count: 174 },
      { diseaseCode: "pur", diseaseText: "Purema", count: 8 },
    ]);
    expect(result.items[0]).toEqual({
      id: "disease-1",
      evidenceKind: "DOG",
      rekisterinumero: "FI12345/21",
      pentue: "PENTUE-1",
      kuvaus: "Kuvaus koiralle",
      julkinen: true,
      isaRekisterinumero: null,
      emaRekisterinumero: null,
      tietolahde: "Lomake",
      sairaus: {
        koodi: "epi",
        sairausTeksti: "Epilepsia",
      },
      dog: {
        id: "dog-1",
        name: "Metsapolun Kide",
        sex: DogSex.FEMALE,
        ekNo: 5588,
        _count: { trialResults: 7, showEntries: 4 },
      },
      sire: {
        registrationNo: "FI54321/20",
        name: "Korven Aatos",
      },
      dam: {
        registrationNo: "FI77777/18",
        name: "Havupolun Helmi",
      },
    });
  });

  it("paginates disease rows and preserves explicit all selection", async () => {
    sairausFindManyMock.mockResolvedValue([
      {
        koodi: "epi",
        sairausTeksti: "Epilepsia",
        _count: { koirat: 174 },
      },
    ]);
    koiranSairausCountMock.mockResolvedValue(25);
    koiranSairausFindManyMock.mockResolvedValue([]);

    const result = await listAdminDogDiseasesDb(
      {
        selectedDiseaseCode: null,
        query: "",
        page: 9,
        pageSize: 10,
      },
      diseaseDefinitions,
    );

    expect(result.selectedDiseaseCode).toBeNull();
    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(3);

    const findManyArgs = koiranSairausFindManyMock.mock.calls[0]?.[0] as {
      skip: number;
      take: number;
    };
    expect(findManyArgs.skip).toBe(20);
    expect(findManyArgs.take).toBe(10);
  });

  it("filters by disease code and text query", async () => {
    sairausFindManyMock.mockResolvedValue([
      {
        koodi: "epi",
        sairausTeksti: "Epilepsia",
        _count: { koirat: 174 },
      },
      {
        koodi: "pur",
        sairausTeksti: "Purema",
        _count: { koirat: 8 },
      },
    ]);
    koiranSairausCountMock.mockResolvedValue(0);

    const result = await listAdminDogDiseasesDb(
      {
        selectedDiseaseCode: "pur",
        query: "FI123",
        page: 1,
        pageSize: 15,
      },
      diseaseDefinitions,
    );

    expect(result.selectedDiseaseCode).toBe("pur");
    expect(result.query).toBe("FI123");
    expect(koiranSairausCountMock).toHaveBeenCalledWith({
      where: {
        sairaus: { koodi: "pur" },
        OR: [
          {
            rekisterinumero: {
              contains: "FI123",
              mode: "insensitive",
            },
          },
          {
            dog: {
              name: {
                contains: "FI123",
                mode: "insensitive",
              },
            },
          },
        ],
      },
    });
    expect(koiranSairausFindManyMock).not.toHaveBeenCalled();
  });

  it("resolves litter parents from registration lookups", async () => {
    sairausFindManyMock.mockResolvedValue([
      {
        koodi: "epi",
        sairausTeksti: "Epilepsia",
        _count: { koirat: 174 },
      },
    ]);
    koiranSairausCountMock.mockResolvedValue(1);
    koiranSairausFindManyMock.mockResolvedValue([
      {
        id: "disease-1",
        evidenceKind: "LITTER",
        rekisterinumero: "EPI_1/94",
        pentue: null,
        kuvaus: "",
        julkinen: false,
        isaRekisterinumero: "SF14404/90",
        emaRekisterinumero: "SF19531/89",
        tietolahde: null,
        sairaus: { koodi: "epi", sairausTeksti: "Epilepsia" },
        dog: null,
      },
    ]);
    dogFindManyMock.mockResolvedValue([
      {
        name: "Isäkoira",
        registrations: [{ registrationNo: "SF14404/90" }],
      },
      {
        name: "Emäkoira",
        registrations: [{ registrationNo: "SF19531/89" }],
      },
    ]);

    const result = await listAdminDogDiseasesDb(
      {
        selectedDiseaseCode: null,
        query: "",
        page: 1,
        pageSize: 15,
      },
      diseaseDefinitions,
    );

    expect(result.selectedDiseaseCode).toBeNull();
    expect(result.items[0]).toEqual({
      id: "disease-1",
      evidenceKind: "LITTER",
      rekisterinumero: "EPI_1/94",
      pentue: null,
      kuvaus: "",
      julkinen: false,
      isaRekisterinumero: "SF14404/90",
      emaRekisterinumero: "SF19531/89",
      tietolahde: null,
      sairaus: {
        koodi: "epi",
        sairausTeksti: "Epilepsia",
      },
      dog: null,
      sire: {
        registrationNo: "SF14404/90",
        name: "Isäkoira",
      },
      dam: {
        registrationNo: "SF19531/89",
        name: "Emäkoira",
      },
    });
  });

  it("preserves empty and null metadata values from the db row", async () => {
    sairausFindManyMock.mockResolvedValue([
      {
        koodi: "epi",
        sairausTeksti: "Epilepsia",
        _count: { koirat: 174 },
      },
    ]);
    koiranSairausCountMock.mockResolvedValue(1);
    koiranSairausFindManyMock.mockResolvedValue([
      {
        id: "disease-1",
        evidenceKind: "DOG",
        rekisterinumero: "FI12345/21",
        pentue: "",
        kuvaus: null,
        julkinen: true,
        isaRekisterinumero: null,
        emaRekisterinumero: null,
        tietolahde: "  ",
        sairaus: { koodi: "epi", sairausTeksti: "Epilepsia" },
        dog: null,
      },
    ]);

    const result = await listAdminDogDiseasesDb(
      {
        selectedDiseaseCode: "epi",
        query: "",
        page: 1,
        pageSize: 15,
      },
      diseaseDefinitions,
    );

    expect(result.items[0]).toEqual({
      id: "disease-1",
      evidenceKind: "DOG",
      rekisterinumero: "FI12345/21",
      pentue: "",
      kuvaus: null,
      julkinen: true,
      isaRekisterinumero: null,
      emaRekisterinumero: null,
      tietolahde: "  ",
      sairaus: {
        koodi: "epi",
        sairausTeksti: "Epilepsia",
      },
      dog: null,
      sire: {
        registrationNo: null,
        name: null,
      },
      dam: {
        registrationNo: null,
        name: null,
      },
    });
  });
});
