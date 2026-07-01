import { beforeEach, describe, expect, it, vi } from "vitest";

const { dogFindUniqueMock, prismaMock } = vi.hoisted(() => {
  const dogFindUnique = vi.fn();

  return {
    dogFindUniqueMock: dogFindUnique,
    prismaMock: {
      dog: {
        findUnique: dogFindUnique,
      },
    },
  };
});

vi.mock("../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { getBeagleDogProfileIdentityDb } from "../get-beagle-dog-profile-identity";

describe("getBeagleDogProfileIdentityDb", () => {
  beforeEach(() => {
    dogFindUniqueMock.mockReset();
  });

  it("returns null when dog is not found", async () => {
    dogFindUniqueMock.mockResolvedValue(null);

    const result = await getBeagleDogProfileIdentityDb("missing-id");

    expect(result).toBeNull();
    expect(dogFindUniqueMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "missing-id" },
      }),
    );
  });

  it("returns only identity fields and primary registration number", async () => {
    dogFindUniqueMock.mockResolvedValue({
      id: "dog-1",
      name: "Test Dog",
      registrations: [
        { registrationNo: "REG-1", createdAt: new Date("2020-01-01") },
        { registrationNo: "REG-2", createdAt: new Date("2021-01-01") },
      ],
    });

    const result = await getBeagleDogProfileIdentityDb("dog-1");
    const queryArgs = dogFindUniqueMock.mock.calls[0]?.[0] as {
      select: Record<string, unknown>;
    };

    expect(result).toEqual({
      id: "dog-1",
      name: "Test Dog",
      registrationNo: "REG-1",
    });
    expect(queryArgs.select).toEqual({
      id: true,
      name: true,
      registrations: {
        select: {
          registrationNo: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      },
    });
  });
});
