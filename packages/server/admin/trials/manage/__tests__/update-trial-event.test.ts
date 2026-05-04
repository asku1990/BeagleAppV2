import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminTrialEvent } from "@server/admin/trials/manage/update-trial-event";

const { updateAdminTrialEventWriteDbMock } = vi.hoisted(() => ({
  updateAdminTrialEventWriteDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  updateAdminTrialEventWriteDb: updateAdminTrialEventWriteDbMock,
}));

describe("updateAdminTrialEvent", () => {
  beforeEach(() => {
    updateAdminTrialEventWriteDbMock.mockReset();
  });

  it("returns 400 for invalid trial event id", async () => {
    await expect(
      updateAdminTrialEvent(
        {
          trialEventId: " ",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: null,
          organizer: null,
          judge: null,
          sklKoeId: null,
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

  it("returns 400 for invalid event date", async () => {
    await expect(
      updateAdminTrialEvent(
        {
          trialEventId: "event-1",
          eventDate: "2026-99-99",
          eventPlace: "Helsinki",
          eventName: null,
          organizer: null,
          judge: null,
          sklKoeId: null,
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
        error: "Event date must use YYYY-MM-DD format.",
        code: "INVALID_EVENT_DATE",
      },
    });
  });

  it("returns 400 for missing event place", async () => {
    await expect(
      updateAdminTrialEvent(
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: " ",
          eventName: null,
          organizer: null,
          judge: null,
          sklKoeId: null,
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
        error: "Event place is required.",
        code: "INVALID_EVENT_PLACE",
      },
    });
  });

  it("returns 400 for invalid sklKoeId", async () => {
    await expect(
      updateAdminTrialEvent(
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: null,
          organizer: null,
          judge: null,
          sklKoeId: 0,
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
        error: "SKL koe id must be a positive integer.",
        code: "INVALID_SKL_KOE_ID",
      },
    });
  });

  it("returns 403 for unauthorized user", async () => {
    await expect(
      updateAdminTrialEvent(
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: null,
          organizer: null,
          judge: null,
          sklKoeId: null,
        },
        { id: "u_1", email: "user@example.com", username: null, role: "USER" },
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
    updateAdminTrialEventWriteDbMock.mockResolvedValue({ status: "not_found" });

    await expect(
      updateAdminTrialEvent(
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: null,
          organizer: null,
          judge: null,
          sklKoeId: null,
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
        error: "Trial event not found.",
        code: "EVENT_NOT_FOUND",
      },
    });
  });

  it("returns 200 on success and normalizes optional fields", async () => {
    updateAdminTrialEventWriteDbMock.mockResolvedValue({
      status: "updated",
      trialEventId: "event-1",
    });

    await expect(
      updateAdminTrialEvent(
        {
          trialEventId: " event-1 ",
          eventDate: "2026-04-14",
          eventPlace: " Helsinki ",
          eventName: " ",
          organizer: " Kerho ",
          judge: " ",
          sklKoeId: 123,
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
          trialEventId: "event-1",
        },
      },
    });

    expect(updateAdminTrialEventWriteDbMock).toHaveBeenCalledWith({
      trialEventId: "event-1",
      eventDate: new Date("2026-04-14T00:00:00.000Z"),
      eventPlace: "Helsinki",
      organizer: "Kerho",
      judge: null,
      sklKoeId: 123,
    });
  });

  it("returns 500 when update throws", async () => {
    updateAdminTrialEventWriteDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      updateAdminTrialEvent(
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: null,
          organizer: null,
          judge: null,
          sklKoeId: null,
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
        error: "Failed to update admin trial event.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
