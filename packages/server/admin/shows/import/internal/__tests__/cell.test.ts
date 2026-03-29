import { describe, expect, it } from "vitest";
import { normalizeWorkbookDateIso } from "../cell";

describe("normalizeWorkbookDateIso", () => {
  it("parses 1900 date system serial numbers without timezone drift", () => {
    expect(normalizeWorkbookDateIso(45675)).toBe("2025-01-18");
  });

  it("parses 1904 date system serial numbers without timezone drift", () => {
    expect(normalizeWorkbookDateIso(44213, { date1904: true })).toBe(
      "2025-01-18",
    );
  });
});
