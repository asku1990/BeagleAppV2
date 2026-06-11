import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminDogDisease } from "../create-dog-disease";

const {
  createAdminDogDiseaseDbMock,
  findAdminDiseaseDogByRegistrationNoDbMock,
  findAdminDogDiseaseDefinitionByCodeDbMock,
  findAdminDogDiseaseDuplicateDbMock,
  runAdminDogDiseaseWriteTransactionDbMock,
} = vi.hoisted(() => ({
  createAdminDogDiseaseDbMock: vi.fn(),
  findAdminDiseaseDogByRegistrationNoDbMock: vi.fn(),
  findAdminDogDiseaseDefinitionByCodeDbMock: vi.fn(),
  findAdminDogDiseaseDuplicateDbMock: vi.fn(),
  runAdminDogDiseaseWriteTransactionDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  createAdminDogDiseaseDb: createAdminDogDiseaseDbMock,
  findAdminDiseaseDogByRegistrationNoDb:
    findAdminDiseaseDogByRegistrationNoDbMock,
  findAdminDogDiseaseDefinitionByCodeDb:
    findAdminDogDiseaseDefinitionByCodeDbMock,
  findAdminDogDiseaseDuplicateDb: findAdminDogDiseaseDuplicateDbMock,
  runAdminDogDiseaseWriteTransactionDb:
    runAdminDogDiseaseWriteTransactionDbMock,
}));

const adminUser = {
  id: "u_1",
  email: "admin@example.test",
  username: "admin",
  role: "ADMIN" as const,
};

describe("createAdminDogDisease", () => {
  beforeEach(() => {
    createAdminDogDiseaseDbMock.mockReset();
    findAdminDiseaseDogByRegistrationNoDbMock.mockReset();
    findAdminDogDiseaseDefinitionByCodeDbMock.mockReset();
    findAdminDogDiseaseDuplicateDbMock.mockReset();
    runAdminDogDiseaseWriteTransactionDbMock.mockReset();
    runAdminDogDiseaseWriteTransactionDbMock.mockImplementation(
      async (callback) => callback({ tx: true }),
    );
    findAdminDogDiseaseDuplicateDbMock.mockResolvedValue(null);
  });

  it("creates DOG evidence for a resolved dog", async () => {
    findAdminDogDiseaseDefinitionByCodeDbMock.mockResolvedValue({
      id: "sairaus-epi",
      koodi: "epi",
    });
    findAdminDiseaseDogByRegistrationNoDbMock.mockResolvedValueOnce({
      id: "dog-1",
    });
    createAdminDogDiseaseDbMock.mockResolvedValue({ id: "row-1" });

    await expect(
      createAdminDogDisease(
        {
          evidenceKind: "DOG",
          diseaseCode: "epi",
          registrationNo: " fi12345/21 ",
          public: false,
          description: "Omistaja ilmoitti",
          source: "Puhelu",
        },
        adminUser,
        { actorUserId: "u_1", source: "WEB" },
      ),
    ).resolves.toEqual({
      status: 201,
      body: {
        ok: true,
        data: { id: "row-1" },
      },
    });

    expect(createAdminDogDiseaseDbMock).toHaveBeenCalledWith(
      {
        evidenceKind: "DOG",
        dogId: "dog-1",
        rekisterinumero: "FI12345/21",
        isaRekisterinumero: null,
        emaRekisterinumero: null,
        sairausId: "sairaus-epi",
        sairausKoodi: "epi",
        pentue: null,
        kuvaus: "Omistaja ilmoitti",
        julkinen: false,
        tietolahde: "Puhelu",
      },
      { tx: true },
    );
    expect(findAdminDogDiseaseDuplicateDbMock).toHaveBeenCalledWith(
      {
        evidenceKind: "DOG",
        dogId: "dog-1",
        sairausId: "sairaus-epi",
        rekisterinumero: "FI12345/21",
        isaRekisterinumero: null,
        emaRekisterinumero: null,
      },
      { tx: true },
    );
    expect(runAdminDogDiseaseWriteTransactionDbMock).toHaveBeenCalledWith(
      expect.any(Function),
      {
        actorUserId: "u_1",
        source: "WEB",
        intent: "CREATE_DOG_DISEASE",
      },
    );
  });

  it("rejects non-admin users before DB access", async () => {
    await expect(
      createAdminDogDisease(
        {
          evidenceKind: "DOG",
          diseaseCode: "epi",
          registrationNo: "FI12345/21",
          public: false,
        },
        {
          id: "u_2",
          email: "user@example.test",
          username: "user",
          role: "USER",
        },
      ),
    ).resolves.toEqual({
      status: 403,
      body: {
        ok: false,
        error: "Admin role required.",
        code: "FORBIDDEN",
      },
    });

    expect(runAdminDogDiseaseWriteTransactionDbMock).not.toHaveBeenCalled();
    expect(findAdminDogDiseaseDefinitionByCodeDbMock).not.toHaveBeenCalled();
    expect(findAdminDiseaseDogByRegistrationNoDbMock).not.toHaveBeenCalled();
    expect(createAdminDogDiseaseDbMock).not.toHaveBeenCalled();
  });

  it("creates LITTER evidence with resolved source parents", async () => {
    findAdminDogDiseaseDefinitionByCodeDbMock.mockResolvedValue({
      id: "sairaus-epi",
      koodi: "epi",
    });
    findAdminDiseaseDogByRegistrationNoDbMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "sire-1" })
      .mockResolvedValueOnce({ id: "dam-1" });
    createAdminDogDiseaseDbMock.mockResolvedValue({ id: "row-litter" });

    await expect(
      createAdminDogDisease(
        {
          evidenceKind: "LITTER",
          diseaseCode: "epi",
          registrationNo: "EPI_1/94",
          sireRegistrationNo: "SF14404/90",
          damRegistrationNo: "SF19531/89",
          public: false,
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 201,
      body: {
        ok: true,
        data: { id: "row-litter" },
      },
    });

    expect(createAdminDogDiseaseDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        evidenceKind: "LITTER",
        dogId: null,
        rekisterinumero: "EPI_1/94",
        isaRekisterinumero: "SF14404/90",
        emaRekisterinumero: "SF19531/89",
      }),
      { tx: true },
    );
    expect(findAdminDogDiseaseDuplicateDbMock).toHaveBeenCalledWith(
      {
        evidenceKind: "LITTER",
        dogId: null,
        sairausId: "sairaus-epi",
        rekisterinumero: "EPI_1/94",
        isaRekisterinumero: "SF14404/90",
        emaRekisterinumero: "SF19531/89",
      },
      { tx: true },
    );
  });

  it("allows compact legacy EPI litter registrations", async () => {
    findAdminDogDiseaseDefinitionByCodeDbMock.mockResolvedValue({
      id: "sairaus-epi",
      koodi: "epi",
    });
    findAdminDiseaseDogByRegistrationNoDbMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "sire-1" })
      .mockResolvedValueOnce({ id: "dam-1" });
    createAdminDogDiseaseDbMock.mockResolvedValue({ id: "row-litter" });

    await expect(
      createAdminDogDisease(
        {
          evidenceKind: "LITTER",
          diseaseCode: "epi",
          registrationNo: "EPI1/26",
          sireRegistrationNo: "SF14404/90",
          damRegistrationNo: "SF19531/89",
          public: false,
        },
        adminUser,
      ),
    ).resolves.toMatchObject({
      status: 201,
      body: {
        ok: true,
        data: { id: "row-litter" },
      },
    });
  });

  it("allows compact legacy non-EPI litter registrations", async () => {
    findAdminDogDiseaseDefinitionByCodeDbMock.mockResolvedValue({
      id: "sairaus-pur",
      koodi: "pur",
    });
    findAdminDiseaseDogByRegistrationNoDbMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "sire-1" })
      .mockResolvedValueOnce({ id: "dam-1" });
    createAdminDogDiseaseDbMock.mockResolvedValue({ id: "row-litter" });

    await expect(
      createAdminDogDisease(
        {
          evidenceKind: "LITTER",
          diseaseCode: "pur",
          registrationNo: "PUR1/06",
          sireRegistrationNo: "SF14404/90",
          damRegistrationNo: "SF19531/89",
          public: false,
        },
        adminUser,
      ),
    ).resolves.toMatchObject({
      status: 201,
      body: {
        ok: true,
        data: { id: "row-litter" },
      },
    });
  });

  it("rejects valid unresolved real registrations as litter evidence", async () => {
    findAdminDogDiseaseDefinitionByCodeDbMock.mockResolvedValue({
      id: "sairaus-epi",
      koodi: "epi",
    });
    findAdminDiseaseDogByRegistrationNoDbMock.mockResolvedValueOnce(null);

    await expect(
      createAdminDogDisease(
        {
          evidenceKind: "LITTER",
          diseaseCode: "epi",
          registrationNo: "FI12345/21",
          sireRegistrationNo: "SF14404/90",
          damRegistrationNo: "SF19531/89",
          public: false,
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        code: "INVALID_LITTER_REGISTRATION_NO",
        error:
          "Litter evidence requires an anonymous or synthetic registration number.",
      },
    });

    expect(createAdminDogDiseaseDbMock).not.toHaveBeenCalled();
  });

  it("rejects duplicate DOG evidence before inserting", async () => {
    findAdminDogDiseaseDefinitionByCodeDbMock.mockResolvedValue({
      id: "sairaus-epi",
      koodi: "epi",
    });
    findAdminDiseaseDogByRegistrationNoDbMock.mockResolvedValueOnce({
      id: "dog-1",
    });
    findAdminDogDiseaseDuplicateDbMock.mockResolvedValueOnce({
      id: "existing-row",
    });

    await expect(
      createAdminDogDisease(
        {
          evidenceKind: "DOG",
          diseaseCode: "epi",
          registrationNo: "FI12345/21",
          public: false,
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        code: "DISEASE_ROW_ALREADY_EXISTS",
        error: "Disease evidence already exists.",
      },
    });

    expect(findAdminDogDiseaseDuplicateDbMock).toHaveBeenCalledWith(
      {
        evidenceKind: "DOG",
        dogId: "dog-1",
        sairausId: "sairaus-epi",
        rekisterinumero: "FI12345/21",
        isaRekisterinumero: null,
        emaRekisterinumero: null,
      },
      { tx: true },
    );
    expect(createAdminDogDiseaseDbMock).not.toHaveBeenCalled();
  });

  it("rejects duplicate LITTER evidence before inserting", async () => {
    findAdminDogDiseaseDefinitionByCodeDbMock.mockResolvedValue({
      id: "sairaus-epi",
      koodi: "epi",
    });
    findAdminDiseaseDogByRegistrationNoDbMock
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: "sire-1" })
      .mockResolvedValueOnce({ id: "dam-1" });
    findAdminDogDiseaseDuplicateDbMock.mockResolvedValueOnce({
      id: "existing-row",
    });

    await expect(
      createAdminDogDisease(
        {
          evidenceKind: "LITTER",
          diseaseCode: "epi",
          registrationNo: "EPI_1/94",
          sireRegistrationNo: "SF14404/90",
          damRegistrationNo: "SF19531/89",
          public: false,
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        code: "DISEASE_ROW_ALREADY_EXISTS",
        error: "Disease evidence already exists.",
      },
    });

    expect(findAdminDogDiseaseDuplicateDbMock).toHaveBeenCalledWith(
      {
        evidenceKind: "LITTER",
        dogId: null,
        sairausId: "sairaus-epi",
        rekisterinumero: "EPI_1/94",
        isaRekisterinumero: "SF14404/90",
        emaRekisterinumero: "SF19531/89",
      },
      { tx: true },
    );
    expect(createAdminDogDiseaseDbMock).not.toHaveBeenCalled();
  });

  it("rejects DOG evidence when the dog does not resolve", async () => {
    findAdminDogDiseaseDefinitionByCodeDbMock.mockResolvedValue({
      id: "sairaus-epi",
      koodi: "epi",
    });
    findAdminDiseaseDogByRegistrationNoDbMock.mockResolvedValueOnce(null);

    await expect(
      createAdminDogDisease(
        {
          evidenceKind: "DOG",
          diseaseCode: "epi",
          registrationNo: "FI12345/21",
          public: false,
        },
        adminUser,
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        code: "DOG_NOT_FOUND",
        error: "Dog was not found.",
      },
    });
  });
});
