import { describe, expect, it } from "vitest";
import { formatTrialMirrorValidationReport } from "../report";
import type { TrialMirrorValidationReport } from "../validate-trial-mirror";

describe("formatTrialMirrorValidationReport", () => {
  it("formats counts, severity totals, code totals, and samples", () => {
    const report: TrialMirrorValidationReport = {
      counts: {
        akoeall: 1,
        bealt: 0,
        bealt0: 0,
        bealt1: 0,
        bealt2: 1,
        bealt3: 0,
      },
      totalRows: 2,
      detailRowsWithAkoeall: 1,
      akoeallRowsWithDetails: 1,
      akoeallRowsWithoutDetails: 0,
      issueCounts: { ERROR: 1, WARNING: 0, INFO: 0 },
      issues: [
        {
          severity: "ERROR",
          code: "TRIAL_MIRROR_INVALID_TAPPV",
          message: "Mirror row has an invalid legacy trial date.",
          sourceTable: "akoeall",
          key: "FI-1/24|Oulu|bad",
          field: "tappv",
          value: "bad",
        },
      ],
    };

    expect(formatTrialMirrorValidationReport(report)).toEqual(
      expect.arrayContaining([
        "Trial mirror validation",
        "- akoeall: 1",
        "- total: 2",
        "- ERROR: 1",
        "- TRIAL_MIRROR_INVALID_TAPPV: 1",
        "[ERROR] TRIAL_MIRROR_INVALID_TAPPV table=akoeall key=FI-1/24|Oulu|bad field=tappv value=bad - Mirror row has an invalid legacy trial date.",
      ]),
    );
  });
});
