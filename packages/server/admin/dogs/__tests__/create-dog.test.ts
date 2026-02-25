import { beforeEach, describe, expect, it, vi } from "vitest";
import { createAdminDog } from "../create-dog";

const { createAdminDogWriteDbMock, runAdminDogWriteTransactionDbMock } =
  vi.hoisted(() => ({
    createAdminDogWriteDbMock: vi.fn(),
    runAdminDogWriteTransactionDbMock: vi.fn(),
  }));

vi.mock("@beagle/db", () => ({
  createAdminDogWriteDb: createAdminDogWriteDbMock,
  runAdminDogWriteTransactionDb: runAdminDogWriteTransactionDbMock,
}));

describe("createAdminDog", () => {
  beforeEach(() => {
    createAdminDogWriteDbMock.mockReset();
    runAdminDogWriteTransactionDbMock.mockReset();
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

  it("creates dog and returns 201", async () => {
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
        ownerNames: ["Tiina Virtanen"],
        ekNo: 5588,
        note: "Important",
        registrationNo: "FI12345/21",
        sireRegistrationNo: null,
        damRegistrationNo: null,
      },
      {},
    );

    expect(runAdminDogWriteTransactionDbMock).toHaveBeenCalledWith(
      expect.any(Function),
      { intent: "CREATE_DOG" },
    );
  });

  it("returns 409 when duplicate dog exists", async () => {
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
});
