import { beforeEach, describe, expect, it, vi } from "vitest";
import { resolveAdminTrialEventSearchResponseDb } from "../internal/resolve-admin-trial-event-defaults";

const { searchAdminTrialsDbMock } = vi.hoisted(() => ({
  searchAdminTrialsDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  searchAdminTrialsDb: searchAdminTrialsDbMock,
}));

describe("resolveAdminTrialEventSearchResponseDb", () => {
  beforeEach(() => {
    searchAdminTrialsDbMock.mockReset();
  });

  it("falls back to the latest available year when no temporal filter is provided", async () => {
    searchAdminTrialsDbMock
      .mockResolvedValueOnce({
        availableEventDates: [
          new Date("2026-03-01T00:00:00.000Z"),
          new Date("2025-03-01T00:00:00.000Z"),
        ],
        total: 0,
        totalPages: 0,
        page: 1,
        items: [],
      })
      .mockResolvedValueOnce({
        availableEventDates: [
          new Date("2026-03-01T00:00:00.000Z"),
          new Date("2025-03-01T00:00:00.000Z"),
        ],
        total: 1,
        totalPages: 1,
        page: 1,
        items: [],
      });

    await expect(
      resolveAdminTrialEventSearchResponseDb({
        query: "",
        page: 1,
        pageSize: 20,
        sort: "date-desc",
        mode: null,
        year: null,
        dateFromIso: null,
        dateToIso: null,
        rangeFromDate: null,
        rangeToExclusive: null,
      }),
    ).resolves.toMatchObject({
      mode: "year",
      year: 2026,
      dateFromIso: null,
      dateToIso: null,
      result: {
        availableEventDates: [
          new Date("2026-03-01T00:00:00.000Z"),
          new Date("2025-03-01T00:00:00.000Z"),
        ],
        total: 1,
        totalPages: 1,
        page: 1,
        items: [],
      },
    });

    expect(searchAdminTrialsDbMock).toHaveBeenNthCalledWith(1, {
      query: "",
      page: 1,
      pageSize: 1,
      sort: "date-desc",
    });
    expect(searchAdminTrialsDbMock).toHaveBeenNthCalledWith(2, {
      query: "",
      dateFrom: new Date("2025-12-31T22:00:00.000Z"),
      dateTo: new Date("2026-12-31T22:00:00.000Z"),
      page: 1,
      pageSize: 20,
      sort: "date-desc",
    });
  });
});
