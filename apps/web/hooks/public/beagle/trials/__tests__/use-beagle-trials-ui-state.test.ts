import { describe, expect, it } from "vitest";
import type { BeagleTrialsQueryState } from "@/lib/public/beagle/trials";
import {
  readUrlTrialsState,
  toTrialsQueryString,
} from "../use-beagle-trials-ui-state";

function readParams(query: string): URLSearchParams {
  return new URLSearchParams(query);
}

describe("useBeagleTrialsUiState helpers", () => {
  it("parses year mode values with safe fallbacks", () => {
    const params = readParams("year=%202025%20&page=0&pageSize=500&sort=bad");

    const state = readUrlTrialsState(params);

    expect(state.mode).toBe("year");
    expect(state.year).toBe("2025");
    expect(state.page).toBe(1);
    expect(state.pageSize).toBe(10);
    expect(state.sort).toBe("date-desc");
  });

  it("parses range mode and valid iso dates", () => {
    const state = readUrlTrialsState(
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

  it("serializes only non-default values", () => {
    const state: BeagleTrialsQueryState = {
      mode: "year",
      year: "2025",
      dateFrom: "",
      dateTo: "",
      page: 1,
      pageSize: 10,
      sort: "date-desc",
    };

    expect(toTrialsQueryString(state)).toBe("year=2025");
  });
});
