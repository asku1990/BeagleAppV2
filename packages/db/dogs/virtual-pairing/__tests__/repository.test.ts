import { DogSex } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchVirtualPairingDogsDb } from "../repository";

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

function makeRow(input: {
  id: string;
  name: string;
  ekNo?: number | null;
  sex?: DogSex;
  registrations: Array<{ registrationNo: string; createdAt: Date }>;
}) {
  return {
    id: input.id,
    ekNo: input.ekNo ?? null,
    name: input.name,
    sex: input.sex ?? DogSex.MALE,
    registrations: input.registrations,
  };
}

describe("searchVirtualPairingDogsDb", () => {
  beforeEach(() => {
    dogFindManyMock.mockReset();
  });

  it("returns an empty result without querying when the search string is blank", async () => {
    const result = await searchVirtualPairingDogsDb({
      field: "name",
      query: "   ",
      page: 3,
      pageSize: 10,
    });

    expect(result).toEqual({
      field: "name",
      query: "",
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    });
    expect(dogFindManyMock).not.toHaveBeenCalled();
  });

  it("filters by wildcard name and returns public-safe dog options", async () => {
    dogFindManyMock.mockResolvedValue([
      makeRow({
        id: "dog_1",
        name: "Metsapolun Kide",
        ekNo: 5588,
        sex: DogSex.FEMALE,
        registrations: [
          { registrationNo: "FI12345/21", createdAt: new Date("2021-04-09") },
        ],
      }),
      makeRow({
        id: "dog_2",
        name: "Aurinkopolun Aatos",
        ekNo: 5599,
        sex: DogSex.MALE,
        registrations: [
          { registrationNo: "FI54321/20", createdAt: new Date("2020-03-01") },
        ],
      }),
    ]);

    const result = await searchVirtualPairingDogsDb({
      field: "name",
      query: "%kide%",
      page: 1,
      pageSize: 10,
    });

    expect(result.total).toBe(1);
    expect(result.items).toEqual([
      {
        id: "dog_1",
        ekNo: 5588,
        registrationNo: "FI12345/21",
        name: "Metsapolun Kide",
        sex: "N",
      },
    ]);
    expect(
      JSON.stringify(dogFindManyMock.mock.calls[0]?.[0].select),
    ).not.toContain("ownership");
  });

  it("searches by exact registration number and sorts by registration", async () => {
    dogFindManyMock.mockResolvedValue([
      makeRow({
        id: "dog_2",
        name: "Aurinkopolun Aatos",
        ekNo: 5599,
        registrations: [
          { registrationNo: "fi54321/20", createdAt: new Date("2020-03-01") },
        ],
      }),
      makeRow({
        id: "dog_1",
        name: "Metsapolun Kide",
        ekNo: 5588,
        sex: DogSex.FEMALE,
        registrations: [
          { registrationNo: "FI12345/21", createdAt: new Date("2021-04-09") },
        ],
      }),
    ]);

    const result = await searchVirtualPairingDogsDb({
      field: "reg",
      query: "fi12345/21",
      page: 1,
      pageSize: 10,
    });

    expect(dogFindManyMock.mock.calls[0]?.[0].where).toEqual({
      registrations: {
        some: {
          registrationNo: {
            equals: "FI12345/21",
            mode: "insensitive",
          },
        },
      },
    });
    expect(result.items).toEqual([
      {
        id: "dog_1",
        ekNo: 5588,
        registrationNo: "FI12345/21",
        name: "Metsapolun Kide",
        sex: "N",
      },
    ]);
  });

  it("searches by wildcard ek number and sorts by ek", async () => {
    dogFindManyMock.mockResolvedValue([
      makeRow({
        id: "dog_2",
        name: "Dog 5599",
        ekNo: 5599,
        registrations: [
          { registrationNo: "FI54321/20", createdAt: new Date("2020-03-01") },
        ],
      }),
      makeRow({
        id: "dog_1",
        name: "Dog 5588",
        ekNo: 5588,
        registrations: [
          { registrationNo: "FI12345/21", createdAt: new Date("2021-04-09") },
        ],
      }),
      makeRow({
        id: "dog_3",
        name: "Dog no ek",
        ekNo: null,
        registrations: [
          { registrationNo: "FI99999/22", createdAt: new Date("2022-01-01") },
        ],
      }),
    ]);

    const result = await searchVirtualPairingDogsDb({
      field: "ek",
      query: "55%",
      page: 1,
      pageSize: 10,
    });

    expect(dogFindManyMock.mock.calls[0]?.[0].where).toEqual({
      ekNo: { not: null },
    });
    expect(result.total).toBe(2);
    expect(result.items.map((item) => item.ekNo)).toEqual([5588, 5599]);
  });

  it("rejects nonnumeric ek queries before matching", async () => {
    dogFindManyMock.mockResolvedValue([]);

    const result = await searchVirtualPairingDogsDb({
      field: "ek",
      query: "not-a-number",
      page: 1,
      pageSize: 10,
    });

    expect(dogFindManyMock.mock.calls[0]?.[0].where).toEqual({
      id: "__no_match__",
    });
    expect(result).toEqual({
      field: "ek",
      query: "not-a-number",
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    });
  });

  it("pages and clamps wildcard registration queries", async () => {
    dogFindManyMock.mockResolvedValue(
      Array.from({ length: 12 }, (_, index) =>
        makeRow({
          id: `dog_${index + 1}`,
          name: `Dog ${index + 1}`,
          registrations: [
            {
              registrationNo: `FI${10000 + index}/24`,
              createdAt: new Date("2024-01-01"),
            },
          ],
        }),
      ),
    );

    const result = await searchVirtualPairingDogsDb({
      field: "reg",
      query: "FI%",
      page: 99,
      pageSize: 100,
    });

    expect(result.total).toBe(12);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.items).toHaveLength(12);
  });

  it("rejects wildcard-only registration and name queries", async () => {
    dogFindManyMock.mockResolvedValue([]);

    const regResult = await searchVirtualPairingDogsDb({
      field: "reg",
      query: "%%%",
      page: 1,
      pageSize: 10,
    });
    const nameResult = await searchVirtualPairingDogsDb({
      field: "name",
      query: "___",
      page: 1,
      pageSize: 10,
    });

    expect(dogFindManyMock.mock.calls[0]?.[0].where).toEqual({
      id: "__no_match__",
    });
    expect(dogFindManyMock.mock.calls[1]?.[0].where).toEqual({
      id: "__no_match__",
    });
    expect(regResult.total).toBe(0);
    expect(nameResult.total).toBe(0);
  });
});
