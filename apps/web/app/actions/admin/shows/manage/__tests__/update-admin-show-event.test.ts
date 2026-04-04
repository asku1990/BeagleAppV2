import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminShowEventAction } from "../update-admin-show-event";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  updateAdminShowEventMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  updateAdminShowEventMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  updateAdminShowEvent: updateAdminShowEventMock,
}));

const baseEventInput = {
  showId: "show-1",
  eventDate: "2026-04-01",
  eventPlace: "Helsinki",
  eventCity: "Helsinki",
  eventName: "Spring Show",
  eventType: "N",
  organizer: "Beagle Club",
  judge: "Judge A",
};

describe("updateAdminShowEventAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    updateAdminShowEventMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(updateAdminShowEventAction(baseEventInput)).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
      message: "Admin access required.",
    });
    expect(updateAdminShowEventMock).not.toHaveBeenCalled();
  });

  it("returns unauthenticated when current user is missing", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue(null);

    await expect(updateAdminShowEventAction(baseEventInput)).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
      message: "Admin access required.",
    });
    expect(updateAdminShowEventMock).not.toHaveBeenCalled();
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
    updateAdminShowEventMock.mockResolvedValue({
      status: 400,
      body: {
        ok: false,
        code: "INVALID_EVENT_DATE",
        error: "Event date is invalid.",
      },
    });

    await expect(
      updateAdminShowEventAction({
        ...baseEventInput,
        eventDate: "invalid-date",
      }),
    ).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INVALID_EVENT_DATE",
      message: "Event date is invalid.",
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
    updateAdminShowEventMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          showId: "show-2",
          eventDate: "2026-04-01",
          eventPlace: "Helsinki",
          eventCity: "Helsinki",
          eventName: "Spring Show",
          eventType: "N",
          organizer: "Beagle Club",
          judge: "Judge A",
        },
      },
    });

    await expect(updateAdminShowEventAction(baseEventInput)).resolves.toEqual({
      data: {
        showId: "show-2",
        eventDate: "2026-04-01",
        eventPlace: "Helsinki",
        eventCity: "Helsinki",
        eventName: "Spring Show",
        eventType: "N",
        organizer: "Beagle Club",
        judge: "Judge A",
      },
      hasError: false,
    });
  });
});
