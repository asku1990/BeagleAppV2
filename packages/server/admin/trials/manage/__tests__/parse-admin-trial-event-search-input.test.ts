import { describe, expect, it } from "vitest";
import { getTrialBusinessDateStartUtc } from "../../../../trials/core/business-date";
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

  it("normalizes range searches to business-timezone boundaries", () => {
    const result = parseAdminTrialEventSearchInput({
      dateFrom: "2026-06-01",
      dateTo: "2026-06-30",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        query: "",
        page: 1,
        pageSize: 20,
        sort: "date-desc",
        mode: "range",
        year: null,
        dateFromIso: "2026-06-01",
        dateToIso: "2026-06-30",
        rangeFromDate: getTrialBusinessDateStartUtc("2026-06-01"),
        rangeToExclusive: getTrialBusinessDateStartUtc("2026-07-01"),
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
