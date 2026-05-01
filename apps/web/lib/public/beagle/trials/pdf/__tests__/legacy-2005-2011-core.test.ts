import { describe, expect, it } from "vitest";

import { formatLegacy2005To2011Score } from "../rule-sets/legacy-2005-2011/core";

describe("formatLegacy2005To2011Score", () => {
  it("formats scores with two decimals and Finnish decimal separator", () => {
    expect(formatLegacy2005To2011Score(5)).toBe("5,00");
    expect(formatLegacy2005To2011Score(5.6)).toBe("5,60");
    expect(formatLegacy2005To2011Score(14.88)).toBe("14,88");
  });

  it("keeps empty scores blank", () => {
    expect(formatLegacy2005To2011Score(null)).toBe("");
    expect(formatLegacy2005To2011Score(undefined)).toBe("");
  });
});
