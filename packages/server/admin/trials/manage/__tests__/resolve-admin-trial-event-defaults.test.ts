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
        mode: "range",
        year: null,
        dateFrom: null,
        dateTo: null,
        availableYears: [2026, 2025],
        total: 0,
        totalPages: 0,
        page: 1,
        items: [],
      })
      .mockResolvedValueOnce({
        mode: "year",
        year: 2026,
        dateFrom: null,
        dateTo: null,
        availableYears: [2026, 2025],
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
    ).resolves.toEqual({
      mode: "year",
      year: 2026,
      dateFrom: null,
      dateTo: null,
      availableYears: [2026, 2025],
      total: 1,
      totalPages: 1,
      page: 1,
      items: [],
    });
  });
});
