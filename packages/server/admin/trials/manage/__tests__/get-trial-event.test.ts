import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminTrialEvent } from "../get-trial-event";

const { getAdminTrialEventDetailsDbMock } = vi.hoisted(() => ({
  getAdminTrialEventDetailsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getAdminTrialEventDetailsDb: getAdminTrialEventDetailsDbMock,
}));

describe("getAdminTrialEvent", () => {
  beforeEach(() => {
    getAdminTrialEventDetailsDbMock.mockReset();
  });

  it("returns bad request when trial event id is invalid", async () => {
    await expect(
      getAdminTrialEvent({ trialEventId: "  " }, null),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid trial event id.",
        code: "INVALID_TRIAL_EVENT_ID",
      },
    });

    expect(getAdminTrialEventDetailsDbMock).not.toHaveBeenCalled();
  });

  it("returns not found when event is missing", async () => {
    getAdminTrialEventDetailsDbMock.mockResolvedValue(null);

    await expect(
      getAdminTrialEvent(
        { trialEventId: "event-1" },
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
        code: "TRIAL_EVENT_NOT_FOUND",
      },
    });
  });

  it("maps event and entries from db", async () => {
    getAdminTrialEventDetailsDbMock.mockResolvedValue({
      trialEventId: "event-1",
      eventDate: new Date("2026-04-14T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventName: "Talvikoe",
      organizer: "Talvikoe",
      judge: "Judge One",
      sklKoeId: 1234,
      koemuoto: "AJOK",
      entries: [
        {
          trialId: "trial-1",
          dogId: "dog-1",
          dogName: "Rex",
          registrationNo: "FI123",
          entryKey: "entry-1",
          rank: "1",
          award: "VOI1",
          points: 92.5,
          judge: "Group Judge",
        },
      ],
    });

    await expect(
      getAdminTrialEvent(
        { trialEventId: "event-1" },
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
          event: {
            trialEventId: "event-1",
            eventDate: "2026-04-14",
            eventPlace: "Helsinki",
            eventName: "Talvikoe",
            organizer: "Talvikoe",
            judge: "Judge One",
            sklKoeId: 1234,
            dogCount: 1,
            koemuoto: "AJOK",
            entries: [
              {
                trialId: "trial-1",
                dogId: "dog-1",
                dogName: "Rex",
                registrationNo: "FI123",
                entryKey: "entry-1",
                rank: "1",
                award: "VOI1",
                points: 92.5,
                judge: "Group Judge",
              },
            ],
          },
        },
      },
    });
  });

  it("returns internal error when db throws", async () => {
    getAdminTrialEventDetailsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      getAdminTrialEvent(
        { trialEventId: "event-1" },
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
        error: "Failed to load admin trial event details.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
