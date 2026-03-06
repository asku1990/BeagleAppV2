import { describe, expect, it } from "vitest";
import type { BeagleShowsQueryState } from "@/lib/public/beagle/shows";
import {
  readUrlShowsState,
  toShowsQueryString,
} from "../use-beagle-shows-ui-state";

function readParams(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("useBeagleShowsUiState helpers", () => {
  it("parses year mode values with safe fallbacks", () => {
    const params = readParams("year=%202025%20&page=0&pageSize=500&sort=bad");

    const state = readUrlShowsState(params);

    expect(state.mode).toBe("year");
    expect(state.year).toBe("2025");
    expect(state.page).toBe(1);
    expect(state.pageSize).toBe(10);
    expect(state.sort).toBe("date-desc");
  });

  it("drops out-of-range year from url state", () => {
    const state = readUrlShowsState(readParams("year=1800"));
    expect(state.mode).toBe("year");
    expect(state.year).toBe("");
  });

  it("parses range mode and valid iso dates", () => {
    const state = readUrlShowsState(
      readParams(
        "mode=range&dateFrom=2025-01-01&dateTo=2025-12-31&page=2&pageSize=25&sort=date-asc",
      ),
    );

    expect(state).toEqual({
      mode: "range",
      year: "",
      dateFrom: "2025-01-01",
      dateTo: "2025-12-31",
      page: 2,
      pageSize: 25,
      sort: "date-asc",
    });
  });

  it("falls back to range mode when date filter exists without mode", () => {
    const state = readUrlShowsState(readParams("dateFrom=2025-01-01"));
    expect(state.mode).toBe("range");
    expect(state.dateFrom).toBe("2025-01-01");
  });

  it("serializes only non-default values", () => {
    const state: BeagleShowsQueryState = {
      mode: "year",
      year: "2025",
      dateFrom: "",
      dateTo: "",
      page: 1,
      pageSize: 10,
      sort: "date-desc",
    };

    expect(toShowsQueryString(state)).toBe("year=2025");
  });

  it("serializes range filters and sorting", () => {
    const state: BeagleShowsQueryState = {
      mode: "range",
      year: "",
      dateFrom: "2025-01-01",
      dateTo: "2025-01-31",
      page: 3,
      pageSize: 50,
      sort: "date-asc",
    };

    const params = readParams(toShowsQueryString(state));

    expect(params.get("mode")).toBe("range");
    expect(params.get("dateFrom")).toBe("2025-01-01");
    expect(params.get("dateTo")).toBe("2025-01-31");
    expect(params.get("page")).toBe("3");
    expect(params.get("pageSize")).toBe("50");
    expect(params.get("sort")).toBe("date-asc");
  });
});
