import { describe, expect, it } from "vitest";
import {
  createImportIssueSummaryCollector,
  formatImportIssueSummary,
} from "../issue-summary";

describe("issue summary formatter", () => {
  it("collects run totals, top codes, and samples incrementally", () => {
    const collector = createImportIssueSummaryCollector();
    collector.add({
      stage: "dogs",
      severity: "WARNING",
      code: "DOG_MISSING_REQUIRED_FIELDS",
      message: "dog issue",
      registrationNo: "FI-1/20",
      sourceTable: "bearek_id",
      payloadJson: null,
    });
    collector.add({
      stage: "run",
      severity: "ERROR",
      code: "UNEXPECTED_EXCEPTION",
      message: "run failed",
      registrationNo: null,
      sourceTable: null,
      payloadJson: null,
    });
    collector.add({
      stage: "owners",
      severity: "WARNING",
      code: "OWNER_MISSING_REQUIRED_FIELDS",
      message: "owner issue",
      registrationNo: "FI-2/20",
      sourceTable: "beaom",
      payloadJson: null,
    });

    const summary = collector.build();

    expect(summary.total).toBe(3);
    expect(summary.topCodes).toEqual([
      { code: "DOG_MISSING_REQUIRED_FIELDS", count: 1 },
      { code: "OWNER_MISSING_REQUIRED_FIELDS", count: 1 },
      { code: "UNEXPECTED_EXCEPTION", count: 1 },
    ]);
    expect(summary.samples).toHaveLength(3);
  });

  it("formats run-level issue summary lines", () => {
    const collector = createImportIssueSummaryCollector();
    collector.add({
      stage: "trials",
      severity: "WARNING",
      code: "TRIAL_REGISTRATION_INVALID_FORMAT",
      message: "trial issue",
      registrationNo: "bad",
      sourceTable: "akoeall",
      payloadJson: null,
    });

    const lines = formatImportIssueSummary(collector.build());

    expect(lines).toEqual([
      "Issue summary: total=1",
      "Top issue codes:",
      "  TRIAL_REGISTRATION_INVALID_FORMAT = 1",
      "Sample issues:",
      "  [trials/WARNING/TRIAL_REGISTRATION_INVALID_FORMAT] reg=bad table=akoeall msg=trial issue",
    ]);
  });
});
