import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminShowEntryWriteDb } from "../delete-show-entry";

const {
  prismaTransactionMock,
  showEventFindFirstMock,
  showEventFindManyMock,
  showEntryDeleteManyMock,
} = vi.hoisted(() => {
  const showEventFindFirst = vi.fn();
  const showEventFindMany = vi.fn();
  const showEntryDeleteMany = vi.fn();

  const tx = {
    showEvent: {
      findFirst: showEventFindFirst,
      findMany: showEventFindMany,
    },
    showEntry: {
      deleteMany: showEntryDeleteMany,
    },
  };

  return {
    prismaTransactionMock: vi.fn(async (callback) => callback(tx)),
    showEventFindFirstMock: showEventFindFirst,
    showEventFindManyMock: showEventFindMany,
    showEntryDeleteManyMock: showEntryDeleteMany,
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: {
    $transaction: prismaTransactionMock,
  },
}));

describe("deleteAdminShowEntryWriteDb", () => {
  beforeEach(() => {
    prismaTransactionMock.mockClear();
    showEventFindFirstMock.mockReset();
    showEventFindManyMock.mockReset();
    showEntryDeleteManyMock.mockReset();
  });

  it("returns not_found when event is missing", async () => {
    showEventFindFirstMock.mockResolvedValue(null);

    await expect(
      deleteAdminShowEntryWriteDb({
        eventKey: "missing",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        entryId: "entry-1",
      }),
    ).resolves.toEqual({ status: "not_found" });

    expect(showEntryDeleteManyMock).not.toHaveBeenCalled();
  });

  it("returns not_found when entry does not match selected event", async () => {
    showEventFindFirstMock.mockResolvedValue({ id: "event-1" });
    showEntryDeleteManyMock.mockResolvedValue({ count: 0 });

    await expect(
      deleteAdminShowEntryWriteDb({
        eventKey: "2025-06-01|HELSINKI",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        entryId: "entry-1",
      }),
    ).resolves.toEqual({ status: "not_found" });
  });

  it("returns deleted when entry is removed", async () => {
    showEventFindFirstMock.mockResolvedValue({ id: "event-1" });
    showEntryDeleteManyMock.mockResolvedValue({ count: 1 });

    await expect(
      deleteAdminShowEntryWriteDb({
        eventKey: "2025-06-01|HELSINKI",
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        entryId: "entry-1",
      }),
    ).resolves.toEqual({
      status: "deleted",
      entryId: "entry-1",
    });

    expect(showEntryDeleteManyMock).toHaveBeenCalledWith({
      where: {
        id: "entry-1",
        showEventId: "event-1",
      },
    });
  });

  it("returns not_found when date/place fallback matches multiple events", async () => {
    showEventFindManyMock.mockResolvedValue([
      { id: "event-1" },
      { id: "event-2" },
    ]);

    await expect(
      deleteAdminShowEntryWriteDb({
        eventKey: null,
        eventDate: new Date("2025-06-01T00:00:00.000Z"),
        eventPlace: "Helsinki",
        entryId: "entry-1",
      }),
    ).resolves.toEqual({ status: "not_found" });

    expect(showEntryDeleteManyMock).not.toHaveBeenCalled();
  });
});
