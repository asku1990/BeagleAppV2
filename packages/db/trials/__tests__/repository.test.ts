import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

const { trialEventFindManyMock, trialEntryFindManyMock, prismaMock } =
  vi.hoisted(() => {
    const trialEventFindMany = vi.fn();
    const trialEntryFindMany = vi.fn();

    return {
      trialEventFindManyMock: trialEventFindMany,
      trialEntryFindManyMock: trialEntryFindMany,
      prismaMock: {
        trialEvent: {
          findMany: trialEventFindMany,
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
  getBeagleTrialsForDogDb,
  searchBeagleTrialsDb,
} from "../repository";

// ---------------------------------------------------------------------------
// searchBeagleTrialsDb
// ---------------------------------------------------------------------------

describe("searchBeagleTrialsDb", () => {
  beforeEach(() => {
    trialEventFindManyMock.mockReset();
  });

  it("groups TrialEvent rows by koepaiva+koekunta and returns available dates", async () => {
    trialEventFindManyMock
      // call 1: distinct koepaiva (available dates)
      .mockResolvedValueOnce([
        { koepaiva: new Date("2025-08-01T00:00:00.000Z") },
        { koepaiva: new Date("2024-07-01T00:00:00.000Z") },
      ])
      // call 2: event rows in date window
      .mockResolvedValueOnce([
        {
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          koekunta: "Helsinki",
          ylituomariNimi: "Judge A",
          _count: { entries: 7 },
        },
        {
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
    expect(result.items.map((r) => r.eventPlace)).toEqual([
      "Turku",
      "Helsinki",
    ]);
    expect(result.items[0]?.dogCount).toBe(4);
    expect(result.items[0]?.judge).toBe("Judge B");
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);

    // Verify the date window was forwarded to the event-rows query.
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

  it("folds multiple TrialEvent rows with same koepaiva+koekunta into one public row", async () => {
    trialEventFindManyMock
      .mockResolvedValueOnce([
        { koepaiva: new Date("2025-06-01T00:00:00.000Z") },
      ])
      .mockResolvedValueOnce([
        {
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          koekunta: "Helsinki",
          ylituomariNimi: "Judge A",
          _count: { entries: 5 },
        },
        {
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

    expect(result.total).toBe(1);
    expect(result.items[0]?.dogCount).toBe(8);
    expect(result.items[0]?.judge).toBe("Judge A");
  });

  it("returns null judge when folded events disagree on ylituomariNimi", async () => {
    trialEventFindManyMock
      .mockResolvedValueOnce([
        { koepaiva: new Date("2025-06-01T00:00:00.000Z") },
      ])
      .mockResolvedValueOnce([
        {
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          koekunta: "Helsinki",
          ylituomariNimi: "Judge A",
          _count: { entries: 2 },
        },
        {
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          koekunta: "Helsinki",
          ylituomariNimi: "Judge B",
          _count: { entries: 2 },
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

  it("folds events on the same Helsinki business date even when koepaiva timestamps differ", async () => {
    // 2025-05-31T21:00:00Z = 2025-06-01T00:00:00 Helsinki (EEST UTC+3)
    // 2025-06-01T00:00:00Z = 2025-06-01T03:00:00 Helsinki — same calendar day
    trialEventFindManyMock
      .mockResolvedValueOnce([
        { koepaiva: new Date("2025-05-31T21:00:00.000Z") },
      ])
      .mockResolvedValueOnce([
        {
          koepaiva: new Date("2025-05-31T21:00:00.000Z"),
          koekunta: "Helsinki",
          ylituomariNimi: "Judge A",
          _count: { entries: 3 },
        },
        {
          koepaiva: new Date("2025-06-01T00:00:00.000Z"),
          koekunta: "Helsinki",
          ylituomariNimi: "Judge A",
          _count: { entries: 4 },
        },
      ]);

    const result = await searchBeagleTrialsDb({
      dateFrom: new Date("2025-05-31T21:00:00.000Z"),
      dateTo: new Date("2025-06-01T21:00:00.000Z"),
      sort: "date-desc",
      page: 1,
      pageSize: 10,
    });

    // Both events fall on 2025-06-01 in Helsinki — must fold into one public row.
    expect(result.total).toBe(1);
    expect(result.items[0]?.dogCount).toBe(7);
    expect(result.items[0]?.judge).toBe("Judge A");
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
          koepaiva: new Date("2025-03-01T00:00:00.000Z"),
          koekunta: "Akaa",
          ylituomariNimi: "Judge A",
          _count: { entries: 1 },
        },
        {
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
  });
});

// ---------------------------------------------------------------------------
// getBeagleTrialDetailsDb
// ---------------------------------------------------------------------------

describe("getBeagleTrialDetailsDb", () => {
  beforeEach(() => {
    trialEventFindManyMock.mockReset();
  });

  it("returns null when no TrialEvent is found", async () => {
    trialEventFindManyMock.mockResolvedValue([]);

    const result = await getBeagleTrialDetailsDb({
      eventDateStart: new Date("2025-05-31T21:00:00.000Z"),
      eventDateEndExclusive: new Date("2025-06-01T21:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    expect(result).toBeNull();
  });

  it("returns null when TrialEvent exists but has no entries", async () => {
    trialEventFindManyMock.mockResolvedValue([
      {
        koepaiva: new Date("2025-06-01T00:00:00.000Z"),
        koekunta: "Helsinki",
        ylituomariNimi: "Judge Main",
        entries: [],
      },
    ]);

    const result = await getBeagleTrialDetailsDb({
      eventDateStart: new Date("2025-05-31T21:00:00.000Z"),
      eventDateEndExclusive: new Date("2025-06-01T21:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    expect(result).toBeNull();
  });

  it("maps TrialEntry fields, resolves judges, and sorts by points desc", async () => {
    trialEventFindManyMock.mockResolvedValue([
      {
        koepaiva: new Date("2025-06-01T12:34:00.000Z"),
        koekunta: "Helsinki",
        ylituomariNimi: "Judge Main",
        entries: [
          {
            // unlinked entry — dogId null, no dog relation
            id: "r3",
            dogId: null,
            rekisterinumeroSnapshot: "FI-300/25",
            ke: null,
            pa: null,
            lk: null,
            sija: null,
            piste: null,
            tuom1: null,
            ylituomariNimiSnapshot: null,
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
            // linked dog, no tuom1 — falls back to event judge
            id: "r2",
            dogId: "d2",
            rekisterinumeroSnapshot: "FI-200/25",
            ke: "P",
            pa: "2",
            lk: "A",
            sija: "2",
            piste: { toNumber: () => 72.5 },
            tuom1: null,
            ylituomariNimiSnapshot: null,
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
            // linked dog with per-entry ylituomari snapshot
            id: "r1",
            dogId: "d1",
            rekisterinumeroSnapshot: "FI-100/25",
            ke: "L",
            pa: "1",
            lk: "V",
            sija: "1",
            piste: { toNumber: () => 88.25 },
            tuom1: "Judge Group",
            ylituomariNimiSnapshot: "Judge Snapshot",
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

    // r1: linked dog, tuom1 takes precedence over event judge
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
      judge: "Judge Snapshot",
    });

    // r2: linked dog, no tuom1 — falls back to event-level judge
    expect(result?.items[1]).toMatchObject({
      dogId: "d2",
      sex: "N",
      weather: "P",
      points: 72.5,
      judge: "Judge Main",
    });

    // r3: unlinked entry — dogId null, name falls back to registrationNo snapshot
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

  it("folds entries from multiple TrialEvent rows with same koepaiva+koekunta", async () => {
    trialEventFindManyMock.mockResolvedValue([
      {
        koepaiva: new Date("2025-06-01T00:00:00.000Z"),
        koekunta: "Helsinki",
        ylituomariNimi: "Judge A",
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
            ylituomariNimiSnapshot: null,
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
      },
      {
        koepaiva: new Date("2025-06-01T00:00:00.000Z"),
        koekunta: "Helsinki",
        ylituomariNimi: "Judge A",
        entries: [
          {
            id: "r2",
            dogId: "d2",
            rekisterinumeroSnapshot: "FI-200/25",
            ke: null,
            pa: null,
            lk: null,
            sija: null,
            piste: { toNumber: () => 70 },
            tuom1: null,
            ylituomariNimiSnapshot: null,
            haku: null,
            hauk: null,
            yva: null,
            hlo: null,
            alo: null,
            tja: null,
            pin: null,
            dog: { name: "Bella", sex: DogSex.FEMALE },
          },
        ],
      },
    ]);

    const result = await getBeagleTrialDetailsDb({
      eventDateStart: new Date("2025-05-31T21:00:00.000Z"),
      eventDateEndExclusive: new Date("2025-06-01T21:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    expect(result?.dogCount).toBe(2);
    expect(result?.judge).toBe("Judge A");
    expect(result?.items.map((item) => item.id)).toEqual(["r1", "r2"]);
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
        lk: "V",
        sija: "1",
        piste: { toNumber: () => 88.25 },
        pa: "1",
        tuom1: "Judge A",
        ylituomariNimiSnapshot: "Judge Snapshot",
        haku: { toNumber: () => 4.1 },
        hauk: { toNumber: () => 4.2 },
        yva: { toNumber: () => 4.3 },
        hlo: { toNumber: () => 0.1 },
        alo: { toNumber: () => 0.2 },
        tja: { toNumber: () => 0.3 },
        pin: { toNumber: () => 5.6 },
        trialEvent: {
          koekunta: "Lahti",
          koepaiva: new Date("2025-06-02T00:00:00.000Z"),
          ylituomariNimi: "Chief Judge",
        },
      },
      {
        id: "t1",
        ke: null,
        lk: null,
        sija: null,
        piste: null,
        pa: null,
        tuom1: null,
        ylituomariNimiSnapshot: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
        trialEvent: {
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
        lk: true,
        sija: true,
        piste: true,
        pa: true,
        tuom1: true,
        ylituomariNimiSnapshot: true,
        haku: true,
        hauk: true,
        yva: true,
        hlo: true,
        alo: true,
        tja: true,
        pin: true,
        trialEvent: {
          select: {
            koekunta: true,
            koepaiva: true,
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
        place: "Lahti",
        date: new Date("2025-06-02T00:00:00.000Z"),
        weather: "L",
        classCode: "V",
        rank: "1",
        points: 88.25,
        award: "1",
        judge: "Judge Snapshot",
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

  it("prefers entry-level ylituomari snapshot, then tuom1, then event judge", async () => {
    trialEntryFindManyMock.mockResolvedValue([
      {
        id: "t1",
        ke: null,
        lk: null,
        sija: null,
        piste: null,
        pa: null,
        tuom1: null,
        ylituomariNimiSnapshot: null,
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
        trialEvent: {
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
        tuom1: "Group Judge",
        ylituomariNimiSnapshot: "Entry Chief",
        haku: null,
        hauk: null,
        yva: null,
        hlo: null,
        alo: null,
        tja: null,
        pin: null,
        trialEvent: {
          koekunta: "Turku",
          koepaiva: new Date("2025-06-02T00:00:00.000Z"),
          ylituomariNimi: "Chief",
        },
      },
    ]);

    const result = await getBeagleTrialsForDogDb("dog-1");

    expect(result[0]?.judge).toBe("Chief"); // no entry judge -> event fallback
    expect(result[1]?.judge).toBe("Entry Chief"); // snapshot takes precedence
  });
});
