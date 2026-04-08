import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminShowEventWriteDb } from "../update-show-event";

const {
  prismaTransactionMock,
  showEventFindFirstMock,
  showEventFindManyMock,
  showEventFindUniqueMock,
  showEventUpdateMock,
  showEntryUpdateMock,
  showResultItemUpdateMock,
} = vi.hoisted(() => {
  const showEventFindFirst = vi.fn();
  const showEventFindMany = vi.fn();
  const showEventFindUnique = vi.fn();
  const showEventUpdate = vi.fn();
  const showEntryUpdate = vi.fn();
  const showResultItemUpdate = vi.fn();

  const tx = {
    showEvent: {
      findFirst: showEventFindFirst,
      findMany: showEventFindMany,
      findUnique: showEventFindUnique,
      update: showEventUpdate,
    },
    showEntry: {
      update: showEntryUpdate,
    },
    showResultItem: {
      update: showResultItemUpdate,
    },
  };

  return {
    prismaTransactionMock: vi.fn(async (callback) => callback(tx)),
    showEventFindFirstMock: showEventFindFirst,
    showEventFindManyMock: showEventFindMany,
    showEventFindUniqueMock: showEventFindUnique,
    showEventUpdateMock: showEventUpdate,
    showEntryUpdateMock: showEntryUpdate,
    showResultItemUpdateMock: showResultItemUpdate,
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: {
    $transaction: prismaTransactionMock,
  },
}));

describe("updateAdminShowEventWriteDb", () => {
  beforeEach(() => {
    prismaTransactionMock.mockClear();
    showEventFindFirstMock.mockReset();
    showEventFindManyMock.mockReset();
    showEventFindUniqueMock.mockReset();
    showEventUpdateMock.mockReset();
    showEntryUpdateMock.mockReset();
    showResultItemUpdateMock.mockReset();
  });

  it("returns not_found when event key lookup misses", async () => {
    showEventFindFirstMock.mockResolvedValue(null);

    await expect(
      updateAdminShowEventWriteDb({
        eventKey: "missing",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        nextEventLookupKey: "2025-06-01|HELSINKI",
        nextEventDate: new Date("2025-06-01T00:00:00.000Z"),
        nextEventPlace: "Helsinki",
        nextEventCity: "Helsinki",
        nextEventName: "Show",
        nextEventType: "All Breed",
        nextOrganizer: "Club",
        nextJudge: "Judge A",
      }),
    ).resolves.toEqual({ status: "not_found" });

    expect(showEventUpdateMock).not.toHaveBeenCalled();
  });

  it("returns event_lookup_conflict when target key belongs to another event", async () => {
    showEventFindFirstMock.mockResolvedValue({
      id: "event-1",
      eventLookupKey: "2025-06-01|HELSINKI",
      entries: [],
    });
    showEventFindUniqueMock.mockResolvedValue({
      id: "event-2",
    });

    await expect(
      updateAdminShowEventWriteDb({
        eventKey: "2025-06-01|HELSINKI",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        nextEventLookupKey: "2025-06-02|ESPOO",
        nextEventDate: new Date("2025-06-02T00:00:00.000Z"),
        nextEventPlace: "Espoo",
        nextEventCity: "Espoo",
        nextEventName: "Show",
        nextEventType: "Specialty",
        nextOrganizer: "Club",
        nextJudge: "Judge A",
      }),
    ).resolves.toEqual({ status: "event_lookup_conflict" });

    expect(showEventUpdateMock).not.toHaveBeenCalled();
  });

  it("updates event and cascades lookup keys for entries/items when event key changes", async () => {
    showEventFindFirstMock.mockResolvedValue({
      id: "event-1",
      eventLookupKey: "2025-06-01|HELSINKI",
      entries: [
        {
          id: "entry-1",
          entryLookupKey: "FI12345/21|2025-06-01|HELSINKI",
          registrationNoSnapshot: "FI12345/21",
          resultItems: [
            {
              id: "item-1",
              itemLookupKey: "FI12345/21|2025-06-01|HELSINKI|ERI|flag:1|1",
            },
          ],
        },
      ],
    });
    showEventFindUniqueMock.mockResolvedValue(null);
    showEventUpdateMock.mockResolvedValue({
      eventLookupKey: "2025-06-02|ESPOO",
      eventDate: new Date("2025-06-02T00:00:00.000Z"),
      eventPlace: "Espoo",
      eventCity: "Espoo",
      eventName: "Updated",
      eventType: "Specialty",
      organizer: "Club",
      judge: "Judge A",
    });

    const result = await updateAdminShowEventWriteDb({
      eventKey: "2025-06-01|HELSINKI",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      nextEventLookupKey: "2025-06-02|ESPOO",
      nextEventDate: new Date("2025-06-02T00:00:00.000Z"),
      nextEventPlace: "Espoo",
      nextEventCity: "Espoo",
      nextEventName: "Updated",
      nextEventType: "Specialty",
      nextOrganizer: "Club",
      nextJudge: "Judge A",
    });

    expect(result).toEqual({
      status: "updated",
      row: {
        eventKey: "2025-06-02|ESPOO",
        eventDate: new Date("2025-06-02T00:00:00.000Z"),
        eventPlace: "Espoo",
        eventCity: "Espoo",
        eventName: "Updated",
        eventType: "Specialty",
        organizer: "Club",
        judge: "Judge A",
      },
    });
    expect(showEventUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "event-1" },
        data: expect.objectContaining({
          eventLookupKey: "2025-06-02|ESPOO",
          eventPlace: "Espoo",
        }),
      }),
    );
    expect(showEntryUpdateMock).toHaveBeenCalledWith({
      where: { id: "entry-1" },
      data: { entryLookupKey: "FI12345/21|2025-06-02|ESPOO" },
    });
    expect(showResultItemUpdateMock).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: {
        itemLookupKey: "FI12345/21|2025-06-02|ESPOO|ERI|flag:1|1",
      },
    });
  });

  it("resolves event by date/place when event key is missing in input", async () => {
    showEventFindManyMock.mockResolvedValue([
      {
        id: "event-1",
        eventLookupKey: "2025-06-01|HELSINKI",
        entries: [],
      },
    ]);
    showEventUpdateMock.mockResolvedValue({
      eventLookupKey: "2025-06-01|HELSINKI",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventCity: null,
      eventName: null,
      eventType: null,
      organizer: null,
      judge: null,
    });

    const result = await updateAdminShowEventWriteDb({
      eventKey: null,
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      nextEventLookupKey: "2025-06-01|HELSINKI",
      nextEventDate: new Date("2025-06-01T00:00:00.000Z"),
      nextEventPlace: "Helsinki",
      nextEventCity: null,
      nextEventName: null,
      nextEventType: null,
      nextOrganizer: null,
      nextJudge: null,
    });

    expect(result).toEqual({
      status: "updated",
      row: {
        eventKey: "2025-06-01|HELSINKI",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        eventCity: null,
        eventName: null,
        eventType: null,
        organizer: null,
        judge: null,
      },
    });
    expect(showEventFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
      }),
    );
    expect(showEntryUpdateMock).not.toHaveBeenCalled();
    expect(showResultItemUpdateMock).not.toHaveBeenCalled();
  });
});
