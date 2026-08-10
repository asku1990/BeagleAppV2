import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminTrialEntry } from "@server/admin/trials/manage/delete-trial-entry";

const { deleteAdminTrialEntryWriteDbMock } = vi.hoisted(() => ({
  deleteAdminTrialEntryWriteDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  deleteAdminTrialEntryWriteDb: deleteAdminTrialEntryWriteDbMock,
}));

describe("deleteAdminTrialEntry", () => {
  beforeEach(() => {
    deleteAdminTrialEntryWriteDbMock.mockReset();
  });

  it("returns 400 for invalid trial event id", async () => {
    await expect(
      deleteAdminTrialEntry(
        {
          trialEventId: " ",
          trialEntryId: "entry-1",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Trial event id is required.",
        code: "INVALID_TRIAL_EVENT_ID",
      },
    });
  });

  it("returns 400 for invalid trial entry id", async () => {
    await expect(
      deleteAdminTrialEntry(
        {
          trialEventId: "event-1",
          trialEntryId: " ",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Trial entry id is required.",
        code: "INVALID_TRIAL_ENTRY_ID",
      },
    });
  });

  it("returns 403 for unauthorized user", async () => {
    await expect(
      deleteAdminTrialEntry(
        {
          trialEventId: "event-1",
          trialEntryId: "entry-1",
        },
        {
          id: "u_1",
          email: "user@example.com",
          username: null,
          role: "USER",
        },
      ),
    ).resolves.toEqual({
      status: 403,
      body: {
        ok: false,
        error: "Admin role required.",
        code: "FORBIDDEN",
      },
    });
  });

  it("returns 404 when db reports not_found", async () => {
    deleteAdminTrialEntryWriteDbMock.mockResolvedValue({ status: "not_found" });

    await expect(
      deleteAdminTrialEntry(
        {
          trialEventId: "event-1",
          trialEntryId: "entry-1",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 404,
      body: {
        ok: false,
        error: "Entry not found in selected trial event.",
        code: "ENTRY_NOT_FOUND",
      },
    });
  });

  it("returns 200 when entry is deleted", async () => {
    deleteAdminTrialEntryWriteDbMock.mockResolvedValue({
      status: "deleted",
      deletedTrialEntryId: "entry-1",
      trialEventId: "event-1",
      deletedTrialEvent: false,
    });

    await expect(
      deleteAdminTrialEntry(
        {
          trialEventId: " event-1 ",
          trialEntryId: " entry-1 ",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          deletedTrialEntryId: "entry-1",
          trialEventId: "event-1",
          deletedTrialEvent: false,
        },
      },
    });

    expect(deleteAdminTrialEntryWriteDbMock).toHaveBeenCalledWith({
      trialEventId: "event-1",
      trialEntryId: "entry-1",
    });
  });

  it("returns 500 when delete throws", async () => {
    deleteAdminTrialEntryWriteDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      deleteAdminTrialEntry(
        {
          trialEventId: "event-1",
          trialEntryId: "entry-1",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to delete admin trial entry.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
