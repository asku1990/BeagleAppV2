import { createHash } from "node:crypto";
import type {
  AdminDogImportPreviewRow,
  DogImportField,
  DogImportIssue,
} from "@beagle/contracts";
import type { DogImportStateDb, DogImportWritePlanDb } from "@beagle/db";
import type { DogImportDogUpdateData } from "@db/admin/dogs/import/types";
import { isValidRegistrationNo } from "@server/dogs/core/registration";
import type { CanonicalDogImportRow } from "../model/canonical-dog-import";
import { issueFromDogImportFact } from "../issues/dog-import-issues";
import { issueFromFinnishWorkbookFact } from "../issues/finnish-workbook-issues";
import { DOG_IMPORT_POLICY_VERSION } from "../policy/dog-import-policy";
import type { FinnishWorkbookFact } from "../sources/finnish-kennel-club/parse-finnish-kennel-club-workbook";

export type DogImportEvaluation = {
  rows: AdminDogImportPreviewRow[];
  issues: DogImportIssue[];
  applyAllowed: boolean;
  previewDigest: string;
  plan: DogImportWritePlanDb;
  createCount: number;
  updateCount: number;
  unchangedCount: number;
  blockedCount: number;
  referenceCount: number;
};
const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (
    value !== null &&
    typeof value === "object" &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  )
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, entry]) => `${JSON.stringify(key)}:${canonical(entry)}`)
      .join(",")}}`;
  return JSON.stringify(value) ?? "null";
};
const digest = (value: unknown) =>
  createHash("sha256").update(canonical(value)).digest("hex");
const dateValue = (value: Date | null) =>
  value?.toISOString().slice(0, 10) ?? null;

/** Converts parsed rows and the current state into the only plan that may be written. */
export function evaluateDogImportRows(
  rows: readonly CanonicalDogImportRow[],
  state: DogImportStateDb,
  facts: readonly FinnishWorkbookFact[] = [],
): DogImportEvaluation {
  const parserIssues = facts
    .slice()
    .sort(
      (a, b) =>
        (a.sourceRowNumber ?? 0) - (b.sourceRowNumber ?? 0) ||
        a.code.localeCompare(b.code) ||
        (a.columnIndex ?? -1) - (b.columnIndex ?? -1) ||
        (a.header ?? "").localeCompare(b.header ?? ""),
    )
    .map(issueFromFinnishWorkbookFact);
  const parserIssuesByRow = new Map<number, DogImportIssue[]>();
  for (const issue of parserIssues) {
    if (issue.sourceRowNumber === null) continue;
    const rowIssues = parserIssuesByRow.get(issue.sourceRowNumber) ?? [];
    rowIssues.push(issue);
    parserIssuesByRow.set(issue.sourceRowNumber, rowIssues);
  }
  const issues: DogImportIssue[] = [...parserIssues];
  const byRegistration = new Map<string, DogImportStateDb["dogs"][number]>();
  for (const dog of state.dogs) {
    if (byRegistration.has(dog.registrationNo))
      issues.push(
        issueFromDogImportFact({
          code: "REGISTRATION_CANONICAL_COLLISION",
          registrationNo: dog.registrationNo,
        }),
      );
    byRegistration.set(dog.registrationNo, dog);
  }
  const seen = new Set<string>();
  const references = new Map<string, "MALE" | "FEMALE">();
  const creates: DogImportWritePlanDb["creates"] = [];
  const updates: DogImportWritePlanDb["updates"] = [];
  const previewRows: AdminDogImportPreviewRow[] = [];
  for (const row of [...rows].sort(
    (a, b) => a.sourceRowNumber - b.sourceRowNumber,
  )) {
    const rowIssues: DogImportIssue[] = [
      ...(parserIssuesByRow.get(row.sourceRowNumber) ?? []),
    ];
    const add = (
      code: Parameters<typeof issueFromDogImportFact>[0]["code"],
      field: DogImportField | null = null,
    ) =>
      rowIssues.push(
        issueFromDogImportFact({
          code,
          field,
          registrationNo: row.registrationNo,
          sourceRowNumber: row.sourceRowNumber,
        }),
      );
    if (!row.registrationNo) add("REGISTRATION_INVALID", "registrationNo");
    else if (row.registrationNo.length > 40)
      add("REGISTRATION_TOO_LONG", "registrationNo");
    else if (!isValidRegistrationNo(row.registrationNo))
      add("REGISTRATION_INVALID", "registrationNo");
    else if (seen.has(row.registrationNo))
      add("DUPLICATE_SOURCE_REGISTRATION", "registrationNo");
    else seen.add(row.registrationNo);
    if (!row.name) add("REQUIRED_VALUE_MISSING", "name");
    else if (row.name.length > 120) add("DOG_NAME_TOO_LONG", "name");
    if (!row.sex) add("DOG_SEX_INVALID", "sex");
    for (const [field, value] of [
      ["sireRegistrationNo", row.sireRegistrationNo],
      ["damRegistrationNo", row.damRegistrationNo],
    ] as const) {
      if (!value) add("PARENT_REGISTRATION_INVALID", field);
      else if (value === row.registrationNo)
        add("PARENT_SELF_REFERENCE", field);
    }
    if (
      row.sireRegistrationNo &&
      row.sireRegistrationNo === row.damRegistrationNo
    )
      add("PARENT_SAME_IDENTITY");
    if (row.sireRegistrationNo && row.damRegistrationNo) {
      const sireRole = references.get(row.sireRegistrationNo);
      const damRole = references.get(row.damRegistrationNo);
      if (sireRole === "FEMALE" || damRole === "MALE")
        add("PARENT_ROLE_AMBIGUOUS");
      references.set(row.sireRegistrationNo, "MALE");
      references.set(row.damRegistrationNo, "FEMALE");
    }
    const existing = row.registrationNo
      ? byRegistration.get(row.registrationNo)
      : undefined;
    if (
      existing &&
      row.name &&
      existing.name !== row.name &&
      existing.name.trim().toLocaleLowerCase("fi-FI") !==
        row.name.trim().toLocaleLowerCase("fi-FI")
    )
      add("DOG_NAME_CONFLICT", "name");
    if (
      existing &&
      row.sex &&
      existing.sex !== "UNKNOWN" &&
      existing.sex !== row.sex
    )
      add("DOG_SEX_CONFLICT", "sex");
    if (
      existing &&
      row.birthDate &&
      dateValue(existing.birthDate) &&
      dateValue(existing.birthDate) !== row.birthDate
    )
      add("DOG_BIRTH_DATE_CONFLICT", "birthDate");
    let uniqueRowIssues = rowIssues.filter(
      (issue, index, all) =>
        all.findIndex(
          (candidate) => canonical(candidate) === canonical(issue),
        ) === index,
    );
    issues.push(
      ...uniqueRowIssues.filter(
        (issue) =>
          !parserIssues.some(
            (parserIssue) => canonical(parserIssue) === canonical(issue),
          ),
      ),
    );
    if (uniqueRowIssues.some((issue) => issue.severity === "BLOCKER")) {
      previewRows.push({
        sourceRowNumber: row.sourceRowNumber,
        registrationNo: row.registrationNo,
        name: row.name,
        status: "BLOCKED",
        issues: uniqueRowIssues,
      });
      continue;
    }
    const colorMatches = row.colorName
      ? state.colors.filter(
          (color) =>
            color.nameFi.trim().toLocaleLowerCase("fi-FI") ===
            row.colorName!.trim().toLocaleLowerCase("fi-FI"),
        )
      : [];
    const colorCode =
      colorMatches.length === 1
        ? colorMatches[0]!.code
        : (existing?.colorCode ?? null);
    if (row.colorName && colorMatches.length !== 1) {
      const issue = issueFromDogImportFact({
        code: "DOG_COLOR_UNRESOLVED",
        registrationNo: row.registrationNo,
        sourceRowNumber: row.sourceRowNumber,
        field: "colorName",
      });
      rowIssues.push(issue);
      issues.push(issue);
      uniqueRowIssues = [...uniqueRowIssues, issue];
    }
    if (!existing) {
      creates.push({
        registrationNo: row.registrationNo!,
        name: row.name!,
        sex: row.sex!,
        birthDate: row.birthDate,
        registeredOn: row.registeredOn,
        breederNameText: row.breederNameText,
        originTypeText: row.originTypeText,
        originCountryText: row.originCountryText,
        tailText: row.tailText,
        colorCode,
        sireRegistrationNo: row.sireRegistrationNo!,
        damRegistrationNo: row.damRegistrationNo!,
      });
      previewRows.push({
        sourceRowNumber: row.sourceRowNumber,
        registrationNo: row.registrationNo,
        name: row.name,
        status: "CREATE",
        issues: uniqueRowIssues,
      });
      continue;
    }
    const data: DogImportDogUpdateData = {};
    for (const [key, incoming, current] of [
      ["breederNameText", row.breederNameText, existing.breederNameText],
      ["originTypeText", row.originTypeText, existing.originTypeText],
      ["originCountryText", row.originCountryText, existing.originCountryText],
      ["tailText", row.tailText, existing.tailText],
    ] as const)
      if (incoming && incoming !== current) data[key] = incoming;
    if (colorCode !== existing.colorCode) data.colorCode = colorCode;
    if (existing.status === "REFERENCE_ONLY") {
      data.status = "NORMAL";
      if (existing.name === existing.registrationNo && row.name)
        data.name = row.name;
      if (existing.sex === "UNKNOWN" && row.sex) data.sex = row.sex;
    }
    const parentsChanged =
      !byRegistration.has(row.sireRegistrationNo!) ||
      existing.sireId !== byRegistration.get(row.sireRegistrationNo!)?.id ||
      !byRegistration.has(row.damRegistrationNo!) ||
      existing.damId !== byRegistration.get(row.damRegistrationNo!)?.id;
    if (
      Object.keys(data).length ||
      parentsChanged ||
      (row.registeredOn &&
        dateValue(existing.registeredOn) !== row.registeredOn)
    ) {
      updates.push({
        id: existing.id,
        registrationId: existing.registrationId,
        expectedUpdatedAt: existing.updatedAt,
        expectedRegistrationUpdatedAt: existing.registrationUpdatedAt,
        data,
        registeredOn: row.registeredOn,
        sireRegistrationNo: row.sireRegistrationNo!,
        damRegistrationNo: row.damRegistrationNo!,
      });
      previewRows.push({
        sourceRowNumber: row.sourceRowNumber,
        registrationNo: row.registrationNo,
        name: row.name,
        status: "UPDATE",
        issues: uniqueRowIssues,
      });
    } else
      previewRows.push({
        sourceRowNumber: row.sourceRowNumber,
        registrationNo: row.registrationNo,
        name: row.name,
        status: "UNCHANGED",
        issues: uniqueRowIssues,
      });
  }
  const full = new Set(rows.map((row) => row.registrationNo).filter(Boolean));
  const referenceRows = [...references]
    .filter(
      ([registrationNo]) =>
        !full.has(registrationNo) && !byRegistration.has(registrationNo),
    )
    .map(([registrationNo, sex]) => ({ registrationNo, sex }))
    .sort((a, b) => a.registrationNo.localeCompare(b.registrationNo));
  for (const reference of referenceRows)
    issues.push(
      issueFromDogImportFact({
        code: "REFERENCE_PARENT_PLANNED",
        registrationNo: reference.registrationNo,
      }),
    );
  const plan = { creates, updates, references: referenceRows };
  const blockedCount = previewRows.filter(
    (row) => row.status === "BLOCKED",
  ).length;
  const applyAllowed =
    blockedCount === 0 && !issues.some((issue) => issue.severity === "BLOCKER");
  return {
    rows: previewRows,
    issues: issues.sort(
      (a, b) =>
        (a.sourceRowNumber ?? 0) - (b.sourceRowNumber ?? 0) ||
        a.code.localeCompare(b.code),
    ),
    applyAllowed,
    previewDigest: digest({
      policyVersion: DOG_IMPORT_POLICY_VERSION,
      rows,
      issues,
      plan,
      state: state.dogs.map((dog) => [
        dog.id,
        dog.updatedAt.toISOString(),
        dog.registrationId,
        dog.registrationUpdatedAt.toISOString(),
      ]),
    }),
    plan,
    createCount: creates.length,
    updateCount: updates.length,
    unchangedCount: previewRows.filter((row) => row.status === "UNCHANGED")
      .length,
    blockedCount,
    referenceCount: referenceRows.length,
  };
}
