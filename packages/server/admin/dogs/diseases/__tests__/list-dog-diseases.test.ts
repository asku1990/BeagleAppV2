import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminDogDiseases } from "../list-dog-diseases";

const { listAdminDogDiseaseDefinitionsDbMock, listAdminDogDiseasesDbMock } =
  vi.hoisted(() => ({
    listAdminDogDiseaseDefinitionsDbMock: vi.fn(),
    listAdminDogDiseasesDbMock: vi.fn(),
  }));

const diseaseDefinitions = [
  {
    diseaseCode: "epi",
    diseaseText: "Epilepsia",
    count: 174,
  },
  {
    diseaseCode: "pur",
    diseaseText: "Purenta",
    count: 8,
  },
];

vi.mock("@beagle/db", () => ({
  listAdminDogDiseaseDefinitionsDb: listAdminDogDiseaseDefinitionsDbMock,
  listAdminDogDiseasesDb: listAdminDogDiseasesDbMock,
}));

describe("listAdminDogDiseases", () => {
  beforeEach(() => {
    listAdminDogDiseaseDefinitionsDbMock.mockReset();
    listAdminDogDiseaseDefinitionsDbMock.mockResolvedValue(diseaseDefinitions);
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

  it("passes normalized query text to the db layer", async () => {
    listAdminDogDiseasesDbMock.mockResolvedValue({
      selectedDiseaseCode: "epi",
      query: "kide",
      total: 0,
      totalPages: 0,
      page: 1,
      diseaseOptions: [],
      items: [],
    });

    const longQuery = `  ${"x".repeat(120)}  `;

    await listAdminDogDiseases(
      {
        query: longQuery,
      },
      {
        id: "u_1",
        email: "admin@example.com",
        username: null,
        role: "ADMIN",
      },
    );

    expect(listAdminDogDiseasesDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        query: "x".repeat(100),
      }),
      diseaseDefinitions,
    );
  });

  it("maps db rows and defaults the disease filter to Epi", async () => {
    listAdminDogDiseasesDbMock.mockResolvedValue({
      selectedDiseaseCode: "epi",
      query: "kide",
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
          query: "kide",
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
              pentue: "PENTUE-1",
              kuvaus: "Kuvaus koiralle",
              public: true,
              registrationNo: "FI12345/21",
              tietolahde: "Lomake",
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

    expect(listAdminDogDiseasesDbMock).toHaveBeenCalledWith(
      {
        selectedDiseaseCode: "epi",
        query: "",
        page: 2,
        pageSize: 15,
      },
      diseaseDefinitions,
    );
  });

  it("maps litter rows and unknown dog sex without leaking dog-only fields", async () => {
    listAdminDogDiseasesDbMock.mockResolvedValue({
      selectedDiseaseCode: "epi",
      query: "",
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
          pentue: "",
          kuvaus: null,
          julkinen: false,
          isaRekisterinumero: null,
          emaRekisterinumero: null,
          tietolahde: null,
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
          pentue: null,
          kuvaus: "  ",
          julkinen: true,
          isaRekisterinumero: "FI00001/90",
          emaRekisterinumero: "FI00002/90",
          tietolahde: "",
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
          query: "",
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
              pentue: "",
              kuvaus: null,
              public: false,
              registrationNo: "FI11111/21",
              tietolahde: null,
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
              pentue: null,
              kuvaus: "  ",
              public: true,
              registrationNo: "EPI_1/94",
              tietolahde: "",
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

  it("preserves explicit all filters when forwarding to db", async () => {
    listAdminDogDiseasesDbMock.mockResolvedValue({
      selectedDiseaseCode: null,
      query: "sako",
      total: 0,
      totalPages: 0,
      page: 1,
      diseaseOptions: [],
      items: [],
    });

    await expect(
      listAdminDogDiseases(
        {
          diseaseCode: null,
          query: "sako",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toMatchObject({
      status: 200,
      body: {
        ok: true,
        data: {
          selectedDiseaseCode: null,
          query: "sako",
        },
      },
    });

    expect(listAdminDogDiseasesDbMock).toHaveBeenCalledWith(
      {
        selectedDiseaseCode: null,
        query: "sako",
        page: 1,
        pageSize: 15,
      },
      diseaseDefinitions,
    );
  });

  it("preserves explicit disease code filters", async () => {
    listAdminDogDiseasesDbMock.mockResolvedValue({
      selectedDiseaseCode: "pur",
      query: "",
      total: 0,
      totalPages: 0,
      page: 1,
      diseaseOptions: [],
      items: [],
    });

    await listAdminDogDiseases(
      {
        diseaseCode: "pur",
      },
      {
        id: "u_1",
        email: "admin@example.com",
        username: null,
        role: "ADMIN",
      },
    );

    expect(listAdminDogDiseasesDbMock).toHaveBeenCalledWith(
      {
        selectedDiseaseCode: "pur",
        query: "",
        page: 1,
        pageSize: 15,
      },
      diseaseDefinitions,
    );
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
