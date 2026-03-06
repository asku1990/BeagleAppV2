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

import { getBeagleShowDetailsDb, searchBeagleShowsDb } from "../repository";

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
      "2025-01-01T00:00:00.000Z",
    );
    expect(groupedArgs.where.eventDate.lt.toISOString()).toBe(
      "2026-01-01T00:00:00.000Z",
    );
  });

  it("applies range filter and clamps pagination page", async () => {
    const dateFrom = new Date("2025-01-01T00:00:00.000Z");
    const dateTo = new Date("2025-12-31T00:00:00.000Z");

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
    expect(groupedArgs.where.eventDate.gte).toBe(dateFrom);
    expect(groupedArgs.where.eventDate.lt).toBe(dateTo);
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

  it("maps detail rows with sex/registration/height and stable order", async () => {
    showResultFindManyMock.mockResolvedValue([
      {
        id: "r3",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
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
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
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
        id: "r1",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
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

    expect(result).not.toBeNull();
    expect(result?.dogCount).toBe(3);
    expect(result?.judge).toBe("Judge Main");
    expect(result?.items.map((item) => item.id)).toEqual(["r1", "r2", "r3"]);
    expect(result?.items[0]).toMatchObject({
      sex: "U",
      registrationNo: "FI-100/25",
      heightCm: 41.5,
    });
    expect(result?.items[2]).toMatchObject({
      sex: "-",
      result: null,
      heightCm: null,
    });
  });
});
