import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminDogDisease } from "../delete-dog-disease";

const {
  deleteAdminDogDiseaseDbMock,
  runAdminDogDiseaseWriteTransactionDbMock,
} = vi.hoisted(() => ({
  deleteAdminDogDiseaseDbMock: vi.fn(),
  runAdminDogDiseaseWriteTransactionDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  deleteAdminDogDiseaseDb: deleteAdminDogDiseaseDbMock,
  runAdminDogDiseaseWriteTransactionDb:
    runAdminDogDiseaseWriteTransactionDbMock,
}));

const adminUser = {
  id: "u_1",
  email: "admin@example.test",
  username: "admin",
  role: "ADMIN" as const,
};

describe("deleteAdminDogDisease", () => {
  beforeEach(() => {
    deleteAdminDogDiseaseDbMock.mockReset();
    runAdminDogDiseaseWriteTransactionDbMock.mockReset();
    runAdminDogDiseaseWriteTransactionDbMock.mockImplementation(
      async (callback) => callback({ tx: true }),
    );
  });

  it("deletes a disease row inside an audit transaction", async () => {
    deleteAdminDogDiseaseDbMock.mockResolvedValue({
      status: "deleted",
      diseaseId: "row-1",
    });

    await expect(
      deleteAdminDogDisease({ id: " row-1 " }, adminUser, {
        actorUserId: "u_1",
        source: "WEB",
      }),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          deletedDiseaseId: "row-1",
        },
      },
    });

    expect(deleteAdminDogDiseaseDbMock).toHaveBeenCalledWith("row-1", {
      tx: true,
    });
    expect(runAdminDogDiseaseWriteTransactionDbMock).toHaveBeenCalledWith(
      expect.any(Function),
      {
        actorUserId: "u_1",
        source: "WEB",
        intent: "DELETE_DOG_DISEASE",
      },
    );
  });

  it("rejects a blank disease row id", async () => {
    await expect(
      deleteAdminDogDisease({ id: " " }, adminUser),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Disease row id is required.",
        code: "INVALID_DISEASE_ROW_ID",
      },
    });

    expect(deleteAdminDogDiseaseDbMock).not.toHaveBeenCalled();
  });

  it("rejects non-admin users before validating the id", async () => {
    await expect(
      deleteAdminDogDisease(
        { id: " " },
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

    expect(deleteAdminDogDiseaseDbMock).not.toHaveBeenCalled();
    expect(runAdminDogDiseaseWriteTransactionDbMock).not.toHaveBeenCalled();
  });

  it("returns not found when the disease row does not exist", async () => {
    deleteAdminDogDiseaseDbMock.mockResolvedValue({ status: "not_found" });

    await expect(
      deleteAdminDogDisease({ id: "missing" }, adminUser),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "Disease row was not found.",
        code: "DISEASE_ROW_NOT_FOUND",
      },
    });
  });
});
