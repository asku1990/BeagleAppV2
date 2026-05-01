import { describe, expect, it } from "vitest";
import { mapAdminTrialEventSearchResponse } from "../internal/map-admin-trial-event-search-response";

describe("mapAdminTrialEventSearchResponse", () => {
  it("maps db rows to the public response", () => {
    expect(
      mapAdminTrialEventSearchResponse(
        {
          query: "helsinki",
          page: 2,
          pageSize: 20,
          sort: "date-desc",
          mode: "year",
          year: 2026,
          dateFromIso: null,
          dateToIso: null,
          rangeFromDate: null,
          rangeToExclusive: null,
        },
        {
          mode: "year",
          year: 2026,
          dateFromIso: null,
          dateToIso: null,
          result: {
            availableEventDates: [new Date("2026-04-14T00:00:00.000Z")],
            total: 1,
            totalPages: 1,
            page: 1,
            items: [
              {
                trialEventId: "event-1",
                eventDate: new Date("2026-04-14T00:00:00.000Z"),
                eventPlace: "Helsinki",
                eventName: "Kevatkoe",
                organizer: "Jarjestaja",
                judge: "Judge",
                sklKoeId: 12345,
                dogCount: 2,
              },
            ],
          },
        },
      ),
    ).toEqual({
      filters: {
        mode: "year",
        year: 2026,
        dateFrom: null,
        dateTo: null,
      },
      availableYears: [2026],
      total: 1,
      totalPages: 1,
      page: 1,
      items: [
        {
          trialEventId: "event-1",
          eventDate: "2026-04-14",
          eventPlace: "Helsinki",
          eventName: "Kevatkoe",
          organizer: "Jarjestaja",
          judge: "Judge",
          sklKoeId: 12345,
          dogCount: 2,
        },
      ],
    });
  });

  it("falls back to the db year when no mode is selected", () => {
    expect(
      mapAdminTrialEventSearchResponse(
        {
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
        },
        {
          mode: "year",
          year: 2025,
          dateFromIso: null,
          dateToIso: null,
          result: {
            availableEventDates: [],
            total: 0,
            totalPages: 0,
            page: 1,
            items: [],
          },
        },
      ),
    ).toEqual({
      filters: {
        mode: "year",
        year: 2025,
        dateFrom: null,
        dateTo: null,
      },
      availableYears: [],
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    });
  });

  it("maps range filters when the request uses range mode", () => {
    expect(
      mapAdminTrialEventSearchResponse(
        {
          query: "",
          page: 1,
          pageSize: 20,
          sort: "date-desc",
          mode: "range",
          year: null,
          dateFromIso: "2026-01-01",
          dateToIso: "2026-01-31",
          rangeFromDate: new Date("2026-01-01T00:00:00.000Z"),
          rangeToExclusive: new Date("2026-02-01T00:00:00.000Z"),
        },
        {
          mode: "range",
          year: null,
          dateFromIso: "2026-01-01",
          dateToIso: "2026-01-31",
          result: {
            availableEventDates: [new Date("2026-01-01T00:00:00.000Z")],
            total: 0,
            totalPages: 0,
            page: 1,
            items: [],
          },
        },
      ),
    ).toEqual({
      filters: {
        mode: "range",
        year: null,
        dateFrom: "2026-01-01",
        dateTo: "2026-01-31",
      },
      availableYears: [2026],
      total: 0,
      totalPages: 0,
      page: 1,
      items: [],
    });
  });
});
