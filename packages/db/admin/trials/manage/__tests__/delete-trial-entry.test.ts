import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { deleteAdminTrialEntryWriteDb } from "../delete-trial-entry";

const { prismaTransactionMock, trialEntryDeleteManyMock } = vi.hoisted(() => {
  const trialEntryDeleteMany = vi.fn();

  const tx = {
    trialEntry: {
      deleteMany: trialEntryDeleteMany,
    },
  };

  return {
    prismaTransactionMock: vi.fn(async (callback) => callback(tx)),
    trialEntryDeleteManyMock: trialEntryDeleteMany,
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: {
    $transaction: prismaTransactionMock,
  },
}));

describe("deleteAdminTrialEntryWriteDb", () => {
  beforeEach(() => {
    prismaTransactionMock.mockClear();
    trialEntryDeleteManyMock.mockReset();
  });

  it("returns not_found when no matching row is deleted", async () => {
    trialEntryDeleteManyMock.mockResolvedValue({ count: 0 });

    await expect(
      deleteAdminTrialEntryWriteDb({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
      }),
    ).resolves.toEqual({ status: "not_found" });
  });

  it("deletes the entry while preserving its parent event", async () => {
    trialEntryDeleteManyMock.mockResolvedValue({ count: 1 });

    await expect(
      deleteAdminTrialEntryWriteDb({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
      }),
    ).resolves.toEqual({
      status: "deleted",
      deletedTrialEntryId: "entry-1",
      trialEventId: "event-1",
      deletedTrialEvent: false,
    });
  });

  it("passes explicit transaction timeout options", async () => {
    trialEntryDeleteManyMock.mockResolvedValue({ count: 1 });

    await deleteAdminTrialEntryWriteDb({
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });

    expect(prismaTransactionMock).toHaveBeenCalledTimes(1);
    expect(prismaTransactionMock).toHaveBeenLastCalledWith(
      expect.any(Function),
      ADMIN_WRITE_TX_CONFIG,
    );
  });
});
