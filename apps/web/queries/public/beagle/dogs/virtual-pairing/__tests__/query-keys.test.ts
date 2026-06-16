import { describe, expect, it } from "vitest";
import { publicVirtualPairingSearchQueryKey } from "../query-keys";

describe("publicVirtualPairingSearchQueryKey", () => {
  it("uses default paging values when page fields are omitted", () => {
    expect(
      publicVirtualPairingSearchQueryKey({
        field: "name",
        query: "Kide",
      }),
    ).toEqual([
      "public-dogs",
      "virtual-pairing",
      "search",
      "name",
      "Kide",
      1,
      10,
    ]);
  });

  it("keeps explicit paging values", () => {
    expect(
      publicVirtualPairingSearchQueryKey({
        field: "reg",
        query: "FI12345/21",
        page: 3,
        pageSize: 25,
      }),
    ).toEqual([
      "public-dogs",
      "virtual-pairing",
      "search",
      "reg",
      "FI12345/21",
      3,
      25,
    ]);
  });
});
