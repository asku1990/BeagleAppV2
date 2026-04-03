import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminShowEvents } from "@server/admin/shows/manage/list-show-events";
import { parseShowId } from "@server/shows/internal/show-id";

const { searchAdminShowEventsDbMock } = vi.hoisted(() => ({
  searchAdminShowEventsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  searchAdminShowEventsDb: searchAdminShowEventsDbMock,
}));

describe("listAdminShowEvents", () => {
  beforeEach(() => {
    searchAdminShowEventsDbMock.mockReset();
  });

  it("returns unauthorized when the user is missing", async () => {
    await expect(listAdminShowEvents({}, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(searchAdminShowEventsDbMock).not.toHaveBeenCalled();
  });

  it("returns forbidden for a non-admin user", async () => {
    await expect(
      listAdminShowEvents(
        {},
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

    expect(searchAdminShowEventsDbMock).not.toHaveBeenCalled();
  });

  it("returns bad request for an invalid sort", async () => {
    await expect(
      listAdminShowEvents(
        { sort: "unsupported" as never },
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
        error: "Invalid sort value.",
        code: "INVALID_SORT",
      },
    });

    expect(searchAdminShowEventsDbMock).not.toHaveBeenCalled();
  });

  it("maps rows from the db and normalizes paging", async () => {
    searchAdminShowEventsDbMock.mockResolvedValue({
      total: 1,
      totalPages: 1,
      page: 2,
      items: [
        {
          eventKey: "show-event-1",
          eventDate: new Date("2025-06-01T00:00:00.000Z"),
          eventPlace: "Helsinki",
          eventCity: "Helsinki",
          eventName: "Summer Show",
          eventType: "Ryhmä",
          organizer: "Kennel Club",
          judge: "Judge Main",
          dogCount: 3,
        },
      ],
    });

    const result = await listAdminShowEvents(
      {
        query: "  summer  ",
        page: 0,
        pageSize: 200,
        sort: "date-asc",
      },
      {
        id: "u_1",
        email: "admin@example.com",
        username: null,
        role: "ADMIN",
      },
    );

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected ok=true response");
    }
    expect(result.body).toMatchObject({
      ok: true,
      data: {
        total: 1,
        totalPages: 1,
        page: 2,
        items: [
          {
            eventDate: "2025-06-01",
            eventPlace: "Helsinki",
            eventCity: "Helsinki",
            eventName: "Summer Show",
            eventType: "Ryhmä",
            organizer: "Kennel Club",
            judge: "Judge Main",
            dogCount: 3,
          },
        ],
      },
    });
    expect(parseShowId(result.body.data.items[0].showId)).toEqual({
      eventDateIsoDate: "2025-06-01",
      eventDate: new Date("2025-06-01T00:00:00.000Z"),
      eventPlace: "Helsinki",
      eventKey: "show-event-1",
    });
    expect(searchAdminShowEventsDbMock).toHaveBeenCalledWith({
      query: "summer",
      page: 1,
      pageSize: 100,
      sort: "date-asc",
    });
  });

  it("returns internal error when the db throws", async () => {
    searchAdminShowEventsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminShowEvents(
        {},
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
        error: "Failed to load admin show events.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
