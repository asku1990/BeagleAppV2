import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminDog } from "../create-dog";

const {
  createAdminDogWriteDbMock,
  runAdminDogWriteTransactionDbMock,
  findDogByRegistrationNoDbMock,
} = vi.hoisted(() => ({
  createAdminDogWriteDbMock: vi.fn(),
  runAdminDogWriteTransactionDbMock: vi.fn(),
  findDogByRegistrationNoDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  createAdminDogWriteDb: createAdminDogWriteDbMock,
  runAdminDogWriteTransactionDb: runAdminDogWriteTransactionDbMock,
  findDogByRegistrationNoDb: findDogByRegistrationNoDbMock,
}));

describe("createAdminDog", () => {
  beforeEach(() => {
    createAdminDogWriteDbMock.mockReset();
    runAdminDogWriteTransactionDbMock.mockReset();
    findDogByRegistrationNoDbMock.mockReset();
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
    findDogByRegistrationNoDbMock.mockResolvedValue(null);
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
        note: " Important ",
        registrationNo: " FI12345/21 ",
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
        name: "Metsapolun Kide",
        sex: "FEMALE",
        birthDate: new Date("2021-04-09T00:00:00.000Z"),
        breederNameText: "Metsapolun",
        sireId: null,
        damId: null,
        ownerNames: ["Tiina Virtanen"],
        ekNo: 5588,
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
  });

  it("returns 409 when duplicate dog exists", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue(null);
    createAdminDogWriteDbMock.mockRejectedValue({ code: "P2002" });

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
        registrationNo: "FI12345/21",
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
    findDogByRegistrationNoDbMock.mockResolvedValue(null);
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
    findDogByRegistrationNoDbMock.mockResolvedValue(null);
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
