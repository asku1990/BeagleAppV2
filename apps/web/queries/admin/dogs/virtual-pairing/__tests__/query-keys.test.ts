import { describe, expect, it } from "vitest";
import {
  adminVirtualPairingSearchQueryKey,
  adminVirtualPairingSearchQueryKeyRoot,
} from "../query-keys";

describe("admin virtual pairing query keys", () => {
  it("uses default paging values when page fields are missing", () => {
    expect(
      adminVirtualPairingSearchQueryKey({
        field: "name",
        query: "kide",
      }),
    ).toEqual([
      ...adminVirtualPairingSearchQueryKeyRoot,
      "name",
      "kide",
      1,
      10,
    ]);
  });

  it("keeps explicit paging values", () => {
    expect(
      adminVirtualPairingSearchQueryKey({
        field: "reg",
        query: "FI12345/21",
        page: 3,
        pageSize: 25,
      }),
    ).toEqual([
      ...adminVirtualPairingSearchQueryKeyRoot,
      "reg",
      "FI12345/21",
      3,
      25,
    ]);
  });
});
