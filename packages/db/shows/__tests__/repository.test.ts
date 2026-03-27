import { beforeEach, describe, expect, it, vi } from "vitest";
import { DogSex } from "@prisma/client";

const {
  showEventFindManyMock,
  showEventFindFirstMock,
  showEntryFindManyMock,
  showResultDefinitionFindManyMock,
  prismaMock,
} = vi.hoisted(() => {
  const showEventFindMany = vi.fn();
  const showEventFindFirst = vi.fn();
  const showEntryFindMany = vi.fn();
  const showResultDefinitionFindMany = vi.fn();

  return {
    showEventFindManyMock: showEventFindMany,
    showEventFindFirstMock: showEventFindFirst,
    showEntryFindManyMock: showEntryFindMany,
    showResultDefinitionFindManyMock: showResultDefinitionFindMany,
    prismaMock: {
      showEvent: {
        findMany: showEventFindMany,
        findFirst: showEventFindFirst,
      },
      showEntry: {
        findMany: showEntryFindMany,
      },
      showResultDefinition: {
        findMany: showResultDefinitionFindMany,
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

function makeDefinition(
  code: string,
  categoryCode: string,
  categorySortOrder: number,
  sortOrder: number,
  isVisibleByDefault = true,
) {
  return {
    code,
    sortOrder,
    isVisibleByDefault,
    category: {
      code: categoryCode,
      sortOrder: categorySortOrder,
    },
  };
}

describe("searchBeagleShowsDb", () => {
  beforeEach(() => {
    showEventFindManyMock.mockReset();
    showEventFindFirstMock.mockReset();
    showEntryFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockReset();
  });

  it("groups canonical events and returns available years", async () => {
    showEventFindManyMock
      .mockResolvedValueOnce([
        { eventDate: new Date("2025-08-01T00:00:00.000Z") },
        { eventDate: new Date("2024-07-01T00:00:00.000Z") },
      ])
      .mockResolvedValueOnce([
        {
          id: "event-1",
          eventLookupKey: "show-event-1",
          eventDate: new Date("2025-06-01T00:00:00.000Z"),
          eventPlace: "Helsinki",
          _count: { entries: 7 },
        },
        {
          id: "event-2",
          eventLookupKey: "show-event-2",
          eventDate: new Date("2025-09-01T00:00:00.000Z"),
          eventPlace: "Turku",
          _count: { entries: 4 },
        },
      ]);
    showEntryFindManyMock.mockResolvedValueOnce([
      { showEventId: "event-2", judge: "Judge B" },
      { showEventId: "event-1", judge: "Judge A" },
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
    expect(result.items.map((row) => row.eventKey)).toEqual([
      "show-event-2",
      "show-event-1",
    ]);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(showEntryFindManyMock).toHaveBeenCalledWith({
      where: { showEventId: { in: ["event-2", "event-1"] } },
      select: {
        showEventId: true,
        judge: true,
      },
    });

    const args = showEventFindManyMock.mock.calls[1]?.[0] as {
      where: { eventDate: { gte: Date; lt: Date } };
    };
    expect(args.where.eventDate.gte.toISOString()).toBe(
      "2024-12-31T22:00:00.000Z",
    );
    expect(args.where.eventDate.lt.toISOString()).toBe(
      "2025-12-31T22:00:00.000Z",
    );
  });

  it("applies range filter and clamps pagination page", async () => {
    const dateFrom = new Date("2025-01-01T00:00:00.000Z");
    const dateTo = new Date("2026-01-01T00:00:00.000Z");

    showEventFindManyMock
      .mockResolvedValueOnce([{ eventDate: new Date("2025-02-01T00:00:00Z") }])
      .mockResolvedValueOnce([
        {
          id: "event-a",
          eventLookupKey: "show-event-a",
          eventDate: new Date("2025-03-01T00:00:00.000Z"),
          eventPlace: "Akaa",
          _count: { entries: 1 },
        },
        {
          id: "event-b",
          eventLookupKey: "show-event-b",
          eventDate: new Date("2025-04-01T00:00:00.000Z"),
          eventPlace: "Borga",
          _count: { entries: 1 },
        },
      ]);
    showEntryFindManyMock.mockResolvedValueOnce([
      { showEventId: "event-b", judge: "Judge B" },
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

    const args = showEventFindManyMock.mock.calls[1]?.[0] as {
      where: { eventDate: { gte: Date; lt: Date } };
    };
    expect(args.where.eventDate.gte.toISOString()).toBe(
      "2024-12-31T22:00:00.000Z",
    );
    expect(args.where.eventDate.lt.toISOString()).toBe(
      "2025-12-31T22:00:00.000Z",
    );
  });

  it("returns null judge when canonical event has multiple judges", async () => {
    showEventFindManyMock
      .mockResolvedValueOnce([{ eventDate: new Date("2025-06-01T00:00:00Z") }])
      .mockResolvedValueOnce([
        {
          id: "event-1",
          eventLookupKey: "show-event-1",
          eventDate: new Date("2025-06-01T00:00:00.000Z"),
          eventPlace: "Helsinki",
          _count: { entries: 2 },
        },
      ]);
    showEntryFindManyMock.mockResolvedValueOnce([
      { showEventId: "event-1", judge: "Judge A" },
      { showEventId: "event-1", judge: "Judge B" },
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

  it("orders events deterministically when date and place are the same", async () => {
    showEventFindManyMock
      .mockResolvedValueOnce([{ eventDate: new Date("2025-06-01T00:00:00Z") }])
      .mockResolvedValueOnce([
        {
          id: "event-b",
          eventLookupKey: "show-event-b",
          eventDate: new Date("2025-06-01T00:00:00.000Z"),
          eventPlace: "Helsinki",
          _count: { entries: 1 },
        },
        {
          id: "event-a",
          eventLookupKey: "show-event-a",
          eventDate: new Date("2025-06-01T00:00:00.000Z"),
          eventPlace: "Helsinki",
          _count: { entries: 1 },
        },
      ]);
    showEntryFindManyMock.mockResolvedValueOnce([
      { showEventId: "event-b", judge: "Judge B" },
      { showEventId: "event-a", judge: "Judge A" },
    ]);

    const result = await searchBeagleShowsDb({
      mode: "year",
      year: 2025,
      sort: "date-desc",
      page: 1,
      pageSize: 10,
    });

    expect(result.items.map((row) => row.eventKey)).toEqual([
      "show-event-a",
      "show-event-b",
    ]);
  });
});

describe("getBeagleShowDetailsDb", () => {
  beforeEach(() => {
    showEventFindManyMock.mockReset();
    showEventFindFirstMock.mockReset();
    showEntryFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockResolvedValue([
      { code: "ERI", sortOrder: 10 },
      { code: "EH", sortOrder: 20 },
      { code: "H", sortOrder: 30 },
      { code: "T", sortOrder: 40 },
      { code: "EVA", sortOrder: 50 },
      { code: "HYL", sortOrder: 60 },
    ]);
  });

  it("returns null when show does not exist", async () => {
    showEventFindManyMock.mockResolvedValue([]);

    const result = await getBeagleShowDetailsDb({
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    expect(result).toBeNull();
  });

  it("maps detail rows from canonical entries into structured fields", async () => {
    showEventFindManyMock.mockResolvedValue([
      {
        eventLookupKey: "show-event-1",
        eventDate: new Date("2025-06-01T12:34:00.000Z"),
        eventPlace: "Helsinki",
        entries: [
          {
            id: "r3",
            judge: "Judge Main",
            heightText: null,
            dog: {
              id: "d3",
              name: "Cora",
              sex: DogSex.UNKNOWN,
              registrations: [{ registrationNo: "FI-300/25" }],
            },
            resultItems: [
              {
                valueCode: null,
                valueNumeric: 2,
                isAwarded: true,
                definition: makeDefinition(
                  "LEGACY-LAATUARVOSTELU",
                  "LAATUARVOSTELU",
                  20,
                  70,
                  false,
                ),
              },
            ],
          },
          {
            id: "r2",
            judge: "Judge Main",
            heightText: "39",
            dog: {
              id: "d2",
              name: "Bella",
              sex: DogSex.FEMALE,
              registrations: [{ registrationNo: "FI-200/25" }],
            },
            resultItems: [
              {
                valueCode: null,
                valueNumeric: null,
                isAwarded: true,
                definition: makeDefinition("NUO", "KILPAILULUOKKA", 10, 40),
              },
              {
                valueCode: null,
                valueNumeric: null,
                isAwarded: true,
                definition: makeDefinition("ERI", "LAATUARVOSTELU", 20, 10),
              },
            ],
          },
          {
            id: "r4",
            judge: "Judge Main",
            heightText: "40",
            dog: {
              id: "d4",
              name: "Zorro",
              sex: DogSex.MALE,
              registrations: [{ registrationNo: "FI-050/25" }],
            },
            resultItems: [
              {
                valueCode: null,
                valueNumeric: null,
                isAwarded: true,
                definition: makeDefinition("AVO", "KILPAILULUOKKA", 10, 50),
              },
              {
                valueCode: null,
                valueNumeric: null,
                isAwarded: true,
                definition: makeDefinition("ERI", "LAATUARVOSTELU", 20, 10),
              },
            ],
          },
          {
            id: "r1",
            judge: "Judge Main",
            heightText: "41.5",
            dog: {
              id: "d1",
              name: "Aatu",
              sex: DogSex.MALE,
              registrations: [{ registrationNo: "FI-100/25" }],
            },
            resultItems: [
              {
                valueCode: null,
                valueNumeric: null,
                isAwarded: true,
                definition: makeDefinition("AVO", "KILPAILULUOKKA", 10, 50),
              },
              {
                valueCode: null,
                valueNumeric: 0,
                isAwarded: true,
                definition: makeDefinition("SIJOITUS", "SIJOITUS", 70, 10),
              },
              {
                valueCode: null,
                valueNumeric: null,
                isAwarded: true,
                definition: makeDefinition("EH", "LAATUARVOSTELU", 20, 20),
              },
            ],
          },
        ],
      },
    ]);

    const result = await getBeagleShowDetailsDb({
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    const args = showEventFindManyMock.mock.calls[0]?.[0] as {
      where: {
        eventDate: { gte: Date; lt: Date };
        eventPlace: string;
        entries: { some: Record<string, never> };
      };
      take: number;
    };
    expect(args.where.eventDate.gte.toISOString()).toBe(
      "2025-05-31T21:00:00.000Z",
    );
    expect(args.where.eventDate.lt.toISOString()).toBe(
      "2025-06-01T21:00:00.000Z",
    );
    expect(args.where.eventPlace).toBe("Helsinki");
    expect(args.where.entries).toEqual({ some: {} });
    expect(args.take).toBe(2);

    expect(result).not.toBeNull();
    expect(result?.eventKey).toBe("show-event-1");
    expect(result?.dogCount).toBe(4);
    expect(result?.judge).toBe("Judge Main");
    expect(result?.items.map((item) => item.id)).toEqual([
      "r1",
      "r4",
      "r2",
      "r3",
    ]);
    expect(result?.items[0]).toMatchObject({
      sex: "U",
      registrationNo: "FI-100/25",
      classCode: "AVO",
      qualityGrade: "EH",
      classPlacement: null,
      awards: [],
      heightCm: 41.5,
    });
    expect(result?.items[1]).toMatchObject({
      sex: "U",
      registrationNo: "FI-050/25",
      classCode: "AVO",
      qualityGrade: "ERI",
      classPlacement: null,
      awards: [],
      heightCm: 40,
    });
    expect(result?.items[3]).toMatchObject({
      sex: "-",
      classCode: null,
      qualityGrade: "2",
      classPlacement: null,
      awards: [],
      heightCm: null,
    });
  });

  it("keeps unlinked canonical entries visible with snapshot identity", async () => {
    showEventFindManyMock.mockResolvedValue([
      {
        eventLookupKey: "show-event-2",
        eventDate: new Date("2025-06-01T12:34:00.000Z"),
        eventPlace: "Helsinki",
        entries: [
          {
            id: "linked",
            judge: "Judge Main",
            heightText: "40",
            registrationNoSnapshot: "FI-111/25",
            dog: {
              id: "dog-1",
              name: "Linked Dog",
              sex: DogSex.MALE,
              registrations: [{ registrationNo: "FI-111/25" }],
            },
            resultItems: [],
          },
          {
            id: "unlinked",
            judge: "Judge Main",
            heightText: "41",
            registrationNoSnapshot: "FI-222/25",
            dogNameSnapshot: "Snapshot Dog",
            dog: null,
            resultItems: [],
          },
        ],
      },
    ]);

    const result = await getBeagleShowDetailsDb({
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });

    expect(result?.dogCount).toBe(2);
    expect(result?.items).toEqual([
      expect.objectContaining({
        id: "linked",
        dogId: "dog-1",
        registrationNo: "FI-111/25",
      }),
      expect.objectContaining({
        id: "unlinked",
        dogId: null,
        registrationNo: "FI-222/25",
        name: "Snapshot Dog",
        sex: "-",
        heightCm: 41,
      }),
    ]);
  });
});

describe("getBeagleShowsForDogDb", () => {
  beforeEach(() => {
    showEventFindManyMock.mockReset();
    showEventFindFirstMock.mockReset();
    showEntryFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockResolvedValue([
      { code: "ERI", sortOrder: 10 },
      { code: "EH", sortOrder: 20 },
      { code: "H", sortOrder: 30 },
      { code: "T", sortOrder: 40 },
      { code: "EVA", sortOrder: 50 },
      { code: "HYL", sortOrder: 60 },
    ]);
  });

  it("maps canonical dog show rows in date-desc order", async () => {
    showEntryFindManyMock.mockResolvedValue([
      {
        id: "s2",
        eventKey: "show-event-2",
        judge: "Judge B",
        heightText: "39.5",
        critiqueText: "Excellent",
        showEvent: {
          eventLookupKey: "show-event-2",
          eventPlace: "Lahti",
          eventDate: new Date("2025-06-02T00:00:00.000Z"),
        },
        resultItems: [
          {
            valueCode: null,
            valueNumeric: null,
            isAwarded: true,
            definition: makeDefinition("JUN", "KILPAILULUOKKA", 10, 30),
          },
          {
            valueCode: null,
            valueNumeric: null,
            isAwarded: true,
            definition: makeDefinition("ERI", "LAATUARVOSTELU", 20, 10),
          },
        ],
      },
      {
        id: "s1",
        eventKey: "show-event-1",
        judge: null,
        heightText: null,
        critiqueText: null,
        showEvent: {
          eventLookupKey: "show-event-1",
          eventPlace: "Helsinki",
          eventDate: new Date("2025-06-01T00:00:00.000Z"),
        },
        resultItems: [],
      },
    ]);

    const result = await getBeagleShowsForDogDb("dog-1");

    expect(showEntryFindManyMock).toHaveBeenCalledWith({
      where: { dogId: "dog-1" },
      select: expect.any(Object),
      orderBy: [
        { showEvent: { eventDate: "desc" } },
        { showEvent: { eventPlace: "asc" } },
        { id: "asc" },
      ],
    });
    expect(result).toEqual([
      {
        id: "s2",
        eventKey: "show-event-2",
        place: "Lahti",
        date: new Date("2025-06-02T00:00:00.000Z"),
        showType: null,
        classCode: "JUN",
        qualityGrade: "ERI",
        classPlacement: null,
        pupn: null,
        awards: [],
        critiqueText: "Excellent",
        judge: "Judge B",
        heightCm: 39.5,
      },
      {
        id: "s1",
        eventKey: "show-event-1",
        place: "Helsinki",
        date: new Date("2025-06-01T00:00:00.000Z"),
        showType: null,
        classCode: null,
        qualityGrade: null,
        classPlacement: null,
        pupn: null,
        awards: [],
        critiqueText: null,
        judge: null,
        heightCm: null,
      },
    ]);
  });
});
