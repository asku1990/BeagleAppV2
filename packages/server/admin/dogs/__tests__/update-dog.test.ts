import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminDog } from "../update-dog";

const {
  updateAdminDogWriteDbMock,
  runAdminDogWriteTransactionDbMock,
  findDogByRegistrationNoDbMock,
} = vi.hoisted(() => ({
  updateAdminDogWriteDbMock: vi.fn(),
  runAdminDogWriteTransactionDbMock: vi.fn(),
  findDogByRegistrationNoDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  updateAdminDogWriteDb: updateAdminDogWriteDbMock,
  runAdminDogWriteTransactionDb: runAdminDogWriteTransactionDbMock,
  findDogByRegistrationNoDb: findDogByRegistrationNoDbMock,
}));

describe("updateAdminDog", () => {
  beforeEach(() => {
    updateAdminDogWriteDbMock.mockReset();
    runAdminDogWriteTransactionDbMock.mockReset();
    findDogByRegistrationNoDbMock.mockReset();
    runAdminDogWriteTransactionDbMock.mockImplementation(async (callback) =>
      callback({}),
    );
  });

  it("returns 400 for invalid id", async () => {
    await expect(
      updateAdminDog({ id: " ", name: "Metsapolun Kide", sex: "FEMALE" }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Dog id is required.",
        code: "INVALID_DOG_ID",
      },
    });
  });

  it("returns 400 for invalid birth date", async () => {
    await expect(
      updateAdminDog({
        id: "dog_1",
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

  it("returns 400 for non-existent calendar birth date", async () => {
    await expect(
      updateAdminDog({
        id: "dog_1",
        name: "Metsapolun Kide",
        sex: "FEMALE",
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
      updateAdminDog({
        id: "dog_1",
        name: "Metsapolun Kide",
        sex: "FEMALE",
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
      updateAdminDog({
        id: "dog_1",
        name: "Metsapolun Kide",
        sex: "FEMALE",
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
      updateAdminDog({
        id: "dog_1",
        name: "a".repeat(121),
        sex: "FEMALE",
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

  it("updates dog and returns 200", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue(null);
    updateAdminDogWriteDbMock.mockResolvedValue({
      id: "dog_1",
      name: "Metsapolun Kide",
      sex: "FEMALE",
      registrationNo: "FI12345/21",
    });

    await expect(
      updateAdminDog({
        id: " dog_1 ",
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
      status: 200,
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

    expect(updateAdminDogWriteDbMock).toHaveBeenCalledWith(
      {
        id: "dog_1",
        name: "Metsapolun Kide",
        sex: "FEMALE",
        birthDate: new Date("2021-04-09T00:00:00.000Z"),
        breederNameText: "Metsapolun",
        sireId: undefined,
        damId: undefined,
        ownerNames: ["Tiina Virtanen"],
        ekNo: 5588,
        note: "Important",
        registrationNo: "FI12345/21",
      },
      {},
    );
  });

  it("returns 404 when dog is not found", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue(null);
    updateAdminDogWriteDbMock.mockRejectedValue(new Error("DOG_NOT_FOUND"));

    await expect(
      updateAdminDog({ id: "dog_1", name: "Metsapolun Kide", sex: "FEMALE" }),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "Dog not found.",
        code: "DOG_NOT_FOUND",
      },
    });
  });

  it("returns 409 for duplicate dog", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue(null);
    updateAdminDogWriteDbMock.mockRejectedValue({ code: "P2002" });

    await expect(
      updateAdminDog({ id: "dog_1", name: "Metsapolun Kide", sex: "FEMALE" }),
    ).resolves.toEqual({
      status: 409,
      body: {
        ok: false,
        error: "Dog with same EK number or registration number already exists.",
        code: "DUPLICATE_DOG",
      },
    });
  });

  it("returns 400 when parent resolves to same dog", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue({
      id: "dog_1",
      sex: "MALE",
    });

    await expect(
      updateAdminDog({
        id: "dog_1",
        name: "Metsapolun Kide",
        sex: "FEMALE",
        sireRegistrationNo: "FI11111/11",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Dog cannot be its own sire.",
        code: "INVALID_SELF_PARENT",
      },
    });
  });

  it("returns 400 when sire has invalid sex", async () => {
    findDogByRegistrationNoDbMock.mockResolvedValue({
      id: "dog_parent",
      sex: "FEMALE",
    });

    await expect(
      updateAdminDog({
        id: "dog_1",
        name: "Metsapolun Kide",
        sex: "FEMALE",
        sireRegistrationNo: "FI11111/11",
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Selected sire must be a male dog.",
        code: "INVALID_SIRE_SEX",
      },
    });
  });

  it("returns 400 when registration number is too long", async () => {
    await expect(
      updateAdminDog({
        id: "dog_1",
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
    await expect(
      updateAdminDog({
        id: "dog_1",
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
});
