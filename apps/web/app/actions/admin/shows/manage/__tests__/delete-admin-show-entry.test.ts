import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAdminShowEntryAction } from "../delete-admin-show-entry";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  deleteAdminShowEntryMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  deleteAdminShowEntryMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  deleteAdminShowEntry: deleteAdminShowEntryMock,
}));

describe("deleteAdminShowEntryAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    deleteAdminShowEntryMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(
      deleteAdminShowEntryAction({ showId: "show-1", entryId: "entry-1" }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
    expect(deleteAdminShowEntryMock).not.toHaveBeenCalled();
  });

  it("returns unauthenticated when current user is missing", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue(null);

    await expect(
      deleteAdminShowEntryAction({ showId: "show-1", entryId: "entry-1" }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    });
    expect(deleteAdminShowEntryMock).not.toHaveBeenCalled();
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
    deleteAdminShowEntryMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        code: "SHOW_ENTRY_NOT_FOUND",
        error: "Show entry not found.",
      },
    });

    await expect(
      deleteAdminShowEntryAction({ showId: "show-1", entryId: "entry-1" }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "SHOW_ENTRY_NOT_FOUND",
      message: "Show entry not found.",
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
    deleteAdminShowEntryMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          showId: "show-1",
          entryId: "entry-1",
        },
      },
    });

    await expect(
      deleteAdminShowEntryAction({ showId: "show-1", entryId: "entry-1" }),
    ).resolves.toEqual({
      data: {
        showId: "show-1",
        entryId: "entry-1",
      },
      hasError: false,
    });
  });
});
