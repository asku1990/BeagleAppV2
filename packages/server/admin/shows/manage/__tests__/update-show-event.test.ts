import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminShowEvent } from "@server/admin/shows/manage/update-show-event";
import { encodeShowId, parseShowId } from "@server/shows/internal/show-id";

const { updateAdminShowEventWriteDbMock } = vi.hoisted(() => ({
  updateAdminShowEventWriteDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  updateAdminShowEventWriteDb: updateAdminShowEventWriteDbMock,
}));

describe("updateAdminShowEvent", () => {
  beforeEach(() => {
    updateAdminShowEventWriteDbMock.mockReset();
  });

  it("returns 400 for invalid show id", async () => {
    await expect(
      updateAdminShowEvent(
        {
          showId: "invalid",
          eventDate: "2025-06-05",
          eventPlace: "Helsinki",
          eventCity: "Helsinki",
          eventName: "Summer Show",
          eventType: "All Breed",
          organizer: "Club",
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
        error: "Invalid show id.",
        code: "INVALID_SHOW_ID",
      },
    });
    expect(updateAdminShowEventWriteDbMock).not.toHaveBeenCalled();
  });

  it("returns unauthorized when user is missing", async () => {
    const showId = encodeShowId("2025-06-01", "Helsinki", "show-event-1");

    await expect(
      updateAdminShowEvent(
        {
          showId,
          eventDate: "2025-06-05",
          eventPlace: "Helsinki",
          eventCity: "Helsinki",
          eventName: "Summer Show",
          eventType: "All Breed",
          organizer: "Club",
        },
        null,
      ),
    ).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });
    expect(updateAdminShowEventWriteDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid event date", async () => {
    const showId = encodeShowId("2025-06-01", "Helsinki", "show-event-1");

    await expect(
      updateAdminShowEvent(
        {
          showId,
          eventDate: "06-01-2025",
          eventPlace: "Helsinki",
          eventCity: "Helsinki",
          eventName: "Summer Show",
          eventType: "All Breed",
          organizer: "Club",
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
    expect(updateAdminShowEventWriteDbMock).not.toHaveBeenCalled();
  });

  it("returns 400 for blank event place", async () => {
    const showId = encodeShowId("2025-06-01", "Helsinki", "show-event-1");

    await expect(
      updateAdminShowEvent(
        {
          showId,
          eventDate: "2025-06-01",
          eventPlace: " ",
          eventCity: "Helsinki",
          eventName: "Summer Show",
          eventType: "All Breed",
          organizer: "Club",
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
    expect(updateAdminShowEventWriteDbMock).not.toHaveBeenCalled();
  });

  it("returns 404 when db write target is missing", async () => {
    updateAdminShowEventWriteDbMock.mockResolvedValue({ status: "not_found" });
    const showId = encodeShowId("2025-06-01", "Helsinki", "show-event-1");

    await expect(
      updateAdminShowEvent(
        {
          showId,
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          eventCity: "",
          eventName: "",
          eventType: "",
          organizer: "",
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
        error: "Show not found.",
        code: "SHOW_NOT_FOUND",
      },
    });
  });

  it("returns 409 when target event lookup key already exists", async () => {
    updateAdminShowEventWriteDbMock.mockResolvedValue({
      status: "event_lookup_conflict",
    });
    const showId = encodeShowId("2025-06-01", "Helsinki", "show-event-1");

    await expect(
      updateAdminShowEvent(
        {
          showId,
          eventDate: "2025-06-01",
          eventPlace: "Espoo",
          eventCity: "Espoo",
          eventName: "Summer Show",
          eventType: "All Breed",
          organizer: "Club",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: null,
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 409,
      body: {
        ok: false,
        error: "Another show already exists for this date and place.",
        code: "EVENT_LOOKUP_CONFLICT",
      },
    });
  });

  it("returns updated show payload and encoded show id", async () => {
    updateAdminShowEventWriteDbMock.mockResolvedValue({
      status: "updated",
      row: {
        eventKey: "2025-06-02|ESPOO",
        eventDate: new Date("2025-06-02T00:00:00.000Z"),
        eventPlace: "Espoo",
        eventCity: "Espoo",
        eventName: "Summer Show Updated",
        eventType: "Specialty",
        organizer: "Beagle Club",
      },
    });
    const showId = encodeShowId(
      "2025-06-01",
      "Helsinki",
      "2025-06-01|HELSINKI",
    );

    const result = await updateAdminShowEvent(
      {
        showId,
        eventDate: "2025-06-02",
        eventPlace: "  Espoo ",
        eventCity: " Espoo ",
        eventName: " Summer Show Updated ",
        eventType: " Specialty ",
        organizer: " Beagle Club ",
      },
      {
        id: "u_1",
        email: "admin@example.com",
        username: null,
        role: "ADMIN",
      },
    );

    expect(result.status).toBe(200);
    expect(result.body.ok).toBe(true);
    if (!result.body.ok) {
      throw new Error("Expected ok=true response");
    }

    expect(result.body.data).toEqual({
      showId: expect.any(String),
      eventDate: "2025-06-02",
      eventPlace: "Espoo",
      eventCity: "Espoo",
      eventName: "Summer Show Updated",
      eventType: "Specialty",
      organizer: "Beagle Club",
    });

    expect(parseShowId(result.body.data.showId)).toEqual({
      eventDateIsoDate: "2025-06-02",
      eventDate: new Date("2025-06-02T00:00:00.000Z"),
      eventPlace: "Espoo",
      eventKey: "2025-06-02|ESPOO",
    });
    expect(updateAdminShowEventWriteDbMock).toHaveBeenCalledWith({
      eventKey: "2025-06-01|HELSINKI",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      nextEventLookupKey: "2025-06-02|ESPOO",
      nextEventDate: new Date("2025-06-02T00:00:00.000Z"),
      nextEventPlace: "Espoo",
      nextEventCity: "Espoo",
      nextEventName: "Summer Show Updated",
      nextEventType: "Specialty",
      nextOrganizer: "Beagle Club",
    });
  });

  it("returns 500 when db write throws", async () => {
    updateAdminShowEventWriteDbMock.mockRejectedValue(new Error("boom"));
    const showId = encodeShowId("2025-06-01", "Helsinki", "show-event-1");

    await expect(
      updateAdminShowEvent(
        {
          showId,
          eventDate: "2025-06-01",
          eventPlace: "Helsinki",
          eventCity: "",
          eventName: "",
          eventType: "",
          organizer: "",
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
        error: "Failed to update admin show event.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
