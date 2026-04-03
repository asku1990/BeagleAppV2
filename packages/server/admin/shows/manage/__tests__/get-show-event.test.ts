import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminShowEvent } from "@server/admin/shows/manage/get-show-event";
import { encodeShowId } from "@server/shows/internal/show-id";

const { getAdminShowEventDetailsDbMock } = vi.hoisted(() => ({
  getAdminShowEventDetailsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  getAdminShowEventDetailsDb: getAdminShowEventDetailsDbMock,
}));

describe("getAdminShowEvent", () => {
  beforeEach(() => {
    getAdminShowEventDetailsDbMock.mockReset();
  });

  it("returns bad request for an invalid show id", async () => {
    await expect(
      getAdminShowEvent({ showId: "invalid" }, null),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid show id.",
        code: "INVALID_SHOW_ID",
      },
    });

    expect(getAdminShowEventDetailsDbMock).not.toHaveBeenCalled();
  });

  it("returns unauthorized when the user is missing", async () => {
    const showId = encodeShowId("2025-06-01", "Helsinki", "show-event-1");

    await expect(getAdminShowEvent({ showId }, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(getAdminShowEventDetailsDbMock).not.toHaveBeenCalled();
  });

  it("returns not found when the db has no matching show", async () => {
    getAdminShowEventDetailsDbMock.mockResolvedValue(null);
    const showId = encodeShowId("2025-06-01", "Helsinki", "show-event-1");

    await expect(
      getAdminShowEvent(
        { showId },
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

  it("maps a show detail response from the db", async () => {
    getAdminShowEventDetailsDbMock.mockResolvedValue({
      eventKey: "show-event-1",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventCity: "Helsinki",
      eventName: "Summer Show",
      eventType: "Ryhmä",
      organizer: "Kennel Club",
      judge: "Judge Main",
      dogCount: 1,
      items: [
        {
          id: "entry-1",
          registrationNo: "FI12345/21",
          dogName: "Aatu",
          judge: "Judge Main",
          critiqueText: "Strong dog",
          heightCm: 42,
          classCode: "JUN",
          qualityGrade: "ERI",
          classPlacement: 1,
          pupn: "PU1",
          awards: ["SA"],
        },
      ],
      options: {
        classOptions: [{ value: "JUN", label: "JUN - Junioriluokka" }],
        qualityOptions: [{ value: "ERI", label: "ERI" }],
        awardOptions: [{ value: "SA", label: "SA" }],
        pupnOptions: [{ value: "PU1", label: "PU1" }],
      },
    } as never);

    const showId = encodeShowId("2025-06-01", "Helsinki", "show-event-1");
    const result = await getAdminShowEvent(
      { showId },
      {
        id: "u_1",
        email: "admin@example.com",
        username: null,
        role: "ADMIN",
      },
    );

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          show: {
            showId,
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            eventCity: "Helsinki",
            eventName: "Summer Show",
            eventType: "Ryhmä",
            organizer: "Kennel Club",
            judge: "Judge Main",
            dogCount: 1,
            entries: [
              {
                id: "entry-1",
                registrationNo: "FI12345/21",
                dogName: "Aatu",
                judge: "Judge Main",
                critiqueText: "Strong dog",
                heightCm: "42",
                classCode: "JUN",
                qualityGrade: "ERI",
                classPlacement: "1",
                pupn: "PU1",
                awards: ["SA"],
              },
            ],
          },
          options: {
            classOptions: [{ value: "JUN", label: "JUN - Junioriluokka" }],
            qualityOptions: [{ value: "ERI", label: "ERI" }],
            awardOptions: [{ value: "SA", label: "SA" }],
            pupnOptions: [{ value: "PU1", label: "PU1" }],
          },
        },
      },
    });

    expect(getAdminShowEventDetailsDbMock).toHaveBeenCalledWith({
      eventKey: "show-event-1",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
    });
  });

  it("maps empty optional detail fields and request context", async () => {
    getAdminShowEventDetailsDbMock.mockResolvedValue({
      eventKey: "show-event-2",
      eventDate: new Date("2025-06-02T00:00:00.000Z"),
      eventPlace: "Espoo",
      eventCity: null,
      eventName: null,
      eventType: null,
      organizer: null,
      judge: null,
      dogCount: 0,
      items: [
        {
          id: "entry-2",
          registrationNo: "FI99999/21",
          dogName: "Beta",
          judge: null,
          critiqueText: null,
          heightCm: null,
          classCode: null,
          qualityGrade: null,
          classPlacement: null,
          pupn: null,
          awards: [],
        },
      ],
      options: {
        classOptions: [],
        qualityOptions: [],
        awardOptions: [],
        pupnOptions: [],
      },
    } as never);

    const showId = encodeShowId("2025-06-02", "Espoo", "show-event-2");
    const result = await getAdminShowEvent(
      { showId },
      {
        id: "u_1",
        email: "admin@example.com",
        username: null,
        role: "ADMIN",
      },
      {
        requestId: "req-1",
        actorUserId: "actor-1",
      },
    );

    expect(result).toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          show: {
            showId,
            eventDate: "2025-06-02",
            eventPlace: "Espoo",
            eventCity: "",
            eventName: "",
            eventType: "",
            organizer: "",
            judge: "",
            dogCount: 0,
            entries: [
              {
                id: "entry-2",
                registrationNo: "FI99999/21",
                dogName: "Beta",
                judge: "",
                critiqueText: "",
                heightCm: "",
                classCode: "",
                qualityGrade: "",
                classPlacement: "",
                pupn: "",
                awards: [],
              },
            ],
          },
          options: {
            classOptions: [],
            qualityOptions: [],
            awardOptions: [],
            pupnOptions: [],
          },
        },
      },
    });
  });

  it("returns internal error when the db throws", async () => {
    getAdminShowEventDetailsDbMock.mockRejectedValue(new Error("boom"));
    const showId = encodeShowId("2025-06-01", "Helsinki");

    await expect(
      getAdminShowEvent(
        { showId },
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
        error: "Failed to load admin show details.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
