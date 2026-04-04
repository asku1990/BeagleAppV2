import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminShowEntryAction } from "../update-admin-show-entry";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  updateAdminShowEntryMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  updateAdminShowEntryMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  updateAdminShowEntry: updateAdminShowEntryMock,
}));

const baseEntryInput = {
  showId: "show-1",
  entryId: "entry-1",
  judge: "Judge",
  critiqueText: "Balanced movement.",
  heightCm: "38",
  classCode: "AVO",
  qualityGrade: "ERI",
  classPlacement: "1",
  pupn: "PU1",
  awards: ["SERT"],
};

describe("updateAdminShowEntryAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    updateAdminShowEntryMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(updateAdminShowEntryAction(baseEntryInput)).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
    expect(updateAdminShowEntryMock).not.toHaveBeenCalled();
  });

  it("returns unauthenticated when current user is missing", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue(null);

    await expect(updateAdminShowEntryAction(baseEntryInput)).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    });
    expect(updateAdminShowEntryMock).not.toHaveBeenCalled();
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
    updateAdminShowEntryMock.mockResolvedValue({
      status: 400,
      body: {
        ok: false,
        code: "INVALID_CLASS_PLACEMENT",
        error: "Class placement must be 1-4.",
      },
    });

    await expect(
      updateAdminShowEntryAction({
        ...baseEntryInput,
        classPlacement: "0",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INVALID_CLASS_PLACEMENT",
      message: "Class placement must be 1-4.",
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
    updateAdminShowEntryMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          showId: "show-1",
          entryId: "entry-1",
        },
      },
    });

    await expect(updateAdminShowEntryAction(baseEntryInput)).resolves.toEqual({
      data: {
        showId: "show-1",
        entryId: "entry-1",
      },
      hasError: false,
    });
  });
});
