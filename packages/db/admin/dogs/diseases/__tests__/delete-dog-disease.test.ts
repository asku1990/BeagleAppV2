import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminDogDiseaseDb } from "../delete-dog-disease";

const { koiranSairausDeleteManyMock, prismaMock } = vi.hoisted(() => {
  const koiranSairausDeleteMany = vi.fn();

  return {
    koiranSairausDeleteManyMock: koiranSairausDeleteMany,
    prismaMock: {
      koiranSairaus: {
        deleteMany: koiranSairausDeleteMany,
      },
    },
  };
});

vi.mock("../../../../core/prisma", () => ({
  prisma: prismaMock,
}));

describe("deleteAdminDogDiseaseDb", () => {
  beforeEach(() => {
    koiranSairausDeleteManyMock.mockReset();
  });

  it("deletes a disease row by id", async () => {
    koiranSairausDeleteManyMock.mockResolvedValue({ count: 1 });

    await expect(deleteAdminDogDiseaseDb("disease-1")).resolves.toEqual({
      status: "deleted",
      diseaseId: "disease-1",
    });

    expect(koiranSairausDeleteManyMock).toHaveBeenCalledWith({
      where: { id: "disease-1" },
    });
  });

  it("returns not found when no row is deleted", async () => {
    koiranSairausDeleteManyMock.mockResolvedValue({ count: 0 });

    await expect(deleteAdminDogDiseaseDb("missing")).resolves.toEqual({
      status: "not_found",
    });
  });
});
