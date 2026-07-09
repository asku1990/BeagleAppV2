import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

const {
  trialEventFindManyMock,
  trialEventFindUniqueMock,
  trialEntryFindManyMock,
  prismaMock,
} = vi.hoisted(() => {
  const trialEventFindMany = vi.fn();
  const trialEventFindUnique = vi.fn();
  const trialEntryFindMany = vi.fn();

  return {
    trialEventFindManyMock: trialEventFindMany,
    trialEventFindUniqueMock: trialEventFindUnique,
    trialEntryFindManyMock: trialEntryFindMany,
    prismaMock: {
      trialEvent: {
        findMany: trialEventFindMany,
        findUnique: trialEventFindUnique,
      },
      trialEntry: {
        findMany: trialEntryFindMany,
      },
    },
  };
});

vi.mock("../../core/prisma", () => ({
  prisma: prismaMock,
}));

import {
  getBeagleTrialDetailsDb,
  getBeagleTrialSummarySourceForDogDb,
  getBeagleTrialsForDogDb,
  searchBeagleTrialsDb,
} from "../index";

// ---------------------------------------------------------------------------
// searchBeagleTrialsDb
// ---------------------------------------------------------------------------

describe("searchBeagleTrialsDb", () => {
  beforeEach(() => {
    trialEventFindManyMock.mockReset();
  });

  it("returns one row per TrialEvent and available dates", async () => {
    trialEventFindManyMock
      .mockResolvedValueOnce([
        { koepaiva: new Date("2025-08-01T00:00:00.000Z") },
        { koepaiva: new Date("2024-07-01T00:00:00.000Z") },
      ])
      .mockResolvedValueOnce([
        {
          id: "event-2",
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          koekunta: "Helsinki",
          ylituomariNimi: "Judge A",
          _count: { entries: 7 },
        },
        {
          id: "event-1",
          koepaiva: new Date("2025-09-01T00:00:00.000Z"),
          koekunta: "Turku",
          ylituomariNimi: "Judge B",
          _count: { entries: 4 },
        },
      ]);

    const result = await searchBeagleTrialsDb({
      dateFrom: new Date("2024-12-31T22:00:00.000Z"),
      dateTo: new Date("2025-12-31T22:00:00.000Z"),
      sort: "date-desc",
      page: 1,
      pageSize: 10,
    });

    expect(result.availableEventDates.map((d) => d.toISOString())).toEqual([
      "2025-08-01T00:00:00.000Z",
      "2024-07-01T00:00:00.000Z",
    ]);
    expect(result.items.map((r) => r.trialEventId)).toEqual([
      "event-1",
      "event-2",
    ]);
    expect(result.items.map((r) => r.eventPlace)).toEqual([
      "Turku",
      "Helsinki",
    ]);
    expect(result.items[0]?.dogCount).toBe(4);
    expect(result.items[0]?.judge).toBe("Judge B");
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);

    const eventRowsCall = trialEventFindManyMock.mock.calls[1]?.[0] as {
      where: { koepaiva: { gte: Date; lt: Date } };
    };
    expect(eventRowsCall.where.koepaiva.gte.toISOString()).toBe(
      "2024-12-31T22:00:00.000Z",
    );
    expect(eventRowsCall.where.koepaiva.lt.toISOString()).toBe(
      "2025-12-31T22:00:00.000Z",
    );
  });

  it("keeps same-date same-place TrialEvent rows separate", async () => {
    trialEventFindManyMock
      .mockResolvedValueOnce([
        { koepaiva: new Date("2025-06-01T00:00:00.000Z") },
      ])
      .mockResolvedValueOnce([
        {
          id: "event-a",
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          koekunta: "Helsinki",
          ylituomariNimi: "Judge A",
          _count: { entries: 5 },
        },
        {
          id: "event-b",
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          koekunta: "Helsinki",
          ylituomariNimi: "Judge A",
          _count: { entries: 3 },
        },
      ]);

    const result = await searchBeagleTrialsDb({
      dateFrom: new Date("2024-12-31T22:00:00.000Z"),
      dateTo: new Date("2025-12-31T22:00:00.000Z"),
      sort: "date-desc",
      page: 1,
      pageSize: 10,
    });

    expect(result.total).toBe(2);
    expect(result.items.map((row) => row.trialEventId)).toEqual([
      "event-a",
      "event-b",
    ]);
    expect(result.items.map((row) => row.dogCount)).toEqual([5, 3]);
  });

  it("applies entries:{ some:{} } filter to both available-dates and event-rows queries", async () => {
    trialEventFindManyMock
      .mockResolvedValueOnce([
        { koepaiva: new Date("2025-06-01T00:00:00.000Z") },
      ])
      .mockResolvedValueOnce([]);

    await searchBeagleTrialsDb({
      dateFrom: new Date("2024-12-31T22:00:00.000Z"),
      dateTo: new Date("2025-12-31T22:00:00.000Z"),
      sort: "date-desc",
      page: 1,
      pageSize: 10,
    });

    const availableDatesArgs = trialEventFindManyMock.mock.calls[0]?.[0] as {
      where?: { entries?: unknown };
    };
    expect(availableDatesArgs.where).toMatchObject({ entries: { some: {} } });

    const eventRowsArgs = trialEventFindManyMock.mock.calls[1]?.[0] as {
      where: { entries?: unknown };
    };
    expect(eventRowsArgs.where).toMatchObject({ entries: { some: {} } });
  });

  it("applies range filter and clamps out-of-range pagination page", async () => {
    trialEventFindManyMock
      .mockResolvedValueOnce([{ koepaiva: new Date("2025-02-01T00:00:00Z") }])
      .mockResolvedValueOnce([
        {
          id: "event-b",
          koepaiva: new Date("2025-03-01T00:00:00.000Z"),
          koekunta: "Akaa",
          ylituomariNimi: "Judge A",
          _count: { entries: 1 },
        },
        {
          id: "event-a",
          koepaiva: new Date("2025-04-01T00:00:00.000Z"),
          koekunta: "Borga",
          ylituomariNimi: "Judge B",
          _count: { entries: 1 },
        },
      ]);

    const result = await searchBeagleTrialsDb({
      dateFrom: new Date("2025-01-01T00:00:00.000Z"),
      dateTo: new Date("2026-01-01T00:00:00.000Z"),
      sort: "date-asc",
      page: 9,
      pageSize: 1,
    });

    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.items[0]?.eventPlace).toBe("Borga");
    expect(result.items[0]?.trialEventId).toBe("event-a");
  });
});

// ---------------------------------------------------------------------------
// getBeagleTrialDetailsDb
// ---------------------------------------------------------------------------

describe("getBeagleTrialDetailsDb", () => {
  beforeEach(() => {
    trialEventFindUniqueMock.mockReset();
  });

  it("returns null when no TrialEvent is found", async () => {
    trialEventFindUniqueMock.mockResolvedValue(null);

    const result = await getBeagleTrialDetailsDb({
      trialEventId: "event-missing",
    });

    expect(result).toBeNull();
  });

  it("returns null when TrialEvent exists but has no entries", async () => {
    trialEventFindUniqueMock.mockResolvedValue({
      id: "event-1",
      koepaiva: new Date("2025-06-01T00:00:00.000Z"),
      koekunta: "Helsinki",
      ylituomariNimi: "Judge Main",
      trialRuleWindowId: "trw1",
      entries: [],
    });

    const result = await getBeagleTrialDetailsDb({
      trialEventId: "event-1",
    });

    expect(result).toBeNull();
  });

  it("maps TrialEntry fields, resolves judges, and sorts by points desc", async () => {
    trialEventFindUniqueMock.mockResolvedValue({
      id: "event-1",
      koepaiva: new Date("2025-06-01T12:34:00.000Z"),
      koekunta: "Helsinki",
      ylituomariNimi: "Judge Main",
      trialRuleWindowId: "trw1",
      entries: [
        {
          id: "r3",
          dogId: null,
          rekisterinumeroSnapshot: "FI-300/25",
          ke: null,
          pa: null,
          lk: null,
          sija: null,
          piste: null,
          tuom1: null,
          haku: null,
          hauk: null,
          yva: null,
          hlo: null,
          alo: null,
          tja: null,
          pin: null,
          dog: null,
        },
        {
          id: "r2",
          dogId: "d2",
          rekisterinumeroSnapshot: "FI-200/25",
          ke: "P",
          pa: "2",
          lk: "A",
          sija: "2",
          piste: { toNumber: () => 72.5 },
          tuom1: null,
          haku: { toNumber: () => 4.1 },
          hauk: { toNumber: () => 4.2 },
          yva: { toNumber: () => 4.3 },
          hlo: { toNumber: () => 4.4 },
          alo: { toNumber: () => 4.5 },
          tja: { toNumber: () => 4.6 },
          pin: { toNumber: () => 4.7 },
          dog: { name: "Bella", sex: DogSex.FEMALE },
        },
        {
          id: "r1",
          dogId: "d1",
          rekisterinumeroSnapshot: "FI-100/25",
          ke: "L",
          pa: "1",
          lk: "V",
          sija: "1",
          piste: { toNumber: () => 88.25 },
          tuom1: "Judge Group",
          haku: { toNumber: () => 5.1 },
          hauk: { toNumber: () => 5.2 },
          yva: { toNumber: () => 5.3 },
          hlo: { toNumber: () => 5.4 },
          alo: { toNumber: () => 5.5 },
          tja: { toNumber: () => 5.6 },
          pin: { toNumber: () => 5.7 },
          dog: { name: "Aatu", sex: DogSex.MALE },
        },
      ],
    });

    const result = await getBeagleTrialDetailsDb({
      trialEventId: "event-1",
    });

    expect(result).not.toBeNull();
    expect(result?.trialEventId).toBe("event-1");
    expect(result?.dogCount).toBe(3);
    expect(result?.judge).toBe("Judge Main");
    expect(result?.items.map((item) => item.id)).toEqual(["r1", "r2", "r3"]);

    expect(result?.items[0]).toMatchObject({
      dogId: "d1",
      sex: "U",
      registrationNo: "FI-100/25",
      name: "Aatu",
      weather: "L",
      award: "1",
      classCode: "V",
      rank: "1",
      points: 88.25,
      judge: "Judge Group",
    });

    expect(result?.items[1]).toMatchObject({
      dogId: "d2",
      sex: "N",
      weather: "P",
      points: 72.5,
      judge: "Judge Main",
    });

    expect(result?.items[2]).toMatchObject({
      dogId: null,
      sex: "-",
      registrationNo: "FI-300/25",
      name: "FI-300/25",
      weather: null,
      points: null,
      judge: "Judge Main",
    });
  });

  it("keeps separate TrialEvent ids isolated", async () => {
    trialEventFindUniqueMock.mockResolvedValue({
      id: "event-1",
      koepaiva: new Date("2025-06-01T00:00:00.000Z"),
      koekunta: "Helsinki",
      ylituomariNimi: "Judge A",
      trialRuleWindowId: "trw1",
      entries: [
        {
          id: "r1",
          dogId: "d1",
          rekisterinumeroSnapshot: "FI-100/25",
          ke: null,
          pa: null,
          lk: null,
          sija: null,
          piste: { toNumber: () => 80 },
          tuom1: null,
          haku: null,
          hauk: null,
          yva: null,
          hlo: null,
          alo: null,
          tja: null,
          pin: null,
          dog: { name: "Aatu", sex: DogSex.MALE },
        },
      ],
    });

    const result = await getBeagleTrialDetailsDb({
      trialEventId: "event-1",
    });

    expect(result?.trialEventId).toBe("event-1");
    expect(result?.dogCount).toBe(1);
    expect(result?.items.map((item) => item.id)).toEqual(["r1"]);
  });
});

// ---------------------------------------------------------------------------
// getBeagleTrialsForDogDb
// ---------------------------------------------------------------------------

describe("getBeagleTrialsForDogDb", () => {
  beforeEach(() => {
    trialEntryFindManyMock.mockReset();
  });

  it("maps dog trial rows from TrialEntry+TrialEvent in date-desc order", async () => {
    trialEntryFindManyMock.mockResolvedValue([
      {
        id: "t2",
        ke: "L",
        koetyyppi: "NORMAL",
        lk: "V",
        sija: "1",
        koiriaLuokassa: 12,
        piste: { toNumber: () => 88.25 },
        pa: "1",
        tuom1: "Judge A",
        haku: { toNumber: () => 4.1 },
        hauk: { toNumber: () => 4.2 },
        yva: { toNumber: () => 4.3 },
        hlo: { toNumber: () => 0.1 },
        alo: { toNumber: () => 0.2 },
        tja: { toNumber: () => 0.3 },
        pin: { toNumber: () => 5.6 },
        trialEvent: {
          id: "event-2",
          trialRuleWindowId: "trw_post_20230801",
          koekunta: "Lahti",
          koepaiva: new Date("2025-06-02T00:00:00.000Z"),
          ylituomariNimi: "Chief Judge",
        },
      },
      {
        id: "t1",
        ke: null,
        koetyyppi: "NORMAL",
        lk: null,
        sija: null,
        koiriaLuokassa: null,
        piste: null,
        pa: null,
        tuom1: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
        trialEvent: {
          id: "event-1",
          trialRuleWindowId: "trw_pre_20020801",
          koekunta: "Helsinki",
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          ylituomariNimi: null,
        },
      },
    ]);

    const result = await getBeagleTrialsForDogDb("dog-1");

    expect(trialEntryFindManyMock).toHaveBeenCalledWith({
      where: { dogId: "dog-1" },
      select: {
        id: true,
        ke: true,
        koetyyppi: true,
        lk: true,
        sija: true,
        koiriaLuokassa: true,
        piste: true,
        pa: true,
        tuom1: true,
        haku: true,
        hauk: true,
        yva: true,
        hlo: true,
        alo: true,
        tja: true,
        pin: true,
        trialEvent: {
          select: {
            id: true,
            koekunta: true,
            koepaiva: true,
            trialRuleWindowId: true,
            ylituomariNimi: true,
          },
        },
      },
      orderBy: [
        { trialEvent: { koepaiva: "desc" } },
        { trialEvent: { koekunta: "asc" } },
        { id: "asc" },
      ],
    });

    expect(result).toEqual([
      {
        id: "t2",
        trialEventId: "event-2",
        trialRuleWindowId: "trw_post_20230801",
        place: "Lahti",
        date: new Date("2025-06-02T00:00:00.000Z"),
        weather: "L",
        koetyyppi: "NORMAL",
        classCode: "V",
        rank: "1",
        koiriaLuokassa: 12,
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
        trialEventId: "event-1",
        trialRuleWindowId: "trw_pre_20020801",
        place: "Helsinki",
        date: new Date("2025-06-01T00:00:00.000Z"),
        weather: null,
        koetyyppi: "NORMAL",
        classCode: null,
        rank: null,
        koiriaLuokassa: null,
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

  it("prefers entry-level judge, then event judge", async () => {
    trialEntryFindManyMock.mockResolvedValue([
      {
        id: "t1",
        ke: null,
        lk: null,
        sija: null,
        piste: null,
        pa: null,
        tuom1: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
        trialEvent: {
          id: "event-1",
          koekunta: "Helsinki",
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          ylituomariNimi: "Chief",
        },
      },
      {
        id: "t2",
        ke: null,
        lk: null,
        sija: null,
        piste: null,
        pa: null,
        tuom1: "Entry Chief",
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
        trialEvent: {
          id: "event-2",
          koekunta: "Turku",
          koepaiva: new Date("2025-06-02T00:00:00.000Z"),
          ylituomariNimi: "Chief",
        },
      },
    ]);

    const result = await getBeagleTrialsForDogDb("dog-1");

    expect(result[0]?.judge).toBe("Chief");
    expect(result[1]?.judge).toBe("Entry Chief");
  });

  it("loads compact era recap rows only when requested", async () => {
    trialEntryFindManyMock.mockResolvedValue([
      {
        id: "t1",
        ke: null,
        koetyyppi: "NORMAL",
        lk: null,
        sija: null,
        koiriaLuokassa: null,
        piste: null,
        pa: null,
        tuom1: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
        eras: [
          {
            era: 1,
            alkoi: "08:15",
            hakumin: 35,
            ajomin: 120,
            haku: { toNumber: () => 4.1 },
            hauk: { toNumber: () => 4.2 },
            yva: { toNumber: () => 4.3 },
            hlo: { toNumber: () => 0.1 },
            alo: { toNumber: () => 0.2 },
            tja: { toNumber: () => 0.3 },
            pin: { toNumber: () => 5.6 },
            huomautusTeksti: "Ensimmäisen erän huomautus",
          },
        ],
        trialEvent: {
          id: "event-1",
          trialRuleWindowId: "trw_post_20230801",
          koekunta: "Helsinki",
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          ylituomariNimi: "Chief",
        },
      },
    ]);

    const result = await getBeagleTrialsForDogDb("dog-1", {
      includeEras: true,
    });

    const select = trialEntryFindManyMock.mock.calls[0]?.[0].select;
    expect(select.eras).toEqual({
      orderBy: { era: "asc" },
      select: {
        era: true,
        alkoi: true,
        hakumin: true,
        ajomin: true,
        haku: true,
        hauk: true,
        yva: true,
        hlo: true,
        alo: true,
        tja: true,
        pin: true,
        huomautusTeksti: true,
      },
    });
    expect(select.eras.select.lisatiedot).toBeUndefined();
    expect(result[0]?.eras).toEqual([
      {
        era: 1,
        alkoi: "08:15",
        hakumin: 35,
        ajomin: 120,
        haku: 4.1,
        hauk: 4.2,
        yva: 4.3,
        hlo: 0.1,
        alo: 0.2,
        tja: 0.3,
        pin: 5.6,
        huomautusTeksti: "Ensimmäisen erän huomautus",
      },
    ]);
  });
});

// ---------------------------------------------------------------------------
// getBeagleTrialSummarySourceForDogDb
// ---------------------------------------------------------------------------

describe("getBeagleTrialSummarySourceForDogDb", () => {
  beforeEach(() => {
    trialEntryFindManyMock.mockReset();
  });

  it("loads raw summary source rows for the dog and whole breed", async () => {
    const decimal = (value: number) => ({ toNumber: () => value });
    const dogDate = new Date("2005-08-20T00:00:00.000Z");
    const breedDate = new Date("2001-09-01T00:00:00.000Z");

    trialEntryFindManyMock
      .mockResolvedValueOnce([
        {
          piste: decimal(80),
          haku: decimal(8),
          hauk: decimal(6),
          yva: decimal(5),
          hlo: decimal(0),
          alo: decimal(0),
          pin: decimal(4),
          trialEvent: {
            koepaiva: dogDate,
            trialRuleWindowId: "trw_range_2005_2011",
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          piste: decimal(70),
          haku: decimal(5),
          hauk: decimal(0),
          yva: decimal(4),
          hlo: decimal(2),
          alo: decimal(1),
          pin: decimal(3),
          trialEvent: {
            koepaiva: breedDate,
            trialRuleWindowId: "trw_pre_20020801",
          },
        },
      ]);

    const result = await getBeagleTrialSummarySourceForDogDb("dog-1");

    expect(trialEntryFindManyMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ where: { dogId: "dog-1" } }),
    );
    expect(trialEntryFindManyMock).toHaveBeenNthCalledWith(
      2,
      expect.not.objectContaining({ where: expect.anything() }),
    );
    expect(result).toEqual({
      dogRows: [
        {
          piste: 80,
          haku: 8,
          hauk: 6,
          yva: 5,
          hlo: 0,
          alo: 0,
          pin: 4,
          koepaiva: dogDate,
          trialRuleWindowId: "trw_range_2005_2011",
        },
      ],
      breedRows: [
        {
          piste: 70,
          haku: 5,
          hauk: 0,
          yva: 4,
          hlo: 2,
          alo: 1,
          pin: 3,
          koepaiva: breedDate,
          trialRuleWindowId: "trw_pre_20020801",
        },
      ],
    });
  });
});
