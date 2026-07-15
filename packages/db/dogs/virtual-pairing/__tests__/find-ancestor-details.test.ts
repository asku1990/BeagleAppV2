import { beforeEach, describe, expect, it, vi } from "vitest";
import { findVirtualPairingAncestorDetailsDb } from "../find-ancestor-details";

const { dogFindManyMock, prismaMock } = vi.hoisted(() => {
  const dogFindMany = vi.fn();
  return {
    dogFindManyMock: dogFindMany,
    prismaMock: {
      dog: {
        findMany: dogFindMany,
      },
    },
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: prismaMock,
}));

describe("findVirtualPairingAncestorDetailsDb", () => {
  beforeEach(() => {
    dogFindManyMock.mockReset();
  });

  it("returns an empty list without querying when there are no ids", async () => {
    await expect(findVirtualPairingAncestorDetailsDb([])).resolves.toEqual([]);
    expect(dogFindManyMock).not.toHaveBeenCalled();
  });

  it("maps ancestor details in the requested order and uses the first inserted registration", async () => {
    dogFindManyMock.mockResolvedValue([
      {
        id: "ancestor-2",
        name: "Korpelan Aatos",
        ekNo: 2002,
        status: "REFERENCE_ONLY",
        registrations: [
          {
            registrationNo: "FI22222/21",
            createdAt: new Date("2021-06-01"),
          },
        ],
      },
      {
        id: "ancestor-1",
        name: "Metsapolun Kide",
        ekNo: null,
        status: "NORMAL",
        registrations: [
          {
            registrationNo: "FI11111/20",
            createdAt: new Date("2020-02-01"),
          },
          {
            registrationNo: "FI11111/21",
            createdAt: new Date("2021-02-01"),
          },
        ],
      },
    ]);

    await expect(
      findVirtualPairingAncestorDetailsDb([
        "missing",
        "ancestor-1",
        "ancestor-2",
      ]),
    ).resolves.toEqual([
      {
        id: "ancestor-1",
        name: "Metsapolun Kide",
        ekNo: null,
        registrationNo: "FI11111/20",
        status: "NORMAL",
      },
      {
        id: "ancestor-2",
        name: "Korpelan Aatos",
        ekNo: 2002,
        registrationNo: "FI22222/21",
        status: "REFERENCE_ONLY",
      },
    ]);
  });
});
