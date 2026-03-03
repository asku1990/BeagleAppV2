import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminDog } from "../delete-dog";

const { deleteAdminDogWriteDbMock, runAdminDogWriteTransactionDbMock } =
  vi.hoisted(() => ({
    deleteAdminDogWriteDbMock: vi.fn(),
    runAdminDogWriteTransactionDbMock: vi.fn(),
  }));

vi.mock("@beagle/db", () => ({
  deleteAdminDogWriteDb: deleteAdminDogWriteDbMock,
  runAdminDogWriteTransactionDb: runAdminDogWriteTransactionDbMock,
}));

describe("deleteAdminDog", () => {
  beforeEach(() => {
    deleteAdminDogWriteDbMock.mockReset();
    runAdminDogWriteTransactionDbMock.mockReset();
    runAdminDogWriteTransactionDbMock.mockImplementation(async (callback) =>
      callback({}),
    );
  });

  it("returns 400 for invalid dog id", async () => {
    await expect(deleteAdminDog({ id: " " })).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Dog id is required.",
        code: "INVALID_DOG_ID",
      },
    });
  });

  it("returns 404 when dog is not found", async () => {
    deleteAdminDogWriteDbMock.mockResolvedValue(false);

    await expect(deleteAdminDog({ id: "dog_1" })).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "Dog not found.",
        code: "DOG_NOT_FOUND",
      },
    });
  });

  it("returns 200 when dog is deleted", async () => {
    deleteAdminDogWriteDbMock.mockResolvedValue(true);

    await expect(deleteAdminDog({ id: " dog_1 " })).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          deletedDogId: "dog_1",
        },
      },
    });

    expect(deleteAdminDogWriteDbMock).toHaveBeenCalledWith("dog_1", {});
  });

  it("returns 500 when delete throws", async () => {
    deleteAdminDogWriteDbMock.mockRejectedValue(new Error("boom"));

    await expect(deleteAdminDog({ id: "dog_1" })).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to delete dog.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
