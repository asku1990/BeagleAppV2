import { describe, expect, it } from "vitest";
import type {
  LegacyTrialMirrorAkoeallValidationRow,
  LegacyTrialMirrorDetailValidationRow,
  LegacyTrialMirrorValidationRows,
} from "@beagle/db";
import { validateLegacyTrialMirrorRows } from "../validate-trial-mirror";

function akoeall(
  overrides: Partial<LegacyTrialMirrorAkoeallValidationRow> = {},
): LegacyTrialMirrorAkoeallValidationRow {
  return {
    sourceTable: "akoeall",
    rekno: "FI-1/24",
    tappa: "Oulu",
    tappv: "20240101",
    kennelpiiri: null,
    kennelpiirinro: null,
    ke: null,
    lk: null,
    pa: null,
    piste: "80.00",
    sija: null,
    haku: "8.00",
    hauk: "8.00",
    yva: "8.00",
    hlo: "0.00",
    alo: "0.00",
    tja: null,
    pin: null,
    tuom1: null,
    muokattuRaw: "2024-01-01 12:00:00",
    vara: null,
    rawPayloadJson: "{}",
    sourceHash: "a".repeat(64),
    ...overrides,
  };
}

function detail(
  overrides: Partial<LegacyTrialMirrorDetailValidationRow> = {},
): LegacyTrialMirrorDetailValidationRow {
  return {
    sourceTable: "bealt2",
    rekno: "FI-1/24",
    tappa: "Oulu",
    tappv: "20240101",
    era: 1,
    hakumin: 10,
    ajomin: 20,
    haku: "8.00",
    hauk: "8.00",
    yva: "8.00",
    hlo: "0.00",
    alo: "0.00",
    tja: null,
    pin: null,
    muokattuRaw: "2024-01-01 12:00:00",
    rawPayloadJson: "{}",
    sourceHash: "b".repeat(64),
    ...overrides,
  };
}

function validate(rows: Partial<LegacyTrialMirrorValidationRows>) {
  return validateLegacyTrialMirrorRows({
    akoeall: rows.akoeall ?? [],
    details: rows.details ?? [],
  });
}

describe("validateLegacyTrialMirrorRows", () => {
  it("reports clean relationship counts when details match akoeall", () => {
    const report = validate({
      akoeall: [akoeall()],
      details: [detail()],
    });

    expect(report.issueCounts.ERROR).toBe(0);
    expect(report.akoeallRowsWithDetails).toBe(1);
    expect(report.detailRowsWithAkoeall).toBe(1);
  });

  it("reports orphan detail rows and akoeall rows without details", () => {
    const report = validate({
      akoeall: [akoeall({ rekno: "FI-1/24" })],
      details: [detail({ rekno: "FI-2/24" })],
    });

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "WARNING",
          code: "TRIAL_MIRROR_BEALT2_WITHOUT_AKOEALL",
        }),
        expect.objectContaining({
          severity: "INFO",
          code: "TRIAL_MIRROR_AKOEALL_WITHOUT_DETAILS",
        }),
      ]),
    );
  });

  it("reports orphan detail rows with table-specific codes", () => {
    const report = validate({
      akoeall: [akoeall({ rekno: "FI-1/24" })],
      details: [
        detail({ sourceTable: "bealt0", rekno: "FI-2/24" }),
        detail({ sourceTable: "bealt3", rekno: "FI-3/24" }),
      ],
    });

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "TRIAL_MIRROR_BEALT0_WITHOUT_AKOEALL",
        }),
        expect.objectContaining({
          code: "TRIAL_MIRROR_BEALT3_WITHOUT_AKOEALL",
        }),
      ]),
    );
    expect(report.detailRowsWithAkoeall).toBe(0);
    expect(report.akoeallRowsWithDetails).toBe(0);
  });

  it("does not report legacy zero-date muokattu values", () => {
    const report = validate({
      akoeall: [akoeall({ muokattuRaw: "0000-00-00 00:00:00" })],
    });

    expect(report.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "TRIAL_MIRROR_ZERO_MUOKATTU" }),
      ]),
    );
  });

  it("reports invalid dates, malformed hashes, and invalid payload json", () => {
    const report = validate({
      akoeall: [
        akoeall({
          tappv: "20240231",
          sourceHash: "bad",
          rawPayloadJson: "{",
        }),
      ],
    });

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "TRIAL_MIRROR_INVALID_TAPPV" }),
        expect.objectContaining({ code: "TRIAL_MIRROR_INVALID_SOURCE_HASH" }),
        expect.objectContaining({ code: "TRIAL_MIRROR_INVALID_RAW_PAYLOAD" }),
      ]),
    );
  });

  it("reports detail rows outside the V1 date-selected rule table", () => {
    const report = validate({
      akoeall: [akoeall()],
      details: [
        detail({ sourceTable: "bealt2" }),
        detail({ sourceTable: "bealt3" }),
      ],
    });

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "INFO",
          code: "TRIAL_MIRROR_DETAIL_OUTSIDE_DATE_RULE_TABLE",
          message:
            "Detail row is stored in bealt2, but V1 date rule for TAPPV 20240101 selects bealt3.",
        }),
      ]),
    );
  });

  it("reports suspicious era and score values", () => {
    const report = validate({
      akoeall: [akoeall()],
      details: [detail({ era: 0, haku: "101.00" })],
    });

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "TRIAL_MIRROR_UNEXPECTED_ERA" }),
        expect.objectContaining({ code: "TRIAL_MIRROR_SCORE_OUT_OF_RANGE" }),
      ]),
    );
  });

  it("allows negative total points for no-prize results", () => {
    const report = validate({
      akoeall: [akoeall({ pa: "0", piste: "-1.00" })],
    });

    expect(report.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "TRIAL_MIRROR_SCORE_OUT_OF_RANGE" }),
      ]),
    );
  });

  it("reports negative total points for prize results", () => {
    const report = validate({
      akoeall: [akoeall({ pa: "1", piste: "-1.00" })],
    });

    expect(report.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "piste",
          code: "TRIAL_MIRROR_SCORE_OUT_OF_RANGE",
        }),
      ]),
    );
  });
});
