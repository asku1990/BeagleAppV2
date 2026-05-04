import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminTrialEntryAction } from "../delete-admin-trial-entry";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  deleteAdminTrialEntryMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  deleteAdminTrialEntryMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  deleteAdminTrialEntry: deleteAdminTrialEntryMock,
}));

describe("deleteAdminTrialEntryAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    deleteAdminTrialEntryMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(
      deleteAdminTrialEntryAction({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });

    expect(deleteAdminTrialEntryMock).not.toHaveBeenCalled();
  });

  it("returns unauthenticated when current user is missing", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue(null);

    await expect(
      deleteAdminTrialEntryAction({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    });

    expect(deleteAdminTrialEntryMock).not.toHaveBeenCalled();
  });

  it("returns mapped service error", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: "2026-04-01T10:00:00.000Z",
    });
    deleteAdminTrialEntryMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        code: "ENTRY_NOT_FOUND",
        error: "Entry not found in selected trial event.",
      },
    });

    await expect(
      deleteAdminTrialEntryAction({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "ENTRY_NOT_FOUND",
      message: "Entry not found in selected trial event.",
    });
  });

  it("returns data on success", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: "2026-04-01T10:00:00.000Z",
    });
    deleteAdminTrialEntryMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          deletedTrialEntryId: "entry-1",
          trialEventId: "event-1",
          deletedTrialEvent: true,
        },
      },
    });

    await expect(
      deleteAdminTrialEntryAction({
        trialEventId: "event-1",
        trialEntryId: "entry-1",
      }),
    ).resolves.toEqual({
      data: {
        deletedTrialEntryId: "entry-1",
        trialEventId: "event-1",
        deletedTrialEvent: true,
      },
      hasError: false,
    });
  });
});
