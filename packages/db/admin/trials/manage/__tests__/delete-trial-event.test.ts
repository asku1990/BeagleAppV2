import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_WRITE_TX_CONFIG } from "@db/core/interactive-write-transaction";
import { deleteAdminTrialEventWriteDb } from "../delete-trial-event";

const { transactionMock, deleteManyMock, findUniqueMock } = vi.hoisted(() => {
  const deleteManyMock = vi.fn();
  const findUniqueMock = vi.fn();
  const tx = {
    trialEvent: { deleteMany: deleteManyMock, findUnique: findUniqueMock },
  };
  return {
    transactionMock: vi.fn(async (callback) => callback(tx)),
    deleteManyMock,
    findUniqueMock,
  };
});

vi.mock("@db/core/prisma", () => ({
  prisma: { $transaction: transactionMock },
}));

describe("deleteAdminTrialEventWriteDb", () => {
  beforeEach(() => {
    transactionMock.mockClear();
    deleteManyMock.mockReset();
    findUniqueMock.mockReset();
  });

  it("deletes only an event with no entries", async () => {
    deleteManyMock.mockResolvedValue({ count: 1 });

    await expect(
      deleteAdminTrialEventWriteDb({ trialEventId: "event-1" }),
    ).resolves.toEqual({
      status: "deleted",
      deletedTrialEventId: "event-1",
    });
    expect(deleteManyMock).toHaveBeenCalledWith({
      where: { id: "event-1", entries: { none: {} } },
    });
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(transactionMock).toHaveBeenCalledWith(
      expect.any(Function),
      ADMIN_WRITE_TX_CONFIG,
    );
  });

  it("rejects an existing non-empty event", async () => {
    deleteManyMock.mockResolvedValue({ count: 0 });
    findUniqueMock.mockResolvedValue({ id: "event-1" });

    await expect(
      deleteAdminTrialEventWriteDb({ trialEventId: "event-1" }),
    ).resolves.toEqual({ status: "not_empty" });
  });

  it("reports a missing event", async () => {
    deleteManyMock.mockResolvedValue({ count: 0 });
    findUniqueMock.mockResolvedValue(null);

    await expect(
      deleteAdminTrialEventWriteDb({ trialEventId: "missing" }),
    ).resolves.toEqual({ status: "not_found" });
  });
});
