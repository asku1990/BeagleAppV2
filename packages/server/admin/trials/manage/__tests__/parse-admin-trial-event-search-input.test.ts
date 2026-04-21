import { describe, expect, it } from "vitest";
import { parseAdminTrialEventSearchInput } from "../internal/parse-admin-trial-event-search-input";

describe("parseAdminTrialEventSearchInput", () => {
  it("normalizes year searches", () => {
    const result = parseAdminTrialEventSearchInput({
      query: " helsinki ",
      year: 2026,
      page: 2,
      pageSize: 200,
      sort: "date-asc",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        query: "helsinki",
        page: 2,
        pageSize: 100,
        sort: "date-asc",
        mode: "year",
        year: 2026,
        dateFromIso: null,
        dateToIso: null,
        rangeFromDate: null,
        rangeToExclusive: null,
      },
    });
  });

  it("rejects invalid date ranges", () => {
    const result = parseAdminTrialEventSearchInput({
      dateFrom: "2026-05-01",
      dateTo: "2026-04-01",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        status: 400,
        body: {
          ok: false,
          error: "dateFrom must be before or equal to dateTo.",
          code: "INVALID_RANGE_ORDER",
        },
      },
    });
  });
});
