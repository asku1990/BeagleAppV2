import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminDogProfile } from "../get-admin-dog-profile";

const {
  getAdminDogProfileDbMock,
  loadDogPedigreeAncestryDbMock,
  loadDogEpiDiseaseFactsDbMock,
} = vi.hoisted(() => ({
  getAdminDogProfileDbMock: vi.fn(),
  loadDogPedigreeAncestryDbMock: vi.fn(),
  loadDogEpiDiseaseFactsDbMock: vi.fn(),
}));

vi.mock("@beagle/db/admin/dogs/profile", () => ({
  getAdminDogProfileDb: getAdminDogProfileDbMock,
}));

vi.mock("@beagle/db/dogs/core/pedigree-ancestry", () => ({
  loadDogPedigreeAncestryDb: loadDogPedigreeAncestryDbMock,
}));

vi.mock("@beagle/db/dogs/core/epi-disease-facts", () => ({
  loadDogEpiDiseaseFactsDb: loadDogEpiDiseaseFactsDbMock,
}));

describe("getAdminDogProfile", () => {
  beforeEach(() => {
    getAdminDogProfileDbMock.mockReset();
    loadDogPedigreeAncestryDbMock.mockReset();
    loadDogEpiDiseaseFactsDbMock.mockReset();
  });

  it("returns unauthorized when the user is missing", async () => {
    await expect(getAdminDogProfile("dog-1", null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(getAdminDogProfileDbMock).not.toHaveBeenCalled();
  });

  it("returns computed health and inbreeding fields for an admin user", async () => {
    getAdminDogProfileDbMock.mockResolvedValue({
      base: {
        id: "dog-1",
        name: "JALLU",
        registrationNos: [
          {
            registrationNo: "FIN28284/01",
            createdAt: new Date("2001-01-01T00:00:00.000Z"),
          },
        ],
        birthDate: new Date("2001-05-25T00:00:00.000Z"),
        sex: "MALE",
        color: null,
        ekNo: null,
        sire: {
          id: "sire-1",
          name: "JUHANNIN ROOPE",
          registrations: [
            {
              registrationNo: "FIN21285/96",
              createdAt: new Date("1996-01-01T00:00:00.000Z"),
            },
          ],
          ekNo: null,
        },
        dam: {
          id: "dam-1",
          name: "HUPI",
          registrations: [
            {
              registrationNo: "FIN31655/98",
              createdAt: new Date("1998-01-01T00:00:00.000Z"),
            },
          ],
          ekNo: null,
        },
        pedigree: [],
        offspringSummary: {
          puppyCount: 0,
          litterCount: 0,
        },
        whelpedPuppies: [],
        siredPuppies: [],
        siblingsSummary: {
          siblingCount: 0,
        },
        breederNameText: null,
      },
      note: "Muut tiedot",
      breeder: {
        name: "Karppi Raija",
        ownerName: null,
        city: "Maukkula",
        detailsSource: null,
      },
      owners: [
        {
          name: "Hurskainen Jaakko",
          postalCode: "82900",
          city: "Ilomantsi",
        },
      ],
      diseases: [
        {
          id: "dis-1",
          diseaseText: "Epilepsia",
          diseaseGroup: "EPILEPSIA",
          public: true,
          source: "legacy",
        },
        {
          id: "dis-2",
          diseaseText: "Epilepsia",
          diseaseGroup: "EPILEPSIA",
          public: false,
          source: null,
        },
      ],
    } as never);
    loadDogPedigreeAncestryDbMock
      .mockResolvedValueOnce({
        rootId: "dog-1",
        nodes: {
          "dog-1": {
            id: "dog-1",
            sireId: "sire-1",
            damId: "dam-1",
            siitosasteProsentti: null,
          },
          "sire-1": {
            id: "sire-1",
            sireId: "ancestor-1",
            damId: null,
            siitosasteProsentti: null,
          },
          "dam-1": {
            id: "dam-1",
            sireId: "ancestor-1",
            damId: null,
            siitosasteProsentti: null,
          },
          "ancestor-1": {
            id: "ancestor-1",
            sireId: null,
            damId: null,
            siitosasteProsentti: null,
          },
        },
      })
      .mockResolvedValueOnce({
        rootId: "dog-1",
        nodes: {
          "dog-1": {
            id: "dog-1",
            sireId: "sire-1",
            damId: "dam-1",
            siitosasteProsentti: null,
          },
          "sire-1": {
            id: "sire-1",
            sireId: "ancestor-1",
            damId: null,
            siitosasteProsentti: null,
          },
          "dam-1": {
            id: "dam-1",
            sireId: "ancestor-1",
            damId: null,
            siitosasteProsentti: null,
          },
          "ancestor-1": {
            id: "ancestor-1",
            sireId: null,
            damId: null,
            siitosasteProsentti: null,
          },
        },
      });
    loadDogEpiDiseaseFactsDbMock.mockResolvedValue([
      {
        dogId: "dog-1",
        isaDogId: "sire-1",
        emaDogId: "dam-1",
        sairausKoodi: "epi",
        evidenceKind: "DOG",
      },
    ]);

    const result = await getAdminDogProfile("dog-1", {
      id: "admin-1",
      email: "admin@example.com",
      username: "admin",
      role: "ADMIN",
    });

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          dog: {
            id: "dog-1",
            name: "JALLU",
            registrationNo: "FIN28284/01",
            registrationNos: ["FIN28284/01"],
            birthDate: "2001-05-25",
            sex: "MALE",
            color: null,
            ekNo: null,
            offspringCount: 0,
            offspringLitterCount: 0,
            inbreedingCoefficientPct: 12.5,
            epiLuku: 1.5,
            epiTeksti: "I----",
            laforaLuku: 0,
            epiRiskLuku: 4,
            healthSummary: "Epilepsia",
            diseases: [
              {
                id: "dis-1",
                diseaseText: "Epilepsia",
                diseaseGroup: "EPILEPSIA",
                public: true,
                source: "legacy",
              },
              {
                id: "dis-2",
                diseaseText: "Epilepsia",
                diseaseGroup: "EPILEPSIA",
                public: false,
                source: null,
              },
            ],
            sire: {
              id: "sire-1",
              name: "JUHANNIN ROOPE",
              registrationNo: "FIN21285/96",
              ekNo: null,
            },
            dam: {
              id: "dam-1",
              name: "HUPI",
              registrationNo: "FIN31655/98",
              ekNo: null,
            },
            owners: [
              {
                name: "Hurskainen Jaakko",
                postalCode: "82900",
                city: "Ilomantsi",
              },
            ],
            breeder: {
              name: "Karppi Raija",
              ownerName: null,
              city: "Maukkula",
              detailsSource: null,
            },
            breederNameText: null,
            note: "Muut tiedot",
          },
        },
      },
    });
    expect(result.body.ok ? result.body.data.dog : null).not.toHaveProperty(
      "siitosasteProsentti",
    );

    expect(getAdminDogProfileDbMock).toHaveBeenCalledWith("dog-1");
    expect(loadDogPedigreeAncestryDbMock).toHaveBeenCalledWith("dog-1", 5);
    expect(loadDogPedigreeAncestryDbMock).toHaveBeenCalledWith("dog-1", 17);
    expect(loadDogEpiDiseaseFactsDbMock).toHaveBeenCalledWith([
      "dog-1",
      "sire-1",
      "dam-1",
      "ancestor-1",
    ]);
  });

  it("returns null inbreeding when the dog has no parents", async () => {
    getAdminDogProfileDbMock.mockResolvedValue({
      base: {
        id: "dog-2",
        name: "JALKA",
        registrationNos: [
          {
            registrationNo: "FIN00000/00",
            createdAt: new Date("2000-01-01T00:00:00.000Z"),
          },
        ],
        birthDate: null,
        sex: "MALE",
        color: null,
        ekNo: null,
        sire: null,
        dam: null,
        whelpedPuppies: [],
        siredPuppies: [],
        breederNameText: null,
      },
      note: null,
      breeder: null,
      owners: [],
      diseases: [],
    } as never);
    loadDogPedigreeAncestryDbMock.mockResolvedValueOnce({
      rootId: "dog-2",
      nodes: {
        "dog-2": {
          id: "dog-2",
          sireId: null,
          damId: null,
          siitosasteProsentti: null,
        },
      },
    });
    loadDogEpiDiseaseFactsDbMock.mockResolvedValue([]);

    const result = await getAdminDogProfile("dog-2", {
      id: "admin-1",
      email: "admin@example.com",
      username: "admin",
      role: "ADMIN",
    });

    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    if (result.body.ok) {
      expect(result.body.data.dog.inbreedingCoefficientPct).toBeNull();
    }
    expect(loadDogPedigreeAncestryDbMock).toHaveBeenCalledWith("dog-2", 5);
    expect(loadDogPedigreeAncestryDbMock).not.toHaveBeenCalledWith("dog-2", 17);
  });

  it("rejects invalid dog ids before hitting the database", async () => {
    await expect(
      getAdminDogProfile("  ", {
        id: "admin-1",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Dog ID is required.",
        code: "INVALID_DOG_ID",
      },
    });

    expect(getAdminDogProfileDbMock).not.toHaveBeenCalled();
  });
});
