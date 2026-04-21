import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

const { trialResultGroupByMock, trialResultFindManyMock, prismaMock } =
  vi.hoisted(() => {
    const trialResultGroupBy = vi.fn();
    const trialResultFindMany = vi.fn();

    return {
      trialResultGroupByMock: trialResultGroupBy,
      trialResultFindManyMock: trialResultFindMany,
      prismaMock: {
        trialResult: {
          groupBy: trialResultGroupBy,
          findMany: trialResultFindMany,
        },
      },
    };
  });

vi.mock("../../core/prisma", () => ({
  prisma: prismaMock,
}));

import {
  getBeagleTrialDetailsDb,
  getBeagleTrialsForDogDb,
  searchBeagleTrialsDb,
} from "../repository";

describe("searchBeagleTrialsDb", () => {
  beforeEach(() => {
    trialResultGroupByMock.mockReset();
    trialResultFindManyMock.mockReset();
  });

  it("groups trial rows by eventDate+eventPlace and returns available event dates", async () => {
    trialResultGroupByMock
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
    trialResultFindManyMock.mockResolvedValue([
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

    const result = await searchBeagleTrialsDb({
      dateFrom: new Date("2024-12-31T22:00:00.000Z"),
      dateTo: new Date("2025-12-31T22:00:00.000Z"),
      sort: "date-desc",
      page: 1,
      pageSize: 10,
    });

    expect(
      result.availableEventDates.map((value) => value.toISOString()),
    ).toEqual(["2025-08-01T00:00:00.000Z", "2024-07-01T00:00:00.000Z"]);
    expect(result.items.map((row) => row.eventPlace)).toEqual([
      "Turku",
      "Helsinki",
    ]);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);

    const groupedArgs = trialResultGroupByMock.mock.calls[1]?.[0] as {
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

    trialResultGroupByMock
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
    trialResultFindManyMock.mockResolvedValue([
      {
        eventDate: new Date("2025-04-01T00:00:00.000Z"),
        eventPlace: "Borga",
        judge: "Judge B",
      },
    ]);

    const result = await searchBeagleTrialsDb({
      dateFrom,
      dateTo,
      sort: "date-asc",
      page: 9,
      pageSize: 1,
    });

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.items[0]?.eventPlace).toBe("Borga");
  });

  it("returns null judge when grouped trial has multiple judges", async () => {
    trialResultGroupByMock
      .mockResolvedValueOnce([{ eventDate: new Date("2025-06-01T00:00:00Z") }])
      .mockResolvedValueOnce([
        {
          eventDate: new Date("2025-06-01T00:00:00.000Z"),
          eventPlace: "Helsinki",
          _count: { _all: 2 },
          _max: { judge: "Judge B" },
        },
      ]);
    trialResultFindManyMock.mockResolvedValue([
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

    const result = await searchBeagleTrialsDb({
      dateFrom: new Date("2024-12-31T22:00:00.000Z"),
      dateTo: new Date("2025-12-31T22:00:00.000Z"),
      sort: "date-desc",
      page: 1,
      pageSize: 10,
    });

    expect(result.items[0]?.judge).toBeNull();
  });
});

describe("getBeagleTrialDetailsDb", () => {
  beforeEach(() => {
    trialResultGroupByMock.mockReset();
    trialResultFindManyMock.mockReset();
  });

  it("returns null when trial does not exist", async () => {
    trialResultFindManyMock.mockResolvedValue([]);

    const result = await getBeagleTrialDetailsDb({
      eventDateStart: new Date("2025-05-31T21:00:00.000Z"),
      eventDateEndExclusive: new Date("2025-06-01T21:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    expect(result).toBeNull();
  });

  it("maps detail rows using trial result fields", async () => {
    trialResultFindManyMock.mockResolvedValue([
      {
        id: "r3",
        eventDate: new Date("2025-06-01T12:34:00.000Z"),
        eventPlace: "Helsinki",
        judge: "Judge Main",
        ke: null,
        pa: null,
        lk: null,
        sija: null,
        piste: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
        legacyFlag: null,
        sourceKey: "src_3",
        createdAt: new Date("2025-06-01T00:00:00.000Z"),
        updatedAt: new Date("2025-06-01T00:00:00.000Z"),
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
        ke: "P",
        pa: "2",
        lk: "A",
        sija: "2",
        piste: { toNumber: () => 72.5 },
        haku: { toNumber: () => 4.1 },
        hauk: { toNumber: () => 4.2 },
        yva: { toNumber: () => 4.3 },
        hlo: { toNumber: () => 4.4 },
        alo: { toNumber: () => 4.5 },
        tja: { toNumber: () => 4.6 },
        pin: { toNumber: () => 4.7 },
        legacyFlag: "L",
        sourceKey: "src_2",
        createdAt: new Date("2025-06-01T00:00:00.000Z"),
        updatedAt: new Date("2025-06-01T00:00:00.000Z"),
        dog: {
          id: "d2",
          name: "Bella",
          sex: DogSex.FEMALE,
          registrations: [{ registrationNo: "FI-200/25" }],
        },
      },
      {
        id: "r1",
        eventDate: new Date("2025-06-01T12:34:00.000Z"),
        eventPlace: "Helsinki",
        judge: "Judge Main",
        ke: "L",
        pa: "1",
        lk: "V",
        sija: "1",
        piste: { toNumber: () => 88.25 },
        haku: { toNumber: () => 5.1 },
        hauk: { toNumber: () => 5.2 },
        yva: { toNumber: () => 5.3 },
        hlo: { toNumber: () => 5.4 },
        alo: { toNumber: () => 5.5 },
        tja: { toNumber: () => 5.6 },
        pin: { toNumber: () => 5.7 },
        legacyFlag: "X",
        sourceKey: "src_1",
        createdAt: new Date("2025-06-01T00:00:00.000Z"),
        updatedAt: new Date("2025-06-01T00:00:00.000Z"),
        dog: {
          id: "d1",
          name: "Aatu",
          sex: DogSex.MALE,
          registrations: [{ registrationNo: "FI-100/25" }],
        },
      },
    ]);

    const result = await getBeagleTrialDetailsDb({
      eventDateStart: new Date("2025-05-31T21:00:00.000Z"),
      eventDateEndExclusive: new Date("2025-06-01T21:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    expect(result).not.toBeNull();
    expect(result?.dogCount).toBe(3);
    expect(result?.judge).toBe("Judge Main");
    expect(result?.items.map((item) => item.id)).toEqual(["r1", "r2", "r3"]);
    expect(result?.items[0]).toMatchObject({
      sex: "U",
      registrationNo: "FI-100/25",
      weather: "L",
      award: "1",
      classCode: "V",
      rank: "1",
      points: 88.25,
      sourceKey: "src_1",
    });
    expect(result?.items[2]).toMatchObject({
      sex: "-",
      weather: null,
      points: null,
    });
  });
});

describe("getBeagleTrialsForDogDb", () => {
  beforeEach(() => {
    trialResultGroupByMock.mockReset();
    trialResultFindManyMock.mockReset();
  });

  it("maps dog trial rows in date-desc order", async () => {
    trialResultFindManyMock.mockResolvedValue([
      {
        id: "t2",
        eventPlace: "Lahti",
        eventDate: new Date("2025-06-02T00:00:00.000Z"),
        ke: "L",
        eventName: "VOI",
        lk: "V",
        sija: "1",
        piste: { toNumber: () => 88.25 },
        pa: "1",
        judge: "Judge A",
        haku: { toNumber: () => 4.1 },
        hauk: { toNumber: () => 4.2 },
        yva: { toNumber: () => 4.3 },
        hlo: { toNumber: () => 0.1 },
        alo: { toNumber: () => 0.2 },
        tja: { toNumber: () => 0.3 },
        pin: { toNumber: () => 5.6 },
      },
      {
        id: "t1",
        eventPlace: "Helsinki",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        ke: null,
        eventName: null,
        lk: null,
        sija: null,
        piste: null,
        pa: null,
        judge: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
      },
    ]);

    const result = await getBeagleTrialsForDogDb("dog-1");

    expect(trialResultFindManyMock).toHaveBeenCalledWith({
      where: { dogId: "dog-1" },
      select: {
        id: true,
        eventPlace: true,
        eventDate: true,
        ke: true,
        eventName: true,
        lk: true,
        sija: true,
        piste: true,
        pa: true,
        judge: true,
        haku: true,
        hauk: true,
        yva: true,
        hlo: true,
        alo: true,
        tja: true,
        pin: true,
      },
      orderBy: [{ eventDate: "desc" }, { eventPlace: "asc" }, { id: "asc" }],
    });
    expect(result).toEqual([
      {
        id: "t2",
        place: "Lahti",
        date: new Date("2025-06-02T00:00:00.000Z"),
        weather: "L",
        className: "VOI",
        classCode: "V",
        rank: "1",
        points: 88.25,
        award: "1",
        judge: "Judge A",
        haku: 4.1,
        hauk: 4.2,
        yva: 4.3,
        hlo: 0.1,
        alo: 0.2,
        tja: 0.3,
        pin: 5.6,
      },
      {
        id: "t1",
        place: "Helsinki",
        date: new Date("2025-06-01T00:00:00.000Z"),
        weather: null,
        className: null,
        classCode: null,
        rank: null,
        points: null,
        award: null,
        judge: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
      },
    ]);
  });
});
