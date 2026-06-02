import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminDogDiseases } from "../list-dog-diseases";

const { listAdminDogDiseasesDbMock } = vi.hoisted(() => ({
  listAdminDogDiseasesDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminDogDiseasesDb: listAdminDogDiseasesDbMock,
}));

describe("listAdminDogDiseases", () => {
  beforeEach(() => {
    listAdminDogDiseasesDbMock.mockReset();
  });

  it("returns unauthorized when the user is missing", async () => {
    await expect(listAdminDogDiseases({}, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(listAdminDogDiseasesDbMock).not.toHaveBeenCalled();
  });

  it("maps db rows and defaults the disease filter to Epi", async () => {
    listAdminDogDiseasesDbMock.mockResolvedValue({
      selectedDiseaseCode: "epi",
      total: 1,
      totalPages: 1,
      page: 1,
      diseaseOptions: [
        { diseaseCode: "epi", diseaseText: "Epilepsia", count: 174 },
      ],
      items: [
        {
          id: "row-1",
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
            sex: "FEMALE",
            ekNo: 5588,
            _count: {
              trialResults: 7,
              showEntries: 4,
            },
          },
          sire: {
            registrationNo: "FI54321/20",
            name: "Korven Aatos",
          },
          dam: {
            registrationNo: "FI77777/18",
            name: "Havupolun Helmi",
          },
        },
      ],
    });

    await expect(
      listAdminDogDiseases(
        {
          page: 2,
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          selectedDiseaseCode: "epi",
          total: 1,
          totalPages: 1,
          page: 1,
          diseaseOptions: [
            { diseaseCode: "epi", diseaseText: "Epilepsia", count: 174 },
          ],
          items: [
            {
              id: "row-1",
              evidenceKind: "DOG",
              diseaseCode: "epi",
              diseaseText: "Epilepsia",
              public: true,
              registrationNo: "FI12345/21",
              ekNo: 5588,
              sex: "FEMALE",
              name: "Metsapolun Kide",
              dogId: "dog-1",
              trialCount: 7,
              showCount: 4,
              sire: {
                registrationNo: "FI54321/20",
                name: "Korven Aatos",
              },
              dam: {
                registrationNo: "FI77777/18",
                name: "Havupolun Helmi",
              },
            },
          ],
        },
      },
    });

    expect(listAdminDogDiseasesDbMock).toHaveBeenCalledWith({
      diseaseCode: undefined,
      page: 2,
      pageSize: 15,
    });
  });

  it("maps litter rows and unknown dog sex without leaking dog-only fields", async () => {
    listAdminDogDiseasesDbMock.mockResolvedValue({
      selectedDiseaseCode: "epi",
      total: 2,
      totalPages: 1,
      page: 1,
      diseaseOptions: [
        { diseaseCode: "epi", diseaseText: "Epilepsia", count: 174 },
      ],
      items: [
        {
          id: "row-dog",
          evidenceKind: "DOG",
          rekisterinumero: "FI11111/21",
          julkinen: false,
          isaRekisterinumero: null,
          emaRekisterinumero: null,
          sairaus: {
            koodi: "epi",
            sairausTeksti: "Epilepsia",
          },
          dog: {
            id: "dog-2",
            name: "  Koiran Nimi  ",
            sex: "UNKNOWN",
            ekNo: null,
            _count: {
              trialResults: 0,
              showEntries: 0,
            },
          },
          sire: {
            registrationNo: "FI54321/20",
            name: "Korven Aatos",
          },
          dam: {
            registrationNo: "FI77777/18",
            name: "Havupolun Helmi",
          },
        },
        {
          id: "row-litter",
          evidenceKind: "LITTER",
          rekisterinumero: "EPI_1/94",
          julkinen: true,
          isaRekisterinumero: "FI00001/90",
          emaRekisterinumero: "FI00002/90",
          sairaus: {
            koodi: "epi",
            sairausTeksti: "Epilepsia",
          },
          dog: null,
          sire: {
            registrationNo: "FI54321/20",
            name: "Korven Aatos",
          },
          dam: {
            registrationNo: "FI77777/18",
            name: "Havupolun Helmi",
          },
        },
      ],
    });

    await expect(
      listAdminDogDiseases(
        {},
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          selectedDiseaseCode: "epi",
          total: 2,
          totalPages: 1,
          page: 1,
          diseaseOptions: [
            { diseaseCode: "epi", diseaseText: "Epilepsia", count: 174 },
          ],
          items: [
            {
              id: "row-dog",
              evidenceKind: "DOG",
              diseaseCode: "epi",
              diseaseText: "Epilepsia",
              public: false,
              registrationNo: "FI11111/21",
              ekNo: null,
              sex: "UNKNOWN",
              name: "Koiran Nimi",
              dogId: "dog-2",
              trialCount: 0,
              showCount: 0,
              sire: {
                registrationNo: "FI54321/20",
                name: "Korven Aatos",
              },
              dam: {
                registrationNo: "FI77777/18",
                name: "Havupolun Helmi",
              },
            },
            {
              id: "row-litter",
              evidenceKind: "LITTER",
              diseaseCode: "epi",
              diseaseText: "Epilepsia",
              public: true,
              registrationNo: "EPI_1/94",
              ekNo: null,
              sex: null,
              name: "Nimi ei ole tiedossa",
              dogId: null,
              trialCount: null,
              showCount: null,
              sire: {
                registrationNo: "FI54321/20",
                name: "Korven Aatos",
              },
              dam: {
                registrationNo: "FI77777/18",
                name: "Havupolun Helmi",
              },
            },
          ],
        },
      },
    });
  });

  it("returns internal error when the db throws", async () => {
    listAdminDogDiseasesDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminDogDiseases(
        {},
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin dog diseases.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
