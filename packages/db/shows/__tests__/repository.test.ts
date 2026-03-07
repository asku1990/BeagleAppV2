import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

const { showResultGroupByMock, showResultFindManyMock, prismaMock } =
  vi.hoisted(() => {
    const showResultGroupBy = vi.fn();
    const showResultFindMany = vi.fn();

    return {
      showResultGroupByMock: showResultGroupBy,
      showResultFindManyMock: showResultFindMany,
      prismaMock: {
        showResult: {
          groupBy: showResultGroupBy,
          findMany: showResultFindMany,
        },
      },
    };
  });

vi.mock("../../core/prisma", () => ({
  prisma: prismaMock,
}));

import {
  getBeagleShowDetailsDb,
  getBeagleShowsForDogDb,
  searchBeagleShowsDb,
} from "../repository";

describe("searchBeagleShowsDb", () => {
  beforeEach(() => {
    showResultGroupByMock.mockReset();
    showResultFindManyMock.mockReset();
  });

  it("groups show rows by eventDate+eventPlace and returns available years", async () => {
    showResultGroupByMock
      .mockResolvedValueOnce([
        { eventDate: new Date("2025-08-01T00:00:00.000Z") },
        { eventDate: new Date("2024-07-01T00:00:00.000Z") },
      ])
      .mockResolvedValueOnce([
        {
          eventDate: new Date("2025-06-01T00:00:00.000Z"),
          eventPlace: "Helsinki",
          _count: { _all: 7 },
          _max: { judge: "Judge A" },
        },
        {
          eventDate: new Date("2025-09-01T00:00:00.000Z"),
          eventPlace: "Turku",
          _count: { _all: 4 },
          _max: { judge: "Judge B" },
        },
      ]);
    showResultFindManyMock.mockResolvedValue([
      {
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        judge: "Judge A",
      },
      {
        eventDate: new Date("2025-09-01T00:00:00.000Z"),
        eventPlace: "Turku",
        judge: "Judge B",
      },
    ]);

    const result = await searchBeagleShowsDb({
      mode: "year",
      year: 2025,
      sort: "date-desc",
      page: 1,
      pageSize: 10,
    });

    expect(result.availableYears).toEqual([2025, 2024]);
    expect(result.items.map((row) => row.eventPlace)).toEqual([
      "Turku",
      "Helsinki",
    ]);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);

    const groupedArgs = showResultGroupByMock.mock.calls[1]?.[0] as {
      where: { eventDate: { gte: Date; lt: Date } };
    };
    expect(groupedArgs.where.eventDate.gte.toISOString()).toBe(
      "2024-12-31T22:00:00.000Z",
    );
    expect(groupedArgs.where.eventDate.lt.toISOString()).toBe(
      "2025-12-31T22:00:00.000Z",
    );
  });

  it("applies range filter and clamps pagination page", async () => {
    const dateFrom = new Date("2025-01-01T00:00:00.000Z");
    const dateTo = new Date("2026-01-01T00:00:00.000Z");

    showResultGroupByMock
      .mockResolvedValueOnce([{ eventDate: new Date("2025-02-01T00:00:00Z") }])
      .mockResolvedValueOnce([
        {
          eventDate: new Date("2025-03-01T00:00:00.000Z"),
          eventPlace: "Akaa",
          _count: { _all: 1 },
          _max: { judge: "Judge A" },
        },
        {
          eventDate: new Date("2025-04-01T00:00:00.000Z"),
          eventPlace: "Borga",
          _count: { _all: 1 },
          _max: { judge: "Judge B" },
        },
      ]);
    showResultFindManyMock.mockResolvedValue([
      {
        eventDate: new Date("2025-04-01T00:00:00.000Z"),
        eventPlace: "Borga",
        judge: "Judge B",
      },
    ]);

    const result = await searchBeagleShowsDb({
      mode: "range",
      dateFrom,
      dateTo,
      sort: "date-asc",
      page: 9,
      pageSize: 1,
    });

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.items[0]?.eventPlace).toBe("Borga");

    const groupedArgs = showResultGroupByMock.mock.calls[1]?.[0] as {
      where: { eventDate: { gte: Date; lt: Date } };
    };
    expect(groupedArgs.where.eventDate.gte.toISOString()).toBe(
      "2024-12-31T22:00:00.000Z",
    );
    expect(groupedArgs.where.eventDate.lt.toISOString()).toBe(
      "2025-12-31T22:00:00.000Z",
    );
  });

  it("returns null judge when grouped show has multiple judges", async () => {
    showResultGroupByMock
      .mockResolvedValueOnce([{ eventDate: new Date("2025-06-01T00:00:00Z") }])
      .mockResolvedValueOnce([
        {
          eventDate: new Date("2025-06-01T00:00:00.000Z"),
          eventPlace: "Helsinki",
          _count: { _all: 2 },
          _max: { judge: "Judge B" },
        },
      ]);
    showResultFindManyMock.mockResolvedValue([
      {
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        judge: "Judge A",
      },
      {
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        judge: "Judge B",
      },
    ]);

    const result = await searchBeagleShowsDb({
      mode: "year",
      year: 2025,
      sort: "date-desc",
      page: 1,
      pageSize: 10,
    });

    expect(result.items[0]?.judge).toBeNull();
  });
});

describe("getBeagleShowDetailsDb", () => {
  beforeEach(() => {
    showResultGroupByMock.mockReset();
    showResultFindManyMock.mockReset();
  });

  it("returns null when show does not exist", async () => {
    showResultFindManyMock.mockResolvedValue([]);

    const result = await getBeagleShowDetailsDb({
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    expect(result).toBeNull();
  });

  it("maps detail rows using v1-like detail ordering", async () => {
    showResultFindManyMock.mockResolvedValue([
      {
        id: "r3",
        eventDate: new Date("2025-06-01T12:34:00.000Z"),
        eventPlace: "Helsinki",
        judge: "Judge Main",
        resultText: null,
        heightText: null,
        dog: {
          id: "d3",
          name: "Cora",
          sex: DogSex.UNKNOWN,
          registrations: [{ registrationNo: "FI-300/25" }],
        },
      },
      {
        id: "r2",
        eventDate: new Date("2025-06-01T12:34:00.000Z"),
        eventPlace: "Helsinki",
        judge: "Judge Main",
        resultText: "NUO1",
        heightText: "39",
        dog: {
          id: "d2",
          name: "Bella",
          sex: DogSex.FEMALE,
          registrations: [{ registrationNo: "FI-200/25" }],
        },
      },
      {
        id: "r4",
        eventDate: new Date("2025-06-01T12:34:00.000Z"),
        eventPlace: "Helsinki",
        judge: "Judge Main",
        resultText: "AVO1",
        heightText: "40",
        dog: {
          id: "d4",
          name: "Zorro",
          sex: DogSex.MALE,
          registrations: [{ registrationNo: "FI-050/25" }],
        },
      },
      {
        id: "r1",
        eventDate: new Date("2025-06-01T12:34:00.000Z"),
        eventPlace: "Helsinki",
        judge: "Judge Main",
        resultText: "AVO2",
        heightText: "41.5",
        dog: {
          id: "d1",
          name: "Aatu",
          sex: DogSex.MALE,
          registrations: [{ registrationNo: "FI-100/25" }],
        },
      },
    ]);

    const result = await getBeagleShowDetailsDb({
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    const detailsArgs = showResultFindManyMock.mock.calls[0]?.[0] as {
      where: {
        eventDate: { gte: Date; lt: Date };
        eventPlace: string;
      };
    };
    expect(detailsArgs.where.eventDate.gte.toISOString()).toBe(
      "2025-05-31T21:00:00.000Z",
    );
    expect(detailsArgs.where.eventDate.lt.toISOString()).toBe(
      "2025-06-01T21:00:00.000Z",
    );
    expect(detailsArgs.where.eventPlace).toBe("Helsinki");

    expect(result).not.toBeNull();
    expect(result?.dogCount).toBe(4);
    expect(result?.judge).toBe("Judge Main");
    expect(result?.items.map((item) => item.id)).toEqual([
      "r4",
      "r1",
      "r2",
      "r3",
    ]);
    expect(result?.items[0]).toMatchObject({
      sex: "U",
      registrationNo: "FI-050/25",
      result: "AVO1",
      heightCm: 40,
    });
    expect(result?.items[3]).toMatchObject({
      sex: "-",
      result: null,
      heightCm: null,
    });
  });
});

describe("getBeagleShowsForDogDb", () => {
  beforeEach(() => {
    showResultGroupByMock.mockReset();
    showResultFindManyMock.mockReset();
  });

  it("maps dog show rows in date-desc order", async () => {
    showResultFindManyMock.mockResolvedValue([
      {
        id: "s2",
        eventPlace: "Lahti",
        eventDate: new Date("2025-06-02T00:00:00.000Z"),
        resultText: "JUN1",
        judge: "Judge B",
        heightText: "39.5",
      },
      {
        id: "s1",
        eventPlace: "Helsinki",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        resultText: null,
        judge: null,
        heightText: null,
      },
    ]);

    const result = await getBeagleShowsForDogDb("dog-1");

    expect(showResultFindManyMock).toHaveBeenCalledWith({
      where: { dogId: "dog-1" },
      select: {
        id: true,
        eventPlace: true,
        eventDate: true,
        resultText: true,
        judge: true,
        heightText: true,
      },
      orderBy: [{ eventDate: "desc" }, { eventPlace: "asc" }, { id: "asc" }],
    });
    expect(result).toEqual([
      {
        id: "s2",
        place: "Lahti",
        date: new Date("2025-06-02T00:00:00.000Z"),
        result: "JUN1",
        judge: "Judge B",
        heightCm: 39.5,
      },
      {
        id: "s1",
        place: "Helsinki",
        date: new Date("2025-06-01T00:00:00.000Z"),
        result: null,
        judge: null,
        heightCm: null,
      },
    ]);
  });
});
