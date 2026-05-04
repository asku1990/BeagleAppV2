import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { deleteAdminTrialEntryWriteDb } from "../delete-trial-entry";

const {
  prismaTransactionMock,
  trialEntryDeleteManyMock,
  trialEntryCountMock,
  trialEventDeleteMock,
} = vi.hoisted(() => {
  const trialEntryDeleteMany = vi.fn();
  const trialEntryCount = vi.fn();
  const trialEventDelete = vi.fn();

  const tx = {
    trialEntry: {
      deleteMany: trialEntryDeleteMany,
      count: trialEntryCount,
    },
    trialEvent: {
      delete: trialEventDelete,
    },
  };

  return {
    prismaTransactionMock: vi.fn(async (callback) => callback(tx)),
    trialEntryDeleteManyMock: trialEntryDeleteMany,
    trialEntryCountMock: trialEntryCount,
    trialEventDeleteMock: trialEventDelete,
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
    trialEntryCountMock.mockReset();
    trialEventDeleteMock.mockReset();
  });

  it("returns not_found when no matching row is deleted", async () => {
    trialEntryDeleteManyMock.mockResolvedValue({ count: 0 });

    await expect(
      deleteAdminTrialEntryWriteDb({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
      }),
    ).resolves.toEqual({ status: "not_found" });

    expect(trialEntryCountMock).not.toHaveBeenCalled();
    expect(trialEventDeleteMock).not.toHaveBeenCalled();
  });

  it("keeps parent trial event when sibling entries remain", async () => {
    trialEntryDeleteManyMock.mockResolvedValue({ count: 1 });
    trialEntryCountMock.mockResolvedValue(2);

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

    expect(trialEventDeleteMock).not.toHaveBeenCalled();
  });

  it("deletes parent trial event when last entry is removed", async () => {
    trialEntryDeleteManyMock.mockResolvedValue({ count: 1 });
    trialEntryCountMock.mockResolvedValue(0);

    await expect(
      deleteAdminTrialEntryWriteDb({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
      }),
    ).resolves.toEqual({
      status: "deleted",
      deletedTrialEntryId: "entry-1",
      trialEventId: "event-1",
      deletedTrialEvent: true,
    });

    expect(trialEventDeleteMock).toHaveBeenCalledWith({
      where: {
        id: "event-1",
      },
    });
  });

  it("passes explicit transaction timeout options", async () => {
    trialEntryDeleteManyMock.mockResolvedValue({ count: 1 });
    trialEntryCountMock.mockResolvedValue(1);

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
