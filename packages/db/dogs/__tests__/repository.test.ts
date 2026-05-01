import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

const {
  dogFindManyMock,
  dogCountMock,
  dogRegistrationGroupByMock,
  prismaMock,
} = vi.hoisted(() => {
  const dogFindMany = vi.fn();
  const dogCount = vi.fn();
  const dogRegistrationGroupBy = vi.fn();

  return {
    dogFindManyMock: dogFindMany,
    dogCountMock: dogCount,
    dogRegistrationGroupByMock: dogRegistrationGroupBy,
    prismaMock: {
      dog: {
        findMany: dogFindMany,
        count: dogCount,
      },
      dogRegistration: {
        groupBy: dogRegistrationGroupBy,
      },
    },
  };
});

vi.mock("../../core/prisma", () => ({
  prisma: prismaMock,
}));

import { getNewestBeagleDogsDb } from "../newest";
import { searchBeagleDogsDb } from "../search";

function makeDogRow(input: {
  id: string;
  name: string;
  ekNo?: number | null;
  sex?: DogSex;
  birthDate?: Date | null;
  createdAt?: Date;
  registrations: Array<{ registrationNo: string; createdAt: Date }>;
}) {
  return {
    id: input.id,
    ekNo: input.ekNo ?? null,
    createdAt: input.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
    name: input.name,
    sex: input.sex ?? DogSex.MALE,
    birthDate: input.birthDate ?? null,
    registrations: input.registrations,
    sire: null,
    dam: null,
    _count: {
      trialEntries: 0,
      showEntries: 0,
    },
  };
}

describe("searchBeagleDogsDb", () => {
  beforeEach(() => {
    dogFindManyMock.mockReset();
    dogCountMock.mockReset();
    dogRegistrationGroupByMock.mockReset();
  });

  it("returns empty baseline for no-input search without DB calls", async () => {
    const result = await searchBeagleDogsDb({});

    expect(result).toEqual({
      mode: "none",
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    });
    expect(dogCountMock).not.toHaveBeenCalled();
    expect(dogFindManyMock).not.toHaveBeenCalled();
  });

  it("resolves core modes ek/reg/name/combined", async () => {
    dogCountMock.mockResolvedValue(0);
    dogFindManyMock.mockResolvedValue([]);

    const ek = await searchBeagleDogsDb({ ek: "1" });
    const reg = await searchBeagleDogsDb({ reg: "FI-" });
    const name = await searchBeagleDogsDb({ name: "Meri" });
    const combined = await searchBeagleDogsDb({ ek: "1", name: "Meri" });

    expect(ek.mode).toBe("ek");
    expect(reg.mode).toBe("reg");
    expect(name.mode).toBe("name");
    expect(combined.mode).toBe("combined");
  });

  it("uses DB orderBy path for name/birth/created/ek sorts", async () => {
    dogCountMock.mockResolvedValue(0);
    dogFindManyMock.mockResolvedValue([]);

    await searchBeagleDogsDb({ name: "A", sort: "name-asc" });
    await searchBeagleDogsDb({ name: "A", sort: "birth-desc" });
    await searchBeagleDogsDb({ name: "A", sort: "created-desc" });
    await searchBeagleDogsDb({ name: "A", sort: "ek-asc" });

    const orderBys = dogFindManyMock.mock.calls.map((call) => call[0].orderBy);

    expect(orderBys).toContainEqual([{ name: "asc" }, { id: "asc" }]);
    expect(orderBys).toContainEqual([
      { birthDate: { sort: "desc", nulls: "last" } },
      { id: "asc" },
    ]);
    expect(orderBys).toContainEqual([{ createdAt: "desc" }, { id: "desc" }]);
    expect(orderBys).toContainEqual([
      { ekNo: { sort: "asc", nulls: "last" } },
      { id: "asc" },
    ]);
  });

  it("uses registration ordering path for reg-desc and keeps ordered ids", async () => {
    dogFindManyMock
      .mockResolvedValueOnce([
        makeDogRow({
          id: "dogA",
          name: "A",
          registrations: [
            { registrationNo: "FI-10/24", createdAt: new Date("2026-01-01") },
          ],
        }),
        makeDogRow({
          id: "dogB",
          name: "B",
          registrations: [
            { registrationNo: "FI-11/25", createdAt: new Date("2026-01-02") },
          ],
        }),
      ])
      .mockResolvedValueOnce([
        makeDogRow({
          id: "dogA",
          name: "A",
          registrations: [
            { registrationNo: "FI-10/24", createdAt: new Date("2026-01-01") },
          ],
        }),
        makeDogRow({
          id: "dogB",
          name: "B",
          registrations: [
            { registrationNo: "FI-11/25", createdAt: new Date("2026-01-02") },
          ],
        }),
      ]);

    const result = await searchBeagleDogsDb({ reg: "FI-", sort: "reg-desc" });

    expect(dogCountMock).not.toHaveBeenCalled();
    expect(result.items.map((item) => item.id)).toEqual(["dogB", "dogA"]);
  });

  it("returns empty page from registration ordering path when no dogs match", async () => {
    dogFindManyMock.mockResolvedValue([]);

    const result = await searchBeagleDogsDb({ reg: "FI-", sort: "reg-desc" });

    expect(result).toEqual({
      mode: "reg",
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    });
    expect(dogFindManyMock).toHaveBeenCalledTimes(1);
  });

  it("clamps page to totalPages and keeps total/totalPages consistency", async () => {
    dogCountMock.mockResolvedValue(25);
    dogFindManyMock.mockResolvedValue([]);

    const result = await searchBeagleDogsDb({
      name: "Alpha",
      page: 99,
      pageSize: 10,
      sort: "name-asc",
    });

    expect(result.total).toBe(25);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(3);

    const lastFindManyArgs = dogFindManyMock.mock.calls.at(-1)?.[0];
    expect(lastFindManyArgs.skip).toBe(20);
    expect(lastFindManyArgs.take).toBe(10);
  });

  it("applies wildcard parity for core fields in in-memory filtering", async () => {
    dogFindManyMock.mockResolvedValue([
      makeDogRow({
        id: "dog1",
        name: "Alpha",
        ekNo: 123,
        registrations: [
          { registrationNo: "FI-100/24", createdAt: new Date("2026-01-01") },
        ],
      }),
      makeDogRow({
        id: "dog2",
        name: "Bravo",
        ekNo: 999,
        registrations: [
          { registrationNo: "SE-1/24", createdAt: new Date("2026-01-02") },
        ],
      }),
    ]);

    const byEk = await searchBeagleDogsDb({ ek: "12%" });
    const byReg = await searchBeagleDogsDb({ reg: "FI-%" });
    const byName = await searchBeagleDogsDb({ name: "%alp%" });

    expect(byEk.items.map((item) => item.id)).toEqual(["dog1"]);
    expect(byReg.items.map((item) => item.id)).toEqual(["dog1"]);
    expect(byName.items.map((item) => item.id)).toEqual(["dog1"]);
  });

  it("treats sex-only search as combined mode and applies sex filter", async () => {
    dogCountMock.mockResolvedValue(0);
    dogFindManyMock.mockResolvedValue([]);

    const result = await searchBeagleDogsDb({ sex: "female" });

    expect(result.mode).toBe("combined");
    const countArgs = dogCountMock.mock.calls[0]?.[0];
    expect(JSON.stringify(countArgs.where)).toContain("FEMALE");
  });

  it("combines sex with primary text filters", async () => {
    dogCountMock.mockResolvedValue(0);
    dogFindManyMock.mockResolvedValue([]);

    await searchBeagleDogsDb({ name: "Meri", sex: "male" });

    const countArgs = dogCountMock.mock.calls[0]?.[0];
    const whereJson = JSON.stringify(countArgs.where);
    expect(whereJson).toContain("contains");
    expect(whereJson).toContain("Meri");
    expect(whereJson).toContain("MALE");
  });

  it("returns early empty for multipleRegsOnly when no grouped ids", async () => {
    dogRegistrationGroupByMock.mockResolvedValue([]);

    const result = await searchBeagleDogsDb({
      name: "A",
      multipleRegsOnly: true,
      sex: "female",
    });

    expect(result).toEqual({
      mode: "name",
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    });
    expect(dogFindManyMock).not.toHaveBeenCalled();
  });

  it("applies wildcard plus sex and multi-registration combination", async () => {
    dogRegistrationGroupByMock.mockResolvedValue([
      { dogId: "dog1", _count: { _all: 2 } },
    ]);
    dogFindManyMock.mockResolvedValue([
      makeDogRow({
        id: "dog1",
        name: "Alpha",
        sex: DogSex.FEMALE,
        registrations: [
          { registrationNo: "FI-100/24", createdAt: new Date("2026-01-01") },
          { registrationNo: "FI-200/25", createdAt: new Date("2026-01-02") },
        ],
      }),
      makeDogRow({
        id: "dog2",
        name: "Beta",
        sex: DogSex.FEMALE,
        registrations: [
          { registrationNo: "FI-300/24", createdAt: new Date("2026-01-03") },
        ],
      }),
    ]);

    const result = await searchBeagleDogsDb({
      name: "%alp%",
      sex: "female",
      multipleRegsOnly: true,
    });

    expect(result.items.map((item) => item.id)).toEqual(["dog1"]);
    expect(result.mode).toBe("name");
  });

  it("filters out single-registration dogs in in-memory multipleRegsOnly mode", async () => {
    dogRegistrationGroupByMock.mockResolvedValue([
      { dogId: "dog1", _count: { _all: 1 } },
      { dogId: "dog2", _count: { _all: 2 } },
    ]);
    dogFindManyMock.mockResolvedValue([
      makeDogRow({
        id: "dog1",
        name: "Alpha",
        registrations: [
          { registrationNo: "FI-100/24", createdAt: new Date("2026-01-01") },
        ],
      }),
      makeDogRow({
        id: "dog2",
        name: "Alpha",
        registrations: [
          { registrationNo: "FI-200/24", createdAt: new Date("2026-01-02") },
          { registrationNo: "FI-201/25", createdAt: new Date("2026-01-03") },
        ],
      }),
    ]);

    const result = await searchBeagleDogsDb({
      name: "%alp%",
      multipleRegsOnly: true,
    });

    expect(result.items.map((item) => item.id)).toEqual(["dog2"]);
  });
});

describe("getNewestBeagleDogsDb", () => {
  beforeEach(() => {
    dogFindManyMock.mockReset();
  });

  it("uses default limit and maps rows", async () => {
    dogFindManyMock.mockResolvedValue([
      makeDogRow({
        id: "dog1",
        name: "Alpha",
        createdAt: new Date("2026-01-03T00:00:00.000Z"),
        registrations: [
          { registrationNo: "FI-100/24", createdAt: new Date("2026-01-01") },
        ],
      }),
    ]);

    const result = await getNewestBeagleDogsDb();

    expect(dogFindManyMock).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 5,
      skip: undefined,
      select: expect.any(Object),
    });
    expect(result[0]?.id).toBe("dog1");
  });

  it("clamps invalid limit values", async () => {
    dogFindManyMock.mockResolvedValue([]);

    await getNewestBeagleDogsDb(0);
    await getNewestBeagleDogsDb(999);

    expect(dogFindManyMock.mock.calls[0]?.[0]?.take).toBe(1);
    expect(dogFindManyMock.mock.calls[1]?.[0]?.take).toBe(20);
  });
});
