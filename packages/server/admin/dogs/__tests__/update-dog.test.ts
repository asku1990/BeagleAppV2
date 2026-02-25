import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminDog } from "../update-dog";

const { updateAdminDogWriteDbMock, runAdminDogWriteTransactionDbMock } =
  vi.hoisted(() => ({
    updateAdminDogWriteDbMock: vi.fn(),
    runAdminDogWriteTransactionDbMock: vi.fn(),
  }));

vi.mock("@beagle/db", () => ({
  updateAdminDogWriteDb: updateAdminDogWriteDbMock,
  runAdminDogWriteTransactionDb: runAdminDogWriteTransactionDbMock,
}));

describe("updateAdminDog", () => {
  beforeEach(() => {
    updateAdminDogWriteDbMock.mockReset();
    runAdminDogWriteTransactionDbMock.mockReset();
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

  it("updates dog and returns 200", async () => {
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
        ownerNames: ["Tiina Virtanen"],
        ekNo: 5588,
        note: "Important",
        registrationNo: "FI12345/21",
        sireRegistrationNo: null,
        damRegistrationNo: null,
      },
      {},
    );
  });

  it("returns 404 when dog is not found", async () => {
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
});
