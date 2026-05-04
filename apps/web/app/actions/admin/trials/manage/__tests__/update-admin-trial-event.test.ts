import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminTrialEventAction } from "../update-admin-trial-event";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  updateAdminTrialEventMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  updateAdminTrialEventMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  updateAdminTrialEvent: updateAdminTrialEventMock,
}));

describe("updateAdminTrialEventAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    updateAdminTrialEventMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(
      updateAdminTrialEventAction({
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        jarjestaja: null,
        ylituomari: null,
        ylituomariNumero: null,
        ytKertomus: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        sklKoeId: null,
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
  });

  it("returns unauthenticated when current user is missing", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue(null);

    await expect(
      updateAdminTrialEventAction({
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        jarjestaja: null,
        ylituomari: null,
        ylituomariNumero: null,
        ytKertomus: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        sklKoeId: null,
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    });
  });

  it("returns mapped service error", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      role: "ADMIN",
      name: "Admin",
      createdAt: "2026-04-01T10:00:00.000Z",
    });
    updateAdminTrialEventMock.mockResolvedValue({
      status: 404,
      body: {
        ok: false,
        code: "EVENT_NOT_FOUND",
        error: "Trial event not found.",
      },
    });

    await expect(
      updateAdminTrialEventAction({
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        jarjestaja: null,
        ylituomari: null,
        ylituomariNumero: null,
        ytKertomus: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        sklKoeId: null,
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "EVENT_NOT_FOUND",
      message: "Trial event not found.",
    });
  });

  it("returns success data", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      role: "ADMIN",
      name: "Admin",
      createdAt: "2026-04-01T10:00:00.000Z",
    });
    updateAdminTrialEventMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          trialEventId: "event-1",
        },
      },
    });

    await expect(
      updateAdminTrialEventAction({
        trialEventId: "event-1",
        eventDate: "2026-04-14",
        eventPlace: "Helsinki",
        jarjestaja: null,
        ylituomari: null,
        ylituomariNumero: null,
        ytKertomus: null,
        kennelpiiri: null,
        kennelpiirinro: null,
        sklKoeId: null,
      }),
    ).resolves.toEqual({
      data: {
        trialEventId: "event-1",
      },
      hasError: false,
    });
  });
});
