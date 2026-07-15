import { describe, expect, it } from "vitest";
import {
  adminDogListRequestKeyParts,
  shouldRefetchAdminDogSearch,
} from "../dog-search-request";

describe("admin dog search request", () => {
  it("normalizes omitted filters to the query key defaults", () => {
    expect(adminDogListRequestKeyParts({})).toEqual([
      "",
      null,
      null,
      1,
      20,
      "name-asc",
    ]);
  });

  it("refetches only when submitted filters match an applied search", () => {
    const filters = {
      query: "kide",
      sex: "FEMALE" as const,
      status: "REFERENCE_ONLY" as const,
      page: 1,
      pageSize: 50,
      sort: "name-asc" as const,
    };

    expect(shouldRefetchAdminDogSearch(null, filters)).toBe(false);
    expect(shouldRefetchAdminDogSearch(filters, { ...filters })).toBe(true);
    expect(
      shouldRefetchAdminDogSearch(filters, { ...filters, status: "NORMAL" }),
    ).toBe(false);
  });
});
