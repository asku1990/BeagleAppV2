import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminShowEventDetailsDb } from "../get-show-event-details";

const { showEventFindFirstMock, showEventFindManyMock, prismaMock } =
  vi.hoisted(() => {
    const showEventFindFirst = vi.fn();
    const showEventFindMany = vi.fn();

    return {
      showEventFindFirstMock: showEventFindFirst,
      showEventFindManyMock: showEventFindMany,
      prismaMock: {
        showEvent: {
          findFirst: showEventFindFirst,
          findMany: showEventFindMany,
        },
      },
    };
  });

vi.mock("../../../../core/prisma", () => ({
  prisma: prismaMock,
}));

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

describe("getAdminShowEventDetailsDb", () => {
  beforeEach(() => {
    showEventFindFirstMock.mockReset();
    showEventFindManyMock.mockReset();
  });

  it("maps the selected event and projects structured entry values", async () => {
    showEventFindFirstMock.mockResolvedValueOnce({
      eventLookupKey: "show-event-1",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventCity: "Helsinki",
      eventName: "Kevätnäyttely",
      eventType: "NAYTTELY",
      organizer: "Helsingin Beaglekerho",
      entries: [
        {
          id: "entry-1",
          judge: "Anna Judge",
          critiqueText: "Erittäin tasapainoinen esiintyminen.",
          heightText: "39.5 cm",
          registrationNoSnapshot: "FI12345/21",
          dogNameSnapshot: "Metsapolun Kide",
          resultItems: [
            {
              valueCode: "PU",
              valueNumeric: 1,
              isAwarded: false,
              definition: makeDefinition("AVO", "KILPAILULUOKKA", 1, 1),
            },
            {
              valueCode: "ERI",
              valueNumeric: 1,
              isAwarded: true,
              definition: makeDefinition("ERI", "LAATUARVOSTELU", 2, 1, true),
            },
            {
              valueCode: null,
              valueNumeric: 1,
              isAwarded: true,
              definition: makeDefinition("SIJOITUS", "MUU", 3, 1),
            },
            {
              valueCode: "PU",
              valueNumeric: 1,
              isAwarded: true,
              definition: makeDefinition("PUPN", "MUU", 4, 1),
            },
            {
              valueCode: "SERT",
              valueNumeric: null,
              isAwarded: true,
              definition: makeDefinition("SERT", "PALKINTO", 5, 1),
            },
          ],
        },
      ],
    });

    const result = await getAdminShowEventDetailsDb({
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventKey: "show-event-1",
    });

    expect(result).toEqual({
      eventKey: "show-event-1",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventCity: "Helsinki",
      eventName: "Kevätnäyttely",
      eventType: "NAYTTELY",
      organizer: "Helsingin Beaglekerho",
      judge: "Anna Judge",
      dogCount: 1,
      items: [
        {
          id: "entry-1",
          registrationNo: "FI12345/21",
          dogName: "Metsapolun Kide",
          judge: "Anna Judge",
          critiqueText: "Erittäin tasapainoinen esiintyminen.",
          heightCm: 39.5,
          showType: "NAYTTELY",
          classCode: "AVO",
          qualityGrade: "ERI",
          classPlacement: 1,
          pupn: "PU1",
          awards: ["SERT"],
        },
      ],
    });

    expect(showEventFindFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          eventLookupKey: "show-event-1",
        }),
      }),
    );
  });

  it("returns null when the event lookup is ambiguous", async () => {
    showEventFindManyMock.mockResolvedValueOnce([
      {
        eventLookupKey: "show-event-a",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        eventCity: null,
        eventName: null,
        eventType: null,
        organizer: null,
        entries: [],
      },
      {
        eventLookupKey: "show-event-b",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        eventCity: null,
        eventName: null,
        eventType: null,
        organizer: null,
        entries: [],
      },
    ]);

    await expect(
      getAdminShowEventDetailsDb({
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
      }),
    ).resolves.toBeNull();
  });

  it("returns an empty event instead of hiding it when all entries are removed", async () => {
    showEventFindFirstMock.mockResolvedValueOnce({
      eventLookupKey: "show-event-empty",
      eventDate: new Date("2025-06-03T00:00:00.000Z"),
      eventPlace: "Oulu",
      eventCity: "Oulu",
      eventName: "Kesänäyttely",
      eventType: "NAYTTELY",
      organizer: "Oulu Beaglekerho",
      entries: [],
    });

    const result = await getAdminShowEventDetailsDb({
      eventDate: new Date("2025-06-03T00:00:00.000Z"),
      eventPlace: "Oulu",
      eventKey: "show-event-empty",
    });

    expect(result).toEqual({
      eventKey: "show-event-empty",
      eventDate: new Date("2025-06-03T00:00:00.000Z"),
      eventPlace: "Oulu",
      eventCity: "Oulu",
      eventName: "Kesänäyttely",
      eventType: "NAYTTELY",
      organizer: "Oulu Beaglekerho",
      judge: null,
      dogCount: 0,
      items: [],
    });
  });
});
