import { beforeEach, describe, expect, it, vi } from "vitest";
import { listAdminTrialEvents } from "../list-trials";

const { searchAdminTrialsDbMock } = vi.hoisted(() => ({
  searchAdminTrialsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  searchAdminTrialsDb: searchAdminTrialsDbMock,
}));

describe("listAdminTrialEvents", () => {
  beforeEach(() => {
    searchAdminTrialsDbMock.mockReset();
  });

  it("returns event summaries from db in contract format", async () => {
    searchAdminTrialsDbMock.mockResolvedValue({
      mode: "year",
      year: 2026,
      dateFrom: null,
      dateTo: null,
      availableYears: [2026, 2025],
      total: 2,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialEventId: "event_1",
          eventDate: new Date("2026-04-14T08:00:00.000Z"),
          eventPlace: "Helsinki",
          eventName: "Talvikoe",
          organizer: "Talvikoe",
          judge: "Judge One",
          sklKoeId: 123456,
          dogCount: 24,
        },
      ],
    });

    await expect(
      listAdminTrialEvents(
        {
          query: "helsinki",
          year: 2026,
          page: 2,
          pageSize: 500,
          sort: "date-asc",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: "admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          filters: {
            mode: "year",
            year: 2026,
            dateFrom: null,
            dateTo: null,
          },
          availableYears: [2026, 2025],
          total: 2,
          totalPages: 1,
          page: 1,
          items: [
            {
              trialEventId: "event_1",
              eventDate: "2026-04-14",
              eventPlace: "Helsinki",
              eventName: "Talvikoe",
              organizer: "Talvikoe",
              judge: "Judge One",
              sklKoeId: 123456,
              dogCount: 24,
            },
          ],
        },
      },
    });

    expect(searchAdminTrialsDbMock).toHaveBeenCalledWith({
      mode: "year",
      query: "helsinki",
      year: 2026,
      page: 2,
      pageSize: 100,
      sort: "date-asc",
    });
  });

  it("returns forbidden when the user is not an admin", async () => {
    await expect(listAdminTrialEvents({}, null)).resolves.toEqual({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    expect(searchAdminTrialsDbMock).not.toHaveBeenCalled();
  });

  it("returns invalid sort without calling db", async () => {
    await expect(
      listAdminTrialEvents(
        { sort: "bogus" as never },
        {
          id: "u_1",
          email: "admin@example.com",
          username: "admin",
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

    expect(searchAdminTrialsDbMock).not.toHaveBeenCalled();
  });

  it("returns invalid range order without calling db", async () => {
    await expect(
      listAdminTrialEvents(
        {
          dateFrom: "2026-05-01",
          dateTo: "2026-04-01",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: "admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "dateFrom must be before or equal to dateTo.",
        code: "INVALID_RANGE_ORDER",
      },
    });

    expect(searchAdminTrialsDbMock).not.toHaveBeenCalled();
  });

  it("returns invalid date range when the date does not exist", async () => {
    await expect(
      listAdminTrialEvents(
        {
          dateFrom: "2026-02-31",
          dateTo: "2026-03-05",
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: "admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid date range value.",
        code: "INVALID_DATE_RANGE",
      },
    });

    expect(searchAdminTrialsDbMock).not.toHaveBeenCalled();
  });

  it("returns invalid year for fractional values", async () => {
    await expect(
      listAdminTrialEvents(
        {
          year: 2026.9,
        },
        {
          id: "u_1",
          email: "admin@example.com",
          username: "admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Invalid year value.",
        code: "INVALID_YEAR",
      },
    });

    expect(searchAdminTrialsDbMock).not.toHaveBeenCalled();
  });

  it("returns internal error when db query fails", async () => {
    searchAdminTrialsDbMock.mockRejectedValue(new Error("boom"));

    await expect(
      listAdminTrialEvents(
        {},
        {
          id: "u_1",
          email: "admin@example.com",
          username: "admin",
          role: "ADMIN",
        },
      ),
    ).resolves.toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load admin trial events.",
        code: "INTERNAL_ERROR",
      },
    });
  });
});
