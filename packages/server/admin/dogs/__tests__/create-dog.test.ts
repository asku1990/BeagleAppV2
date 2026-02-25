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
    await expect(createAdminDog({ name: " ", sex: "FEMALE" })).resolves.toEqual(
      {
        status: 400,
        body: {
          ok: false,
          error: "Name is required.",
          code: "INVALID_NAME",
        },
      },
    );
  });

  it("returns 400 for invalid birth date", async () => {
    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
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

  it("returns 400 for invalid EK number", async () => {
    await expect(
      createAdminDog({ name: "Metsapolun Kide", sex: "FEMALE", ekNo: -1 }),
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
      createAdminDog({ name: "a".repeat(121), sex: "FEMALE" }),
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
      createAdminDog({ name: "Metsapolun Kide", sex: "FEMALE" }),
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

  it("returns 400 when note is too long", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue(null);

    await expect(
      createAdminDog({
        name: "Metsapolun Kide",
        sex: "FEMALE",
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
});
