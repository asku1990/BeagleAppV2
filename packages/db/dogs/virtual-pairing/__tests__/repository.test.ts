import { DogSex } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchVirtualPairingDogsDb } from "../repository";

const { dogCountMock, dogFindManyMock, prismaMock } = vi.hoisted(() => {
  const dogCount = vi.fn();
  const dogFindMany = vi.fn();
  return {
    dogCountMock: dogCount,
    dogFindManyMock: dogFindMany,
    prismaMock: {
      dog: {
        count: dogCount,
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
  trialCount?: number;
  showCount?: number;
}) {
  return {
    id: input.id,
    ekNo: input.ekNo ?? null,
    name: input.name,
    sex: input.sex ?? DogSex.MALE,
    registrations: input.registrations,
    _count: {
      trialEntries: input.trialCount ?? 0,
      showEntries: input.showCount ?? 0,
    },
  };
}

function expectDefaultMetadata(result: {
  isLimited: boolean;
  candidateLimit: number | null;
}) {
  expect(result.isLimited).toBe(false);
  expect(result.candidateLimit).toBeNull();
}

describe("searchVirtualPairingDogsDb", () => {
  beforeEach(() => {
    dogCountMock.mockReset();
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
      isLimited: false,
      candidateLimit: null,
      items: [],
    });
    expect(dogCountMock).not.toHaveBeenCalled();
    expect(dogFindManyMock).not.toHaveBeenCalled();
  });

  it("uses DB-side count, skip, take, and ordering for plain name search", async () => {
    dogCountMock.mockResolvedValue(12);
    dogFindManyMock.mockResolvedValue(
      Array.from({ length: 5 }, (_, index) =>
        makeRow({
          id: `dog_${index + 1}`,
          name: `Metsapolun Kide ${index + 1}`,
          ekNo: 5580 + index,
          sex: index % 2 === 0 ? DogSex.FEMALE : DogSex.MALE,
          registrations: [
            {
              registrationNo: `FI12${index}45/21`,
              createdAt: new Date("2021-04-09"),
            },
          ],
        }),
      ),
    );

    const result = await searchVirtualPairingDogsDb({
      field: "name",
      query: "kide",
      page: 2,
      pageSize: 5,
    });

    expect(dogCountMock).toHaveBeenCalledWith({
      where: {
        name: {
          contains: "kide",
          mode: "insensitive",
        },
      },
    });
    expect(dogFindManyMock).toHaveBeenCalledWith({
      where: {
        name: {
          contains: "kide",
          mode: "insensitive",
        },
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: 5,
      take: 5,
      select: {
        id: true,
        ekNo: true,
        name: true,
        sex: true,
        _count: {
          select: {
            trialEntries: true,
            showEntries: true,
          },
        },
        registrations: {
          select: {
            registrationNo: true,
            createdAt: true,
          },
        },
      },
    });
    expect(result.total).toBe(12);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
    expectDefaultMetadata(result);
  });

  it("uses DB-side count and paging for exact registration search", async () => {
    dogCountMock.mockResolvedValue(1);
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
    ]);

    const result = await searchVirtualPairingDogsDb({
      field: "reg",
      query: "fi12345/21",
      page: 1,
      pageSize: 10,
    });

    expect(dogCountMock).toHaveBeenCalledWith({
      where: {
        registrations: {
          some: {
            registrationNo: {
              equals: "FI12345/21",
              mode: "insensitive",
            },
          },
        },
      },
    });
    expect(dogFindManyMock).toHaveBeenCalledWith({
      where: {
        registrations: {
          some: {
            registrationNo: {
              equals: "FI12345/21",
              mode: "insensitive",
            },
          },
        },
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: 0,
      take: 10,
      select: {
        id: true,
        ekNo: true,
        name: true,
        sex: true,
        _count: {
          select: {
            trialEntries: true,
            showEntries: true,
          },
        },
        registrations: {
          select: {
            registrationNo: true,
            createdAt: true,
          },
        },
      },
    });
    expect(result).toEqual({
      field: "reg",
      query: "fi12345/21",
      total: 1,
      totalPages: 1,
      page: 1,
      isLimited: false,
      candidateLimit: null,
      items: [
        {
          id: "dog_1",
          ekNo: 5588,
          registrationNo: "FI12345/21",
          name: "Metsapolun Kide",
          sex: "N",
          trialCount: 0,
          showCount: 0,
        },
      ],
    });
  });

  it("uses DB-side count and paging for exact ek search", async () => {
    dogCountMock.mockResolvedValue(1);
    dogFindManyMock.mockResolvedValue([
      makeRow({
        id: "dog_1",
        name: "Dog 5588",
        ekNo: 5588,
        registrations: [
          { registrationNo: "FI12345/21", createdAt: new Date("2021-04-09") },
        ],
      }),
    ]);

    const result = await searchVirtualPairingDogsDb({
      field: "ek",
      query: "5588",
      page: 1,
      pageSize: 10,
    });

    expect(dogCountMock).toHaveBeenCalledWith({
      where: {
        ekNo: 5588,
      },
    });
    expect(dogFindManyMock).toHaveBeenCalledWith({
      where: {
        ekNo: 5588,
      },
      orderBy: [{ ekNo: "asc" }, { name: "asc" }, { id: "asc" }],
      skip: 0,
      take: 10,
      select: {
        id: true,
        ekNo: true,
        name: true,
        sex: true,
        _count: {
          select: {
            trialEntries: true,
            showEntries: true,
          },
        },
        registrations: {
          select: {
            registrationNo: true,
            createdAt: true,
          },
        },
      },
    });
    expect(result).toEqual({
      field: "ek",
      query: "5588",
      total: 1,
      totalPages: 1,
      page: 1,
      isLimited: false,
      candidateLimit: null,
      items: [
        {
          id: "dog_1",
          ekNo: 5588,
          registrationNo: "FI12345/21",
          name: "Dog 5588",
          sex: "U",
          trialCount: 0,
          showCount: 0,
        },
      ],
    });
  });

  it("caps broad wildcard name searches and drops the sentinel row before filtering", async () => {
    dogFindManyMock.mockResolvedValue([
      ...Array.from({ length: 1000 }, (_, index) =>
        makeRow({
          id: `dog_${index + 1}`,
          name: `Dog ${String(index + 1).padStart(4, "0")}`,
          ekNo: 5000 + index,
          sex: index % 2 === 0 ? DogSex.FEMALE : DogSex.MALE,
          registrations: [
            {
              registrationNo: `FI${10000 + index}/24`,
              createdAt: new Date("2024-01-01"),
            },
          ],
        }),
      ),
      makeRow({
        id: "dog_1001",
        name: "Sentinel Kide",
        ekNo: 6999,
        sex: DogSex.FEMALE,
        registrations: [
          { registrationNo: "FI99999/24", createdAt: new Date("2024-01-01") },
        ],
      }),
    ]);

    const result = await searchVirtualPairingDogsDb({
      field: "name",
      query: "%sentinel%",
      page: 1,
      pageSize: 10,
    });

    expect(dogCountMock).not.toHaveBeenCalled();
    expect(dogFindManyMock).toHaveBeenCalledWith({
      where: {
        name: {
          contains: "sentinel",
          mode: "insensitive",
        },
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: 1001,
      select: {
        id: true,
        ekNo: true,
        name: true,
        sex: true,
        _count: {
          select: {
            trialEntries: true,
            showEntries: true,
          },
        },
        registrations: {
          select: {
            registrationNo: true,
            createdAt: true,
          },
        },
      },
    });
    expect(result).toEqual({
      field: "name",
      query: "%sentinel%",
      total: 0,
      totalPages: 0,
      page: 1,
      isLimited: true,
      candidateLimit: 1000,
      items: [],
    });
  });

  it.each([
    ["reg", "FI%"],
    ["ek", "55%"],
  ] as const)("caps broad wildcard %s searches", async (field, query) => {
    dogFindManyMock.mockResolvedValue(
      Array.from({ length: 1001 }, (_, index) =>
        makeRow({
          id: `dog_${index + 1}`,
          name: `Dog ${index + 1}`,
          ekNo: 5500 + (index % 100),
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
      field,
      query,
      page: 1,
      pageSize: 10,
    });

    expect(dogCountMock).not.toHaveBeenCalled();
    expect(dogFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 1001,
      }),
    );
    expect(result.isLimited).toBe(true);
    expect(result.candidateLimit).toBe(1000);
  });

  it("rejects nonnumeric ek queries before matching", async () => {
    const result = await searchVirtualPairingDogsDb({
      field: "ek",
      query: "not-a-number",
      page: 1,
      pageSize: 10,
    });

    expect(dogCountMock).not.toHaveBeenCalled();
    expect(dogFindManyMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      field: "ek",
      query: "not-a-number",
      total: 0,
      totalPages: 0,
      page: 1,
      isLimited: false,
      candidateLimit: null,
      items: [],
    });
  });

  it("rejects wildcard-only registration and name queries", async () => {
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

    expect(dogCountMock).not.toHaveBeenCalled();
    expect(dogFindManyMock).not.toHaveBeenCalled();
    expect(regResult).toEqual({
      field: "reg",
      query: "%%%",
      total: 0,
      totalPages: 0,
      page: 1,
      isLimited: false,
      candidateLimit: null,
      items: [],
    });
    expect(nameResult).toEqual({
      field: "name",
      query: "___",
      total: 0,
      totalPages: 0,
      page: 1,
      isLimited: false,
      candidateLimit: null,
      items: [],
    });
  });
});
