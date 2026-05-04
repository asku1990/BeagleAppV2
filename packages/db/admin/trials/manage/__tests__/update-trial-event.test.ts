import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { updateAdminTrialEventWriteDb } from "../update-trial-event";

const {
  prismaTransactionMock,
  trialEventUpdateManyMock,
  trialEntryUpdateManyMock,
} = vi.hoisted(() => {
  const updateMany = vi.fn();
  const trialEntryUpdateMany = vi.fn();
  const tx = {
    trialEvent: {
      updateMany,
    },
    trialEntry: {
      updateMany: trialEntryUpdateMany,
    },
  };

  return {
    prismaTransactionMock: vi.fn(async (callback) => callback(tx)),
    trialEventUpdateManyMock: updateMany,
    trialEntryUpdateManyMock: trialEntryUpdateMany,
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: {
    $transaction: prismaTransactionMock,
  },
}));

describe("updateAdminTrialEventWriteDb", () => {
  beforeEach(() => {
    prismaTransactionMock.mockClear();
    trialEventUpdateManyMock.mockReset();
    trialEntryUpdateManyMock.mockReset();
  });

  it("returns not_found when event row does not exist", async () => {
    trialEventUpdateManyMock.mockResolvedValue({ count: 0 });

    await expect(
      updateAdminTrialEventWriteDb({
        trialEventId: "event-1",
        eventDate: new Date("2026-04-14T00:00:00.000Z"),
        eventPlace: "Helsinki",
        organizer: "Kerho",
        judge: "Judge",
        sklKoeId: 123,
      }),
    ).resolves.toEqual({ status: "not_found" });
  });

  it("updates trial event metadata and returns updated id", async () => {
    trialEventUpdateManyMock.mockResolvedValue({ count: 1 });

    await expect(
      updateAdminTrialEventWriteDb({
        trialEventId: "event-1",
        eventDate: new Date("2026-04-14T00:00:00.000Z"),
        eventPlace: "Helsinki",
        organizer: "Kerho",
        judge: null,
        sklKoeId: null,
      }),
    ).resolves.toEqual({
      status: "updated",
      trialEventId: "event-1",
    });

    expect(trialEventUpdateManyMock).toHaveBeenCalledWith({
      where: { id: "event-1" },
      data: {
        koepaiva: new Date("2026-04-14T00:00:00.000Z"),
        koekunta: "Helsinki",
        jarjestaja: "Kerho",
        ylituomariNimi: null,
        sklKoeId: null,
      },
    });
    expect(trialEntryUpdateManyMock).not.toHaveBeenCalled();
  });

  it("passes explicit transaction timeout options", async () => {
    trialEventUpdateManyMock.mockResolvedValue({ count: 1 });

    await updateAdminTrialEventWriteDb({
      trialEventId: "event-1",
      eventDate: new Date("2026-04-14T00:00:00.000Z"),
      eventPlace: "Helsinki",
      organizer: "Kerho",
      judge: "Judge",
      sklKoeId: 123,
    });

    expect(prismaTransactionMock).toHaveBeenCalledWith(
      expect.any(Function),
      ADMIN_WRITE_TX_CONFIG,
    );
  });
});
