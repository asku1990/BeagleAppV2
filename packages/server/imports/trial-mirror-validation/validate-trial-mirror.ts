import {
  loadLegacyTrialMirrorValidationRowsDb,
  type LegacyTrialMirrorAkoeallValidationRow,
  type LegacyTrialMirrorDetailTableName,
  type LegacyTrialMirrorDetailValidationRow,
  type LegacyTrialMirrorValidationRows,
} from "@beagle/db";
import {
  isValidRegistrationNo,
  normalizeRegistrationNo,
  parseLegacyDate,
} from "../core";

export type TrialMirrorValidationSeverity = "ERROR" | "WARNING" | "INFO";

export type TrialMirrorValidationIssue = {
  severity: TrialMirrorValidationSeverity;
  code: string;
  message: string;
  sourceTable: string;
  key: string | null;
  field: string | null;
  value: string | number | null;
};

export type TrialMirrorValidationReport = {
  counts: Record<"akoeall" | LegacyTrialMirrorDetailTableName, number>;
  totalRows: number;
  detailRowsWithAkoeall: number;
  akoeallRowsWithDetails: number;
  akoeallRowsWithoutDetails: number;
  issueCounts: Record<TrialMirrorValidationSeverity, number>;
  issues: TrialMirrorValidationIssue[];
};

type ValidationRow =
  | LegacyTrialMirrorAkoeallValidationRow
  | LegacyTrialMirrorDetailValidationRow;

const COMMON_SCORE_FIELDS = [
  "haku",
  "hauk",
  "yva",
  "hlo",
  "alo",
  "tja",
  "pin",
] as const;

const HASH_PATTERN = /^[a-f0-9]{64}$/;
const MUOKATTU_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

function rowKey(row: Pick<ValidationRow, "rekno" | "tappa" | "tappv">): string {
  return `${row.rekno}|${row.tappa}|${row.tappv}`;
}

function detailKey(row: LegacyTrialMirrorDetailValidationRow): string {
  return `${rowKey(row)}|${row.era}`;
}

function expectedDetailTableForDate(
  tappv: string,
): LegacyTrialMirrorDetailTableName | null {
  const parsed = Number.parseInt(tappv, 10);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 20020801) return "bealt0";
  if (parsed > 20020801 && parsed < 20050801) return "bealt1";
  if (parsed > 20050801 && parsed < 20110801) return "bealt2";
  if (parsed > 20110801) return "bealt3";
  return null;
}

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

function addIssue(
  issues: TrialMirrorValidationIssue[],
  issue: TrialMirrorValidationIssue,
) {
  issues.push(issue);
}

function detailWithoutAkoeallCode(
  sourceTable: LegacyTrialMirrorDetailTableName,
): string {
  return `TRIAL_MIRROR_${sourceTable.toUpperCase()}_WITHOUT_AKOEALL`;
}

function validateCommonRow(
  row: ValidationRow,
  issues: TrialMirrorValidationIssue[],
) {
  const key = "era" in row ? detailKey(row) : rowKey(row);

  for (const field of ["rekno", "tappa", "tappv"] as const) {
    if (isBlank(row[field])) {
      addIssue(issues, {
        severity: "ERROR",
        code: "TRIAL_MIRROR_BLANK_KEY_PART",
        message: "Mirror row has a blank legacy key part.",
        sourceTable: row.sourceTable,
        key,
        field,
        value: row[field],
      });
    }
  }

  if (!parseLegacyDate(row.tappv)) {
    addIssue(issues, {
      severity: "ERROR",
      code: "TRIAL_MIRROR_INVALID_TAPPV",
      message: "Mirror row has an invalid legacy trial date.",
      sourceTable: row.sourceTable,
      key,
      field: "tappv",
      value: row.tappv,
    });
  }

  const normalizedRegistrationNo = normalizeRegistrationNo(row.rekno);
  if (
    !normalizedRegistrationNo ||
    !isValidRegistrationNo(normalizedRegistrationNo)
  ) {
    addIssue(issues, {
      severity: "WARNING",
      code: "TRIAL_MIRROR_INVALID_REKNO",
      message: "Mirror row registration number does not match runtime format.",
      sourceTable: row.sourceTable,
      key,
      field: "rekno",
      value: row.rekno,
    });
  }

  if (
    row.muokattuRaw !== "0000-00-00 00:00:00" &&
    !MUOKATTU_PATTERN.test(row.muokattuRaw)
  ) {
    addIssue(issues, {
      severity: "WARNING",
      code: "TRIAL_MIRROR_INVALID_MUOKATTU",
      message: "Mirror row has an unexpected MUOKATTU shape.",
      sourceTable: row.sourceTable,
      key,
      field: "muokattuRaw",
      value: row.muokattuRaw,
    });
  }

  if (!row.sourceHash || !HASH_PATTERN.test(row.sourceHash)) {
    addIssue(issues, {
      severity: "ERROR",
      code: "TRIAL_MIRROR_INVALID_SOURCE_HASH",
      message: "Mirror row source hash is missing or malformed.",
      sourceTable: row.sourceTable,
      key,
      field: "sourceHash",
      value: row.sourceHash,
    });
  }

  try {
    JSON.parse(row.rawPayloadJson);
  } catch {
    addIssue(issues, {
      severity: "ERROR",
      code: "TRIAL_MIRROR_INVALID_RAW_PAYLOAD",
      message: "Mirror row raw payload is not valid JSON.",
      sourceTable: row.sourceTable,
      key,
      field: "rawPayloadJson",
      value: null,
    });
  }

  if ("piste" in row) {
    validateTotalScore(row, issues, key);
  }

  for (const field of COMMON_SCORE_FIELDS) {
    const value = row[field];
    validateScore(row, issues, key, field, value);
  }
}

function validateTotalScore(
  row: LegacyTrialMirrorAkoeallValidationRow,
  issues: TrialMirrorValidationIssue[],
  key: string,
) {
  const value = row.piste;
  if (value == null) return;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    addIssue(issues, {
      severity: "WARNING",
      code: "TRIAL_MIRROR_SCORE_OUT_OF_RANGE",
      message: "Mirror row score value is outside the broad expected range.",
      sourceTable: row.sourceTable,
      key,
      field: "piste",
      value,
    });
    return;
  }

  if (parsed < 0 && row.pa === "0") {
    return;
  }

  if (parsed < 0 || parsed > 100) {
    addIssue(issues, {
      severity: "WARNING",
      code: "TRIAL_MIRROR_SCORE_OUT_OF_RANGE",
      message: "Mirror row score value is outside the broad expected range.",
      sourceTable: row.sourceTable,
      key,
      field: "piste",
      value,
    });
  }
}

function validateScore(
  row: ValidationRow,
  issues: TrialMirrorValidationIssue[],
  key: string,
  field: string,
  value: string | null,
) {
  if (value == null) return;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    addIssue(issues, {
      severity: "WARNING",
      code: "TRIAL_MIRROR_SCORE_OUT_OF_RANGE",
      message: "Mirror row score value is outside the broad expected range.",
      sourceTable: row.sourceTable,
      key,
      field,
      value,
    });
  }
}

function countIssues(
  issues: TrialMirrorValidationIssue[],
): Record<TrialMirrorValidationSeverity, number> {
  return issues.reduce(
    (counts, issue) => {
      counts[issue.severity] += 1;
      return counts;
    },
    { ERROR: 0, WARNING: 0, INFO: 0 },
  );
}

// Validates frozen legacy trial mirror rows before runtime projection is added.
export function validateLegacyTrialMirrorRows(
  rows: LegacyTrialMirrorValidationRows,
): TrialMirrorValidationReport {
  const issues: TrialMirrorValidationIssue[] = [];
  const akoeallKeys = new Set(rows.akoeall.map(rowKey));
  const akoeallKeysWithDetails = new Set<string>();

  const counts: TrialMirrorValidationReport["counts"] = {
    akoeall: rows.akoeall.length,
    bealt: 0,
    bealt0: 0,
    bealt1: 0,
    bealt2: 0,
    bealt3: 0,
  };

  for (const row of rows.akoeall) {
    validateCommonRow(row, issues);
  }

  for (const row of rows.details) {
    counts[row.sourceTable] += 1;
    validateCommonRow(row, issues);
    const key = rowKey(row);
    const eraKey = detailKey(row);

    if (!akoeallKeys.has(key)) {
      addIssue(issues, {
        severity: "WARNING",
        code: detailWithoutAkoeallCode(row.sourceTable),
        message: `${row.sourceTable} row has no matching akoeall row.`,
        sourceTable: row.sourceTable,
        key: eraKey,
        field: null,
        value: null,
      });
    } else {
      akoeallKeysWithDetails.add(key);
    }

    if (row.era <= 0 || row.era > 4) {
      addIssue(issues, {
        severity: "WARNING",
        code: "TRIAL_MIRROR_UNEXPECTED_ERA",
        message: "Detail row has an unexpected ERA value.",
        sourceTable: row.sourceTable,
        key: eraKey,
        field: "era",
        value: row.era,
      });
    }

    const expectedTable = expectedDetailTableForDate(row.tappv);
    if (expectedTable !== null && row.sourceTable !== expectedTable) {
      addIssue(issues, {
        severity: "INFO",
        code: "TRIAL_MIRROR_DETAIL_OUTSIDE_DATE_RULE_TABLE",
        message:
          "Detail row is in a bealt rule table that V1 would not select for this trial date.",
        sourceTable: row.sourceTable,
        key: eraKey,
        field: "tappv",
        value: row.tappv,
      });
    }
  }

  for (const row of rows.akoeall) {
    const key = rowKey(row);
    if (!akoeallKeysWithDetails.has(key)) {
      addIssue(issues, {
        severity: "INFO",
        code: "TRIAL_MIRROR_AKOEALL_WITHOUT_DETAILS",
        message: "Akoeall row has no matching bealt detail rows.",
        sourceTable: row.sourceTable,
        key,
        field: null,
        value: null,
      });
    }
  }

  return {
    counts,
    totalRows: rows.akoeall.length + rows.details.length,
    detailRowsWithAkoeall: rows.details.filter((row) =>
      akoeallKeys.has(rowKey(row)),
    ).length,
    akoeallRowsWithDetails: akoeallKeysWithDetails.size,
    akoeallRowsWithoutDetails:
      rows.akoeall.length - akoeallKeysWithDetails.size,
    issueCounts: countIssues(issues),
    issues,
  };
}

export async function runLegacyTrialMirrorValidation(): Promise<TrialMirrorValidationReport> {
  const rows = await loadLegacyTrialMirrorValidationRowsDb();
  return validateLegacyTrialMirrorRows(rows);
}
