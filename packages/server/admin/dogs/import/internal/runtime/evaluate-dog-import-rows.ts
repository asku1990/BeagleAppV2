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
import { compareWithoutClearing } from "../policy/no-clearing-comparison";
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
  const sourceRows = new Map(
    rows.map((sourceRow) => [sourceRow.registrationNo, sourceRow]),
  );
  const sourceRoles = new Map<string, Set<"MALE" | "FEMALE">>();
  for (const sourceRow of rows) {
    if (sourceRow.sireRegistrationNo) {
      const roles = sourceRoles.get(sourceRow.sireRegistrationNo) ?? new Set();
      roles.add("MALE");
      sourceRoles.set(sourceRow.sireRegistrationNo, roles);
    }
    if (sourceRow.damRegistrationNo) {
      const roles = sourceRoles.get(sourceRow.damRegistrationNo) ?? new Set();
      roles.add("FEMALE");
      sourceRoles.set(sourceRow.damRegistrationNo, roles);
    }
  }
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
      currentValue: Parameters<
        typeof issueFromDogImportFact
      >[0]["currentValue"] = null,
      incomingValue: Parameters<
        typeof issueFromDogImportFact
      >[0]["incomingValue"] = null,
    ) =>
      rowIssues.push(
        issueFromDogImportFact({
          code,
          field,
          registrationNo: row.registrationNo,
          sourceRowNumber: row.sourceRowNumber,
          currentValue,
          incomingValue,
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
    for (const [registrationNo, role] of [
      [row.sireRegistrationNo, "MALE"],
      [row.damRegistrationNo, "FEMALE"],
    ] as const) {
      if (!registrationNo) continue;
      const roles = sourceRoles.get(registrationNo);
      if (roles && roles.size > 1) add("PARENT_ROLE_AMBIGUOUS");
      references.set(registrationNo, role);
      const sourceParent = sourceRows.get(registrationNo);
      if (sourceParent && sourceParent.sex && sourceParent.sex !== role)
        add(
          "PARENT_SOURCE_SEX_CONFLICT",
          role === "MALE" ? "sireRegistrationNo" : "damRegistrationNo",
        );
    }
    const existing = row.registrationNo
      ? byRegistration.get(row.registrationNo)
      : undefined;
    const incomingSire = row.sireRegistrationNo
      ? byRegistration.get(row.sireRegistrationNo)
      : undefined;
    const incomingDam = row.damRegistrationNo
      ? byRegistration.get(row.damRegistrationNo)
      : undefined;
    if (
      incomingSire &&
      incomingSire.sex !== "UNKNOWN" &&
      incomingSire.sex !== "MALE"
    )
      add(
        "PARENT_SEX_CONFLICT",
        "sireRegistrationNo",
        incomingSire.sex,
        "MALE",
      );
    if (
      incomingDam &&
      incomingDam.sex !== "UNKNOWN" &&
      incomingDam.sex !== "FEMALE"
    )
      add(
        "PARENT_SEX_CONFLICT",
        "damRegistrationNo",
        incomingDam.sex,
        "FEMALE",
      );
    if (existing && row.name && existing.name !== row.name) {
      const sameFormat =
        existing.name.trim().toLocaleLowerCase("fi-FI") ===
        row.name.trim().toLocaleLowerCase("fi-FI");
      add(
        sameFormat ? "DOG_NAME_FORMAT_DIFFERS" : "DOG_NAME_CONFLICT",
        "name",
        existing.name,
        row.name,
      );
    }
    if (
      existing &&
      row.sex &&
      existing.sex !== "UNKNOWN" &&
      existing.sex !== row.sex
    )
      add("DOG_SEX_CONFLICT", "sex", existing.sex, row.sex);
    if (
      existing &&
      row.birthDate &&
      dateValue(existing.birthDate) &&
      dateValue(existing.birthDate) !== row.birthDate
    )
      rowIssues.push(
        issueFromDogImportFact({
          code: "DOG_BIRTH_DATE_CONFLICT",
          field: "birthDate",
          registrationNo: row.registrationNo,
          sourceRowNumber: row.sourceRowNumber,
          currentValue: dateValue(existing.birthDate),
          incomingValue: row.birthDate,
        }),
      );
    if (existing && row.sireRegistrationNo && row.damRegistrationNo) {
      const linkedSire = state.dogs.find((dog) => dog.id === existing.sireId);
      const linkedDam = state.dogs.find((dog) => dog.id === existing.damId);
      if (linkedSire && linkedSire.registrationNo !== row.sireRegistrationNo)
        add(
          "DOG_SIRE_CONFLICT",
          "sireRegistrationNo",
          linkedSire.registrationNo,
          row.sireRegistrationNo,
        );
      if (linkedDam && linkedDam.registrationNo !== row.damRegistrationNo)
        add(
          "DOG_DAM_CONFLICT",
          "damRegistrationNo",
          linkedDam.registrationNo,
          row.damRegistrationNo,
        );
    }
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
    if (existing) {
      const currentColorName =
        state.colors.find((color) => color.code === existing.colorCode)
          ?.nameFi ?? null;
      for (const comparison of [
        {
          field: "breederNameText",
          code: "DOG_BREEDER_TEXT_DIFFERS",
          currentValue: existing.breederNameText,
          incomingValue: row.breederNameText,
        },
        {
          field: "originTypeText",
          code: "DOG_ORIGIN_TYPE_DIFFERS",
          currentValue: existing.originTypeText,
          incomingValue: row.originTypeText,
        },
        {
          field: "originCountryText",
          code: "DOG_ORIGIN_COUNTRY_DIFFERS",
          currentValue: existing.originCountryText,
          incomingValue: row.originCountryText,
        },
        {
          field: "tailText",
          code: "DOG_TAIL_DIFFERS",
          currentValue: existing.tailText,
          incomingValue: row.tailText,
        },
        {
          field: "registeredOn",
          code: "DOG_REGISTRATION_DATE_DIFFERS",
          currentValue: dateValue(existing.registeredOn),
          incomingValue: row.registeredOn,
        },
      ] as const) {
        const comparisonIssue = compareWithoutClearing({
          ...comparison,
          registrationNo: row.registrationNo,
          sourceRowNumber: row.sourceRowNumber,
        });
        if (comparisonIssue) rowIssues.push(comparisonIssue);
      }
      if (
        row.colorName &&
        colorMatches.length === 1 &&
        colorCode !== existing.colorCode
      ) {
        const colorIssue = compareWithoutClearing({
          field: "colorName",
          code: "DOG_COLOR_DIFFERS",
          currentValue: currentColorName,
          incomingValue: row.colorName,
          registrationNo: row.registrationNo,
          sourceRowNumber: row.sourceRowNumber,
        });
        if (colorIssue) rowIssues.push(colorIssue);
      }
      const previousIssues = new Set(issues.map(canonical));
      const comparisonIssues = rowIssues.filter(
        (issue) => !previousIssues.has(canonical(issue)),
      );
      issues.push(...comparisonIssues);
      uniqueRowIssues = rowIssues.filter(
        (issue, index, all) =>
          all.findIndex(
            (candidate) => canonical(candidate) === canonical(issue),
          ) === index,
      );
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
    const data: DogImportDogUpdateData & { birthDate?: string } = {};
    for (const [key, incoming, current] of [
      ["breederNameText", row.breederNameText, existing.breederNameText],
      ["originTypeText", row.originTypeText, existing.originTypeText],
      ["originCountryText", row.originCountryText, existing.originCountryText],
      ["tailText", row.tailText, existing.tailText],
    ] as const)
      if (incoming && incoming !== current) data[key] = incoming;
    if (
      row.colorName &&
      colorMatches.length === 1 &&
      colorCode !== existing.colorCode
    )
      data.colorCode = colorCode;
    if (!existing.birthDate && row.birthDate) data.birthDate = row.birthDate;
    if (existing.status === "REFERENCE_ONLY") {
      data.status = "NORMAL";
      const referenceIssues: DogImportIssue[] = [
        issueFromDogImportFact({
          code: "REFERENCE_DOG_PROMOTED",
          registrationNo: row.registrationNo,
          sourceRowNumber: row.sourceRowNumber,
        }),
      ];
      if (existing.name === existing.registrationNo && row.name) {
        data.name = row.name;
        referenceIssues.push(
          issueFromDogImportFact({
            code: "REFERENCE_FALLBACK_NAME_REPLACED",
            field: "name",
            registrationNo: row.registrationNo,
            sourceRowNumber: row.sourceRowNumber,
            currentValue: existing.name,
            incomingValue: row.name,
          }),
        );
      }
      if (existing.sex === "UNKNOWN" && row.sex) {
        data.sex = row.sex;
        referenceIssues.push(
          issueFromDogImportFact({
            code: "REFERENCE_UNKNOWN_SEX_FILLED",
            field: "sex",
            registrationNo: row.registrationNo,
            sourceRowNumber: row.sourceRowNumber,
            currentValue: existing.sex,
            incomingValue: row.sex,
          }),
        );
      }
      rowIssues.push(...referenceIssues);
      issues.push(...referenceIssues);
      uniqueRowIssues = rowIssues.filter(
        (issue, index, all) =>
          all.findIndex(
            (candidate) => canonical(candidate) === canonical(issue),
          ) === index,
      );
    }
    const parentsChanged =
      (!existing.sireId && !!row.sireRegistrationNo) ||
      (!existing.damId && !!row.damRegistrationNo);
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
        ...(row.registeredOn &&
        dateValue(existing.registeredOn) !== row.registeredOn
          ? { registeredOn: row.registeredOn }
          : {}),
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
  const historicalLinks = [
    ...new Set([
      ...creates.map((row) => row.registrationNo),
      ...updates
        .filter((update) => update.data.status === "NORMAL")
        .map(
          (update) =>
            state.dogs.find((dog) => dog.id === update.id)?.registrationNo,
        )
        .filter((registrationNo): registrationNo is string =>
          Boolean(registrationNo),
        ),
    ]),
  ]
    .map((registrationNo) => ({
      registrationNo,
      showEntryIds:
        state.historicalLinksByRegistration[registrationNo]?.showEntryIds ?? [],
      trialEntryIds:
        state.historicalLinksByRegistration[registrationNo]?.trialEntryIds ??
        [],
    }))
    .filter((links) => links.showEntryIds.length || links.trialEntryIds.length);
  const planWithHistoricalLinks = { ...plan, historicalLinks };
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
      plan: planWithHistoricalLinks,
      state: state.dogs.map((dog) => [
        dog.id,
        dog.updatedAt.toISOString(),
        dog.registrationId,
        dog.registrationUpdatedAt.toISOString(),
      ]),
    }),
    plan: planWithHistoricalLinks,
    createCount: creates.length,
    updateCount: updates.length,
    unchangedCount: previewRows.filter((row) => row.status === "UNCHANGED")
      .length,
    blockedCount,
    referenceCount: referenceRows.length,
  };
}
