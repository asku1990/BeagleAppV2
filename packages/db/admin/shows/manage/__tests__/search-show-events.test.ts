import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchAdminShowEventsDb } from "../search-show-events";

const { showEventCountMock, showEventFindManyMock, prismaMock } = vi.hoisted(
  () => {
    const showEventCount = vi.fn();
    const showEventFindMany = vi.fn();

    return {
      showEventCountMock: showEventCount,
      showEventFindManyMock: showEventFindMany,
      prismaMock: {
        showEvent: {
          count: showEventCount,
          findMany: showEventFindMany,
        },
      },
    };
  },
);

vi.mock("@db/core/prisma", () => ({
  prisma: prismaMock,
}));

describe("searchAdminShowEventsDb", () => {
  beforeEach(() => {
    showEventCountMock.mockReset();
    showEventFindManyMock.mockReset();
  });

  it("filters events, clamps page numbers, and collapses judges", async () => {
    showEventCountMock.mockResolvedValueOnce(2);
    showEventFindManyMock.mockResolvedValueOnce([
      {
        eventLookupKey: "show-event-2",
        eventDate: new Date("2025-05-10T00:00:00.000Z"),
        eventPlace: "Turku",
        eventCity: "Turku",
        eventName: "Kevätkarnevaali",
        eventType: "NAYTTELY",
        organizer: "Turun Beagle-yhdistys",
        entries: [{ judge: "Judge B" }, { judge: "Judge B" }],
      },
    ]);

    const result = await searchAdminShowEventsDb({
      query: "Turku",
      page: 9,
      pageSize: 1,
      sort: "date-asc",
    });

    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(2);
    expect(result.items).toEqual([
      {
        eventKey: "show-event-2",
        eventDate: new Date("2025-05-10T00:00:00.000Z"),
        eventPlace: "Turku",
        eventCity: "Turku",
        eventName: "Kevätkarnevaali",
        eventType: "NAYTTELY",
        organizer: "Turun Beagle-yhdistys",
        judge: "Judge B",
        dogCount: 2,
      },
    ]);

    expect(showEventCountMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.any(Array),
        }),
      }),
    );
    expect(showEventFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 1,
        take: 1,
        orderBy: [
          { eventDate: "asc" },
          { eventPlace: "asc" },
          { eventLookupKey: "asc" },
        ],
      }),
    );
  });

  it("keeps zero-entry events visible in admin search", async () => {
    showEventCountMock.mockResolvedValueOnce(1);
    showEventFindManyMock.mockResolvedValueOnce([
      {
        eventLookupKey: "show-event-empty",
        eventDate: new Date("2025-06-02T00:00:00.000Z"),
        eventPlace: "Lahti",
        eventCity: "Lahti",
        eventName: "Tyhjä tapahtuma",
        eventType: "NAYTTELY",
        organizer: "Lahti Beagle Club",
        entries: [],
      },
    ]);

    const result = await searchAdminShowEventsDb({
      page: 1,
      pageSize: 20,
      sort: "date-desc",
    });

    expect(result.items).toEqual([
      {
        eventKey: "show-event-empty",
        eventDate: new Date("2025-06-02T00:00:00.000Z"),
        eventPlace: "Lahti",
        eventCity: "Lahti",
        eventName: "Tyhjä tapahtuma",
        eventType: "NAYTTELY",
        organizer: "Lahti Beagle Club",
        judge: null,
        dogCount: 0,
      },
    ]);
    expect(showEventCountMock).toHaveBeenCalledWith({ where: {} });
  });
});
