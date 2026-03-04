import { DogSex } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("../../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { loadDogs } from "../dog-row-loader";

describe("dogs/core/dog-row-loader", () => {
  beforeEach(() => {
    dogFindManyMock.mockReset();
  });

  it("maps rows and handles parent formatting branches", async () => {
    dogFindManyMock.mockResolvedValue([
      {
        id: "dog-1",
        ekNo: 123,
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
        name: "Alpha",
        sex: DogSex.MALE,
        birthDate: new Date("2023-01-01T00:00:00.000Z"),
        registrations: [
          { registrationNo: "FI-100/24", createdAt: new Date("2026-01-01") },
          { registrationNo: "FI-101/25", createdAt: new Date("2026-01-02") },
        ],
        sire: {
          name: "Sire Name",
          registrations: [
            { registrationNo: "FI-1/20", createdAt: new Date("2020-01-01") },
          ],
        },
        dam: {
          name: "Dam Name",
          registrations: [],
        },
        _count: {
          trialResults: 2,
          showResults: 3,
        },
      },
      {
        id: "dog-2",
        ekNo: null,
        createdAt: new Date("2026-01-03T00:00:00.000Z"),
        name: "Beta",
        sex: DogSex.FEMALE,
        birthDate: null,
        registrations: [],
        sire: {
          name: "",
          registrations: [
            { registrationNo: "FI-2/19", createdAt: new Date("2019-01-01") },
          ],
        },
        dam: {
          name: "",
          registrations: [],
        },
        _count: {
          trialResults: 0,
          showResults: 0,
        },
      },
      {
        id: "dog-3",
        ekNo: null,
        createdAt: new Date("2026-01-04T00:00:00.000Z"),
        name: "Gamma",
        sex: DogSex.UNKNOWN,
        birthDate: null,
        registrations: [
          { registrationNo: "FI-300/26", createdAt: new Date("2026-01-04") },
        ],
        sire: null,
        dam: null,
        _count: {
          trialResults: 1,
          showResults: 1,
        },
      },
    ]);

    const rows = await loadDogs({ where: {} });

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({
      id: "dog-1",
      registrationNos: ["FI-100/24", "FI-101/25"],
      primaryRegistrationNo: "FI-100/24",
      sire: "FI-1/20 Sire Name",
      dam: "Dam Name",
      trialCount: 2,
      showCount: 3,
    });
    expect(rows[1]).toMatchObject({
      primaryRegistrationNo: "-",
      sire: "FI-2/19",
      dam: "-",
    });
    expect(rows[2]).toMatchObject({
      sire: "-",
      dam: "-",
    });
  });
});
