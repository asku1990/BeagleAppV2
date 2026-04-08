import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { updateAdminShowEventWriteDb } from "../update-show-event";

const {
  prismaTransactionMock,
  executeRawMock,
  showEventFindFirstMock,
  showEventFindManyMock,
  showEventFindUniqueMock,
  showEventUpdateMock,
  showEntryUpdateManyMock,
} = vi.hoisted(() => {
  const executeRaw = vi.fn();
  const showEventFindFirst = vi.fn();
  const showEventFindMany = vi.fn();
  const showEventFindUnique = vi.fn();
  const showEventUpdate = vi.fn();
  const showEntryUpdateMany = vi.fn();

  const tx = {
    $executeRaw: executeRaw,
    showEvent: {
      findFirst: showEventFindFirst,
      findMany: showEventFindMany,
      findUnique: showEventFindUnique,
      update: showEventUpdate,
    },
    showEntry: {
      updateMany: showEntryUpdateMany,
    },
  };

  return {
    prismaTransactionMock: vi.fn(async (callback) => callback(tx)),
    executeRawMock: executeRaw,
    showEventFindFirstMock: showEventFindFirst,
    showEventFindManyMock: showEventFindMany,
    showEventFindUniqueMock: showEventFindUnique,
    showEventUpdateMock: showEventUpdate,
    showEntryUpdateManyMock: showEntryUpdateMany,
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
    executeRawMock.mockReset();
    showEventFindFirstMock.mockReset();
    showEventFindManyMock.mockReset();
    showEventFindUniqueMock.mockReset();
    showEventUpdateMock.mockReset();
    showEntryUpdateManyMock.mockReset();
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

  it("passes explicit transaction timeout options", async () => {
    showEventFindFirstMock.mockResolvedValue({
      id: "event-1",
      eventLookupKey: "2025-06-01|HELSINKI",
    });
    showEventUpdateMock.mockResolvedValue({
      eventLookupKey: "2025-06-01|HELSINKI",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventCity: null,
      eventName: null,
      eventType: null,
      organizer: null,
    });
    executeRawMock.mockResolvedValue(0);
    showEntryUpdateManyMock.mockResolvedValue({ count: 0 });

    await updateAdminShowEventWriteDb({
      eventKey: "2025-06-01|HELSINKI",
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

    expect(prismaTransactionMock).toHaveBeenCalledTimes(1);
    expect(prismaTransactionMock).toHaveBeenLastCalledWith(
      expect.any(Function),
      ADMIN_WRITE_TX_CONFIG,
    );
  });

  it("updates event and cascades lookup keys for entries/items when event key changes", async () => {
    showEventFindFirstMock.mockResolvedValue({
      id: "event-1",
      eventLookupKey: "2025-06-01|HELSINKI",
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
    });
    executeRawMock.mockResolvedValue(2);
    showEntryUpdateManyMock.mockResolvedValue({ count: 1 });

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
    expect(executeRawMock).toHaveBeenCalledTimes(1);
    expect(showEntryUpdateManyMock).toHaveBeenCalledWith({
      where: {
        showEventId: "event-1",
        OR: [{ judge: null }, { judge: { not: "Judge A" } }],
      },
      data: { judge: "Judge A" },
    });
  });

  it("resolves event by date/place when event key is missing in input", async () => {
    showEventFindManyMock.mockResolvedValue([
      {
        id: "event-1",
        eventLookupKey: "2025-06-01|HELSINKI",
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
    });
    showEntryUpdateManyMock.mockResolvedValue({ count: 1 });

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
    expect(executeRawMock).not.toHaveBeenCalled();
    expect(showEntryUpdateManyMock).toHaveBeenCalledWith({
      where: {
        showEventId: "event-1",
        judge: { not: null },
      },
      data: { judge: null },
    });
  });
});
