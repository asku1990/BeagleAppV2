import { describe, expect, it } from "vitest";
import { formatLegacyImportSummary } from "../phase-summary";

describe("formatLegacyImportSummary", () => {
  it("formats phase1 with the relevant counters only", () => {
    const summary = formatLegacyImportSummary({
      kind: "LEGACY_PHASE1",
      dogsUpserted: 12,
      ownersUpserted: 3,
      ownershipsUpserted: 4,
      errorsCount: 1,
    });

    expect(summary).toBe("Phase 1: dogs=12, owners=3, ownerships=4, errors=1.");
    expect(summary).not.toContain("trialResults=");
    expect(summary).not.toContain("showResults=");
    expect(summary).not.toContain("titles=");
  });

  it("formats phase1.5 with title-specific counters", () => {
    const summary = formatLegacyImportSummary({
      kind: "LEGACY_PHASE1_5",
      titlesInserted: 7,
      skippedBlank: 2,
      conflicts: 1,
      errorsCount: 4,
    });

    expect(summary).toBe(
      "Phase 1.5: titles=7, skippedBlank=2, conflicts=1, errors=4.",
    );
    expect(summary).not.toContain("dogs=");
    expect(summary).not.toContain("owners=");
    expect(summary).not.toContain("trialResults=");
    expect(summary).not.toContain("showResults=");
  });

  it("formats phase2 with trial counters only", () => {
    const summary = formatLegacyImportSummary({
      kind: "LEGACY_PHASE2",
      trialResultsUpserted: 9,
      errorsCount: 0,
    });

    expect(summary).toBe("Phase 2: trialResults=9, errors=0.");
    expect(summary).not.toContain("dogs=");
    expect(summary).not.toContain("owners=");
    expect(summary).not.toContain("titles=");
    expect(summary).not.toContain("showResults=");
  });

  it("formats phase3 with show counters only", () => {
    const summary = formatLegacyImportSummary({
      kind: "LEGACY_PHASE3",
      showResultsUpserted: 11,
      errorsCount: 6,
    });

    expect(summary).toBe("Phase 3: showResults=11, errors=6.");
    expect(summary).not.toContain("dogs=");
    expect(summary).not.toContain("owners=");
    expect(summary).not.toContain("titles=");
    expect(summary).not.toContain("trialResults=");
  });
});
