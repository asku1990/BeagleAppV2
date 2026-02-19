import { describe, expect, it } from "vitest";
import {
  buildLegacyPattern,
  hasLegacyWildcard,
  matchesLegacyLike,
  resolvePrimarySearchMode,
} from "../legacy-like-match";

describe("legacy-like-match helpers", () => {
  it("detects wildcard characters", () => {
    expect(hasLegacyWildcard("A%B")).toBe(true);
    expect(hasLegacyWildcard("A_B")).toBe(true);
    expect(hasLegacyWildcard("plain")).toBe(false);
  });

  it("resolves primary search mode", () => {
    expect(resolvePrimarySearchMode({ ek: "", reg: "", name: "" })).toBe(
      "none",
    );
    expect(resolvePrimarySearchMode({ ek: "1", reg: "", name: "" })).toBe("ek");
    expect(resolvePrimarySearchMode({ ek: "", reg: "FI-", name: "" })).toBe(
      "reg",
    );
    expect(resolvePrimarySearchMode({ ek: "", reg: "", name: "Alpha" })).toBe(
      "name",
    );
    expect(resolvePrimarySearchMode({ ek: "1", reg: "FI-", name: "" })).toBe(
      "combined",
    );
  });

  it("builds default patterns for non-wildcard values", () => {
    expect(buildLegacyPattern("name", "Alpha")).toBe("%Alpha%");
    expect(buildLegacyPattern("reg", "FI-123")).toBe("FI-123%");
    expect(buildLegacyPattern("ek", "100")).toBe("100");
    expect(buildLegacyPattern("name", "   ")).toBe("");
  });

  it("keeps explicit wildcard patterns as-is", () => {
    expect(buildLegacyPattern("name", "%alpha_")).toBe("%alpha_");
    expect(buildLegacyPattern("reg", "FI-%")).toBe("FI-%");
  });

  it("matches SQL-like wildcard patterns case-insensitively", () => {
    expect(matchesLegacyLike("Alpha", "%alp%")).toBe(true);
    expect(matchesLegacyLike("FI-123/24", "FI-%")).toBe(true);
    expect(matchesLegacyLike("AB", "A_")).toBe(true);
    expect(matchesLegacyLike("AB", "A__")).toBe(false);
    expect(matchesLegacyLike("AB", "")).toBe(false);
  });

  it("escapes regex special characters from plain patterns", () => {
    expect(matchesLegacyLike("A.B", "A.B")).toBe(true);
    expect(matchesLegacyLike("A-B", "A.B")).toBe(false);
  });
});
