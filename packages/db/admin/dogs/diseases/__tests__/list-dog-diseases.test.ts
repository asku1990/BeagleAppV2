import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

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

describe("listAdminDogDiseasesDb", () => {
  beforeEach(() => {
    dogFindManyMock.mockReset();
    koiranSairausCountMock.mockReset();
    koiranSairausFindManyMock.mockReset();
    sairausFindManyMock.mockReset();
  });

  it("maps default Epilepsia selection, counts, and dog rows", async () => {
    sairausFindManyMock.mockResolvedValue([
      { koodi: "epi", sairausTeksti: "Epilepsia", _count: { koirat: 174 } },
      { koodi: "pur", sairausTeksti: "Purema", _count: { koirat: 8 } },
    ]);
    koiranSairausCountMock.mockResolvedValue(1);
    koiranSairausFindManyMock.mockResolvedValue([
      {
        id: "disease-1",
        evidenceKind: "DOG",
        rekisterinumero: "FI12345/21",
        julkinen: true,
        isaRekisterinumero: null,
        emaRekisterinumero: null,
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

    const result = await listAdminDogDiseasesDb({});

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
      julkinen: true,
      isaRekisterinumero: null,
      emaRekisterinumero: null,
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
      { koodi: "epi", sairausTeksti: "Epilepsia", _count: { koirat: 174 } },
    ]);
    koiranSairausCountMock.mockResolvedValue(25);
    koiranSairausFindManyMock.mockResolvedValue([]);

    const result = await listAdminDogDiseasesDb({
      diseaseCode: null,
      page: 9,
      pageSize: 10,
    });

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

  it("resolves litter parents from registration lookups", async () => {
    sairausFindManyMock.mockResolvedValue([
      { koodi: "epi", sairausTeksti: "Epilepsia", _count: { koirat: 174 } },
    ]);
    koiranSairausCountMock.mockResolvedValue(1);
    koiranSairausFindManyMock.mockResolvedValue([
      {
        id: "disease-1",
        evidenceKind: "LITTER",
        rekisterinumero: "EPI_1/94",
        julkinen: false,
        isaRekisterinumero: "SF14404/90",
        emaRekisterinumero: "SF19531/89",
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

    const result = await listAdminDogDiseasesDb({ diseaseCode: null });

    expect(result.selectedDiseaseCode).toBeNull();
    expect(result.items[0]).toEqual({
      id: "disease-1",
      evidenceKind: "LITTER",
      rekisterinumero: "EPI_1/94",
      julkinen: false,
      isaRekisterinumero: "SF14404/90",
      emaRekisterinumero: "SF19531/89",
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
});
