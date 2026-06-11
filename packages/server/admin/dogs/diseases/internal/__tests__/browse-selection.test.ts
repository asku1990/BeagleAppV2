import { describe, expect, it } from "vitest";
import {
  MAX_DISEASE_SEARCH_QUERY_LENGTH,
  normalizeDiseaseSearchQuery,
} from "../browse-selection";

describe("normalizeDiseaseSearchQuery", () => {
  it("returns an empty string for blank input", () => {
    expect(normalizeDiseaseSearchQuery(undefined)).toBe("");
    expect(normalizeDiseaseSearchQuery(null)).toBe("");
    expect(normalizeDiseaseSearchQuery("   ")).toBe("");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeDiseaseSearchQuery("   kide  ")).toBe("kide");
  });

  it("truncates long queries to the maximum length", () => {
    const longQuery = "x".repeat(MAX_DISEASE_SEARCH_QUERY_LENGTH + 25);

    expect(normalizeDiseaseSearchQuery(longQuery)).toHaveLength(
      MAX_DISEASE_SEARCH_QUERY_LENGTH,
    );
    expect(normalizeDiseaseSearchQuery(longQuery)).toBe(
      "x".repeat(MAX_DISEASE_SEARCH_QUERY_LENGTH),
    );
  });
});
