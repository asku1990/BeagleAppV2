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

  it("pages and clamps the request boundaries", async () => {
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
});
