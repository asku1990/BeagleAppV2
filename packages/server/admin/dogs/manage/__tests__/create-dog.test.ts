import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminDog } from "../create-dog";

const {
  createAdminDogWriteDbMock,
  runAdminDogWriteTransactionDbMock,
  findDogByRegistrationNoDbMock,
  loadDogPedigreeAncestryForParentsDbMock,
  linkHistoricalEntriesOnDogCreateMock,
  findAdminDogColorOptionDbMock,
} = vi.hoisted(() => ({
  createAdminDogWriteDbMock: vi.fn(),
  runAdminDogWriteTransactionDbMock: vi.fn(),
  findDogByRegistrationNoDbMock: vi.fn(),
  loadDogPedigreeAncestryForParentsDbMock: vi.fn(),
  linkHistoricalEntriesOnDogCreateMock: vi.fn(),
  findAdminDogColorOptionDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  createAdminDogWriteDb: createAdminDogWriteDbMock,
  runAdminDogWriteTransactionDb: runAdminDogWriteTransactionDbMock,
  findDogByRegistrationNoDb: findDogByRegistrationNoDbMock,
  loadDogPedigreeAncestryForParentsDb: loadDogPedigreeAncestryForParentsDbMock,
  findAdminDogColorOptionDb: findAdminDogColorOptionDbMock,
}));

vi.mock("../link-historical-entries-on-dog-create", () => ({
  linkHistoricalEntriesOnDogCreate: linkHistoricalEntriesOnDogCreateMock,
}));

function mockRequiredParentResolution(): void {
  findDogByRegistrationNoDbMock.mockImplementation(
    async (registrationNo: string) => {
      if (registrationNo === "FI11111/11") {
        return { id: "sire_1", sex: "MALE" };
      }

      if (registrationNo === "FI22222/22") {
        return { id: "dam_1", sex: "FEMALE" };
      }

      return null;
    },
  );
  loadDogPedigreeAncestryForParentsDbMock.mockResolvedValue({
    rootId: "sire_1:dam_1",
    nodes: {
      sire_1: {
        id: "sire_1",
        sireId: null,
        damId: null,
      },
      dam_1: {
        id: "dam_1",
        sireId: null,
        damId: null,
      },
    },
  });
}

describe("createAdminDog", () => {
  beforeEach(() => {
    createAdminDogWriteDbMock.mockReset();
    runAdminDogWriteTransactionDbMock.mockReset();
    findDogByRegistrationNoDbMock.mockReset();
    loadDogPedigreeAncestryForParentsDbMock.mockReset();
    linkHistoricalEntriesOnDogCreateMock.mockReset();
    findAdminDogColorOptionDbMock.mockReset();
    linkHistoricalEntriesOnDogCreateMock.mockResolvedValue({
      showLinkedCount: 0,
      trialLinkedCount: 0,
    });
    runAdminDogWriteTransactionDbMock.mockImplementation(async (callback) =>
      callback({}),
    );
  });

  it("returns 400 for empty name", async () => {
    await expect(
      createAdminDog({
        name: " ",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Name is required.",
        code: "INVALID_NAME",
      },
    });
  });

  it("returns 400 for an invalid dog status", async () => {
    await expect(
      createAdminDog({
        status: "ARCHIVED" as never,
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid dog status value.",
        code: "INVALID_DOG_STATUS",
      },
    });
  });

  it("creates a reference-only dog with registration fallback name and no parents", async () => {
    createAdminDogWriteDbMock.mockResolvedValue({
      id: "dog_ref_1",
      name: "FI12345/21",
      sex: "UNKNOWN",
      registrationNo: "FI12345/21",
    });

    await expect(
      createAdminDog({
        status: "REFERENCE_ONLY",
        name: " ",
        sex: "UNKNOWN",
        registrationNo: " fi12345/21 ",
      }),
    ).resolves.toEqual({
      status: 201,
      body: {
        ok: true,
        data: {
          id: "dog_ref_1",
          name: "FI12345/21",
          sex: "UNKNOWN",
          registrationNo: "FI12345/21",
        },
      },
    });

    expect(findDogByRegistrationNoDbMock).not.toHaveBeenCalled();
    expect(createAdminDogWriteDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "REFERENCE_ONLY",
        name: "FI12345/21",
        registrationNo: "FI12345/21",
        sireId: null,
        damId: null,
      }),
      {},
    );
  });

  it("creates a reference-only dog with an explicitly resolved sire and no dam", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue({
      id: "sire_1",
      sex: "MALE",
    });
    createAdminDogWriteDbMock.mockResolvedValue({
      id: "dog_ref_1",
      name: "Known Parent Reference",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });

    await expect(
      createAdminDog({
        status: "REFERENCE_ONLY",
        name: "Known Parent Reference",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        sireRegistrationNo: "FI11111/11",
      }),
    ).resolves.toMatchObject({ status: 201 });

    expect(findDogByRegistrationNoDbMock).toHaveBeenCalledWith("FI11111/11");
    expect(createAdminDogWriteDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "REFERENCE_ONLY",
        name: "Known Parent Reference",
        sireId: "sire_1",
        damId: null,
      }),
      {},
    );
  });

  it("returns 400 for empty registration number", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: " ",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Registration number is required.",
        code: "INVALID_REGISTRATION_NO",
      },
    });
  });

  it("returns 400 for invalid birth date", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        birthDate: "2026/01/01",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Birth date must use YYYY-MM-DD format.",
        code: "INVALID_BIRTH_DATE",
      },
    });
  });

  it("returns 400 for non-existent calendar birth date", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        birthDate: "2026-02-31",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Birth date must use YYYY-MM-DD format.",
        code: "INVALID_BIRTH_DATE",
      },
    });
  });

  it("returns 400 for invalid EK number", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        ekNo: -1,
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "EK number must be a positive integer.",
        code: "INVALID_EK_NO",
      },
    });
  });

  it("returns 400 for EK number above DB integer range", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        ekNo: 2_147_483_648,
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "EK number must be a positive integer.",
        code: "INVALID_EK_NO",
      },
    });
  });

  it("returns 400 for an invalid EK assignment date", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        ekNoAssignedOn: "2026-02-31",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "EK number assignment date must use YYYY-MM-DD format.",
        code: "INVALID_EK_NO_ASSIGNED_ON",
      },
    });
  });

  it("returns 400 when name is too long", async () => {
    await expect(
      createAdminDog({
        name: "a".repeat(121),
        sex: "FEMALE",
        registrationNo: "FI12345/21",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Name cannot exceed 120 characters.",
        code: "NAME_TOO_LONG",
      },
    });
  });

  it("creates dog and returns 201", async () => {
    mockRequiredParentResolution();
    createAdminDogWriteDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Metsapolun Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });

    await expect(
      createAdminDog({
        name: " Metsapolun Kide ",
        sex: "FEMALE",
        birthDate: "2021-04-09",
        breederNameText: " Metsapolun ",
        ownerNames: [" Tiina Virtanen "],
        ekNo: 5588,
        ekNoAssignedOn: "2024-01-15",
        note: " Important ",
        registrationNo: " FI12345/21 ",
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toEqual({
      status: 201,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Metsapolun Kide",
          sex: "FEMALE",
          registrationNo: "FI12345/21",
        },
      },
    });

    expect(createAdminDogWriteDbMock).toHaveBeenCalledWith(
      {
        status: "NORMAL",
        name: "Metsapolun Kide",
        sex: "FEMALE",
        birthDate: new Date("2021-04-09T00:00:00.000Z"),
        breederNameText: "Metsapolun",
        sireId: "sire_1",
        damId: "dam_1",
        ownerNames: ["Tiina Virtanen"],
        ekNo: 5588,
        ekNoAssignedOn: new Date("2024-01-15T00:00:00.000Z"),
        colorCode: null,
        note: "Important",
        registrationNo: "FI12345/21",
        secondaryRegistrationNos: [],
        titles: [],
      },
      {},
    );

    expect(runAdminDogWriteTransactionDbMock).toHaveBeenCalledWith(
      expect.any(Function),
      { intent: "CREATE_DOG" },
    );

    expect(linkHistoricalEntriesOnDogCreateMock).toHaveBeenCalledWith(
      {
        dogId: "dog_1",
        primaryRegistrationNo: "FI12345/21",
        secondaryRegistrationNos: [],
      },
      {},
    );
  });

  it("rejects a missing color code for a new dog", async () => {
    mockRequiredParentResolution();
    findAdminDogColorOptionDbMock.mockResolvedValue(null);

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        colorCode: 999,
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Color code was not found.",
        code: "COLOR_CODE_NOT_FOUND",
      },
    });

    expect(createAdminDogWriteDbMock).not.toHaveBeenCalled();
  });

  it("rejects a hidden color for a new dog", async () => {
    mockRequiredParentResolution();
    findAdminDogColorOptionDbMock.mockResolvedValue({
      code: 112,
      status: "HIDDEN",
    });

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        colorCode: 112,
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toMatchObject({
      status: 400,
      body: {
        ok: false,
        error: "Color code is hidden and cannot be selected.",
        code: "COLOR_CODE_HIDDEN",
      },
    });

    expect(createAdminDogWriteDbMock).not.toHaveBeenCalled();
  });

  it("rejects a legacy unknown color for a new dog", async () => {
    mockRequiredParentResolution();
    findAdminDogColorOptionDbMock.mockResolvedValue({
      code: 493,
      status: "LEGACY_UNKNOWN",
    });

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        colorCode: 493,
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toMatchObject({
      status: 400,
      body: {
        ok: false,
        error: "Color code is a legacy unknown value and cannot be selected.",
        code: "COLOR_CODE_LEGACY_UNKNOWN",
      },
    });

    expect(createAdminDogWriteDbMock).not.toHaveBeenCalled();
  });

  it("returns an internal error if historical linking fails after dog creation", async () => {
    mockRequiredParentResolution();
    createAdminDogWriteDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Metsapolun Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });
    linkHistoricalEntriesOnDogCreateMock.mockRejectedValueOnce(
      new Error("link failed"),
    );

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to create dog.",
        code: "INTERNAL_ERROR",
      },
    });

    expect(createAdminDogWriteDbMock).toHaveBeenCalledTimes(1);
    expect(linkHistoricalEntriesOnDogCreateMock).toHaveBeenCalledTimes(1);
    expect(runAdminDogWriteTransactionDbMock).toHaveBeenCalledTimes(1);
  });

  it("creates dog without persisting any inbreeding field", async () => {
    findDogByRegistrationNoDbMock.mockImplementation(
      async (registrationNo: string) => {
        if (registrationNo === "FI11111/11") {
          return { id: "sire_1", sex: "MALE" };
        }

        if (registrationNo === "FI22222/22") {
          return { id: "dam_1", sex: "FEMALE" };
        }

        return null;
      },
    );
    createAdminDogWriteDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Metsapolun Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toMatchObject({ status: 201 });

    expect(createAdminDogWriteDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sireId: "sire_1",
        damId: "dam_1",
      }),
      {},
    );
  });

  it("returns 409 when duplicate dog exists", async () => {
    mockRequiredParentResolution();
    createAdminDogWriteDbMock.mockRejectedValue({ code: "P2002" });

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toEqual({
      status: 409,
      body: {
        ok: false,
        error: "Dog with same EK number or registration number already exists.",
        code: "DUPLICATE_DOG",
      },
    });
  });

  it("returns 400 when sire registration is unknown", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue(null);

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        sireRegistrationNo: "FI00000/00",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Sire registration number was not found.",
        code: "INVALID_SIRE_REGISTRATION",
      },
    });
  });

  it("returns 400 when sire registration is missing", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Sire registration number is required.",
        code: "REQUIRED_SIRE_REGISTRATION",
      },
    });
  });

  it("returns 400 when dam registration is missing", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        sireRegistrationNo: "FI11111/11",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Dam registration number is required.",
        code: "REQUIRED_DAM_REGISTRATION",
      },
    });
  });

  it("returns 400 when registration number is too long", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue(null);

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "R".repeat(41),
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Registration number cannot exceed 40 characters.",
        code: "REGISTRATION_NO_TOO_LONG",
      },
    });
  });

  it("returns 400 for duplicate registration numbers in payload", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        secondaryRegistrationNos: [" FI12345/21 "],
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Registration numbers must be unique.",
        code: "DUPLICATE_REGISTRATION_NO",
      },
    });
  });

  it("returns 400 when note is too long", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue(null);

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        note: "n".repeat(501),
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Note cannot exceed 500 characters.",
        code: "NOTE_TOO_LONG",
      },
    });
  });

  it("returns 400 when sire and dam are the same dog", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue({
      id: "dog_parent_1",
      sex: "MALE",
    });

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Sire and dam must be different dogs.",
        code: "INVALID_PARENT_COMBINATION",
      },
    });
  });

  it("returns 400 for duplicate normalized dog titles", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        titles: [
          {
            titleCode: " fi jva ",
            awardedOn: "2022-01-10",
            sortOrder: 0,
          },
          {
            titleCode: "FI JVA",
            awardedOn: "2022-01-10",
            sortOrder: 1,
          },
        ],
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Duplicate dog titles are not allowed.",
        code: "DUPLICATE_DOG_TITLE",
      },
    });
  });

  it("returns 400 for invalid dog title awarded date", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        titles: [
          {
            titleCode: "FI JVA",
            awardedOn: "2022/01/10",
            sortOrder: 0,
          },
        ],
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Title awarded date must use YYYY-MM-DD format.",
        code: "INVALID_TITLE_AWARDED_ON",
      },
    });
  });

  it("creates dog with many titles and nullable title fields", async () => {
    mockRequiredParentResolution();
    createAdminDogWriteDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Metsapolun Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
        titles: [
          {
            titleCode: " fi jva ",
            awardedOn: null,
            titleName: null,
            sortOrder: 0,
          },
          {
            titleCode: "se jch",
            awardedOn: "2021-05-06",
            titleName: " Champion ",
            sortOrder: 1,
          },
        ],
      }),
    ).resolves.toEqual({
      status: 201,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Metsapolun Kide",
          sex: "FEMALE",
          registrationNo: "FI12345/21",
        },
      },
    });

    expect(createAdminDogWriteDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: [
          {
            titleCode: "FI JVA",
            awardedOn: null,
            titleName: null,
            sortOrder: 0,
          },
          {
            titleCode: "SE JCH",
            awardedOn: new Date("2021-05-06T00:00:00.000Z"),
            titleName: "Champion",
            sortOrder: 1,
          },
        ],
      }),
      {},
    );
  });

  it("returns 400 for duplicate normalized dog titles when date is null", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        titles: [
          {
            titleCode: " fi jva ",
            awardedOn: null,
            sortOrder: 0,
          },
          {
            titleCode: "FI JVA",
            awardedOn: null,
            sortOrder: 1,
          },
        ],
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Duplicate dog titles are not allowed.",
        code: "DUPLICATE_DOG_TITLE",
      },
    });
  });

  it("derives title sortOrder from row order when omitted", async () => {
    mockRequiredParentResolution();
    createAdminDogWriteDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Metsapolun Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
        sireRegistrationNo: "FI11111/11",
        damRegistrationNo: "FI22222/22",
        titles: [
          {
            titleCode: "FI JVA",
            awardedOn: "2022-01-10",
          },
          {
            titleCode: "SE JCH",
            awardedOn: null,
          },
        ],
      }),
    ).resolves.toEqual({
      status: 201,
      body: {
        ok: true,
        data: {
          id: "dog_1",
          name: "Metsapolun Kide",
          sex: "FEMALE",
          registrationNo: "FI12345/21",
        },
      },
    });

    expect(createAdminDogWriteDbMock).toHaveBeenCalledWith(
      expect.objectContaining({
        titles: [
          expect.objectContaining({
            titleCode: "FI JVA",
            sortOrder: 0,
          }),
          expect.objectContaining({
            titleCode: "SE JCH",
            sortOrder: 1,
          }),
        ],
      }),
      {},
    );
  });
});
