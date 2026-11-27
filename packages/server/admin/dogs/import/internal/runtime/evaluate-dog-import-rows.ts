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
  hasBlockers: boolean;
  hasChanges: boolean;
  previewDigest: string;
  plan: DogImportWritePlanDb;
  createCount: number;
  updateCount: number;
  unchangedCount: number;
  blockedCount: number;
  referenceCount: number;
};
const MAX_REGISTRATION_LENGTH = 40;

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
  const sourceRegistrationsByDog = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!row.registrationNo) continue;
    const dog = byRegistration.get(row.registrationNo);
    if (!dog) continue;
    const registrations =
      sourceRegistrationsByDog.get(dog.id) ?? new Set<string>();
    registrations.add(row.registrationNo);
    sourceRegistrationsByDog.set(dog.id, registrations);
  }
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
  const breederMatches = new Map<
    string,
    DogImportWritePlanDb["breederMatches"][number]
  >();
  const previewRows: AdminDogImportPreviewRow[] = [];
  const matchedColors = new Map<number, DogImportStateDb["colors"][number]>();
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
    else if (row.registrationNo.length > MAX_REGISTRATION_LENGTH)
      add("REGISTRATION_TOO_LONG", "registrationNo");
    else if (!isValidRegistrationNo(row.registrationNo))
      add("REGISTRATION_INVALID", "registrationNo");
    else if (seen.has(row.registrationNo))
      add("DUPLICATE_SOURCE_REGISTRATION", "registrationNo");
    else seen.add(row.registrationNo);
    if (!row.name) add("REQUIRED_VALUE_MISSING", "name");
    else if (row.name.length > 120) add("DOG_NAME_TOO_LONG", "name");
    if (!row.sex) add("DOG_SEX_INVALID", "sex");
    const existing = row.registrationNo
      ? byRegistration.get(row.registrationNo)
      : undefined;
    const incomingSire = row.sireRegistrationNo
      ? byRegistration.get(row.sireRegistrationNo)
      : undefined;
    const incomingDam = row.damRegistrationNo
      ? byRegistration.get(row.damRegistrationNo)
      : undefined;
    for (const [field, value, parent] of [
      ["sireRegistrationNo", row.sireRegistrationNo, incomingSire],
      ["damRegistrationNo", row.damRegistrationNo, incomingDam],
    ] as const) {
      if (!value || !isValidRegistrationNo(value))
        add("PARENT_REGISTRATION_INVALID", field, null, value);
      else if (value.length > MAX_REGISTRATION_LENGTH)
        add("REGISTRATION_TOO_LONG", field, null, value);
      else if (/^[./-]+$|^U0+$/i.test(value))
        add("PARENT_REGISTRATION_PLACEHOLDER", field, null, value);
      else if (
        value === row.registrationNo ||
        (existing && parent?.id === existing.id)
      )
        add("PARENT_SELF_REFERENCE", field);
    }
    if (
      (row.sireRegistrationNo &&
        row.sireRegistrationNo === row.damRegistrationNo) ||
      (incomingSire && incomingSire.id === incomingDam?.id)
    )
      add("PARENT_SAME_IDENTITY");
    for (const [registrationNo, role] of [
      [row.sireRegistrationNo, "MALE"],
      [row.damRegistrationNo, "FEMALE"],
    ] as const) {
      if (!registrationNo) continue;
      const roles = sourceRoles.get(registrationNo);
      if (roles && roles.size > 1) add("PARENT_ROLE_AMBIGUOUS");
      const sourceParent = sourceRows.get(registrationNo);
      if (sourceParent && sourceParent.sex && sourceParent.sex !== role)
        add(
          "PARENT_SOURCE_SEX_CONFLICT",
          role === "MALE" ? "sireRegistrationNo" : "damRegistrationNo",
        );
    }
    const kennelMatches = row.kennel
      ? (state.breedersByKennel.get(row.kennel) ?? [])
      : [];
    const breeder = kennelMatches.length === 1 ? kennelMatches[0] : undefined;
    if (row.kennel && !breeder)
      add(
        kennelMatches.length
          ? "DOG_BREEDER_AMBIGUOUS"
          : "DOG_BREEDER_NOT_FOUND",
        "breeder",
        null,
        row.kennel,
      );
    if (breeder && existing?.breederId && existing.breederId !== breeder.id)
      add(
        "DOG_BREEDER_LINK_CONFLICT",
        "breeder",
        existing.breederName,
        breeder.name,
      );
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
    if (existing && (sourceRegistrationsByDog.get(existing.id)?.size ?? 0) > 1)
      add("MULTIPLE_SOURCE_ROWS_SAME_DOG", "registrationNo");
    const hasFallbackName =
      existing?.status === "REFERENCE_ONLY" &&
      existing.name === existing.registrationNo;
    if (
      existing &&
      !hasFallbackName &&
      row.name &&
      existing.name !== row.name
    ) {
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
    if (
      existing?.sireId &&
      row.sireRegistrationNo &&
      incomingSire?.id !== existing.sireId
    )
      add(
        "DOG_SIRE_CONFLICT",
        "sireRegistrationNo",
        state.dogs.find((dog) => dog.id === existing.sireId)?.registrationNo,
        row.sireRegistrationNo,
      );
    if (
      existing?.damId &&
      row.damRegistrationNo &&
      incomingDam?.id !== existing.damId
    )
      add(
        "DOG_DAM_CONFLICT",
        "damRegistrationNo",
        state.dogs.find((dog) => dog.id === existing.damId)?.registrationNo,
        row.damRegistrationNo,
      );
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
    if (row.sireRegistrationNo) references.set(row.sireRegistrationNo, "MALE");
    if (row.damRegistrationNo) references.set(row.damRegistrationNo, "FEMALE");
    if (breeder && row.kennel)
      breederMatches.set(row.kennel, { kennel: row.kennel, ...breeder });
    const breederToLink = breeder && !existing?.breederId ? breeder : undefined;
    const colorMatches = row.colorName
      ? state.colors.filter(
          (color) =>
            color.nameFi.trim().toLocaleLowerCase("fi-FI") ===
            row.colorName!.trim().toLocaleLowerCase("fi-FI"),
        )
      : [];
    for (const color of colorMatches) matchedColors.set(color.code, color);
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
        incomingValue: row.colorName,
      });
      rowIssues.push(issue);
      issues.push(issue);
      uniqueRowIssues = [...uniqueRowIssues, issue];
    }
    if (existing) {
      for (const comparison of [
        {
          field: "originTypeText",
          currentValue: existing.originTypeText,
          incomingValue: row.originTypeText,
        },
        {
          field: "originCountryText",
          currentValue: existing.originCountryText,
          incomingValue: row.originCountryText,
        },
        {
          field: "tailText",
          currentValue: existing.tailText,
          incomingValue: row.tailText,
        },
        {
          field: "registeredOn",
          currentValue: dateValue(existing.registeredOn),
          incomingValue: row.registeredOn,
        },
      ] as const) {
        const comparisonIssue = compareWithoutClearing({
          ...comparison,
          registrationNo: row.registrationNo,
          sourceRowNumber: row.sourceRowNumber,
        });
        if (comparisonIssue) {
          rowIssues.push(comparisonIssue);
          issues.push(comparisonIssue);
          uniqueRowIssues.push(comparisonIssue);
        }
      }
    }
    if (!existing) {
      creates.push({
        registrationNo: row.registrationNo!,
        name: row.name!,
        sex: row.sex!,
        birthDate: row.birthDate,
        registeredOn: row.registeredOn,
        breederId: breederToLink?.id ?? null,
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
        changes: [
          { field: "sex", before: null, after: row.sex },
          { field: "birthDate", before: null, after: row.birthDate },
          { field: "registeredOn", before: null, after: row.registeredOn },
          {
            field: "breeder",
            before: null,
            after: breederToLink?.name ?? null,
          },
          { field: "originTypeText", before: null, after: row.originTypeText },
          {
            field: "originCountryText",
            before: null,
            after: row.originCountryText,
          },
          {
            field: "colorName",
            before: null,
            after: colorCode !== null ? colorMatches[0]!.nameFi : null,
          },
          { field: "tailText", before: null, after: row.tailText },
          {
            field: "sireRegistrationNo",
            before: null,
            after: row.sireRegistrationNo,
          },
          {
            field: "damRegistrationNo",
            before: null,
            after: row.damRegistrationNo,
          },
        ],
        issues: uniqueRowIssues,
      });
      continue;
    }
    const data: DogImportDogUpdateData & { birthDate?: string } = {};
    const changes: NonNullable<AdminDogImportPreviewRow["changes"]> = [];
    if (breederToLink) data.breederId = breederToLink.id;
    for (const [key, incoming, current] of [
      ["originTypeText", row.originTypeText, existing.originTypeText],
      ["originCountryText", row.originCountryText, existing.originCountryText],
      ["tailText", row.tailText, existing.tailText],
    ] as const)
      if (incoming && incoming !== current) {
        data[key] = incoming;
        changes.push({ field: key, before: current, after: incoming });
      }
    if (
      row.colorName &&
      colorMatches.length === 1 &&
      colorCode !== existing.colorCode
    ) {
      data.colorCode = colorCode;
      const before = state.colors.find(
        (color) => color.code === existing.colorCode,
      );
      changes.push({
        field: "colorName",
        before: before?.nameFi ?? null,
        after: colorMatches[0]!.nameFi,
      });
    }
    if (!existing.birthDate && row.birthDate) {
      data.birthDate = row.birthDate;
      changes.push({ field: "birthDate", before: null, after: row.birthDate });
    }
    if (existing.status === "REFERENCE_ONLY") {
      data.status = "NORMAL";
      changes.push({
        field: "status",
        before: existing.status,
        after: data.status,
      });
      const referenceIssues: DogImportIssue[] = [
        issueFromDogImportFact({
          code: "REFERENCE_DOG_PROMOTED",
          registrationNo: row.registrationNo,
          sourceRowNumber: row.sourceRowNumber,
        }),
      ];
      if (hasFallbackName && row.name) {
        data.name = row.name;
        changes.push({ field: "name", before: existing.name, after: row.name });
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
        changes.push({ field: "sex", before: existing.sex, after: row.sex });
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
    if (!existing.sireId && row.sireRegistrationNo)
      changes.push({
        field: "sireRegistrationNo",
        before: null,
        after: row.sireRegistrationNo,
      });
    if (!existing.damId && row.damRegistrationNo)
      changes.push({
        field: "damRegistrationNo",
        before: null,
        after: row.damRegistrationNo,
      });
    const registeredOn =
      row.registeredOn !== dateValue(existing.registeredOn)
        ? row.registeredOn
        : null;
    if (registeredOn)
      changes.push({
        field: "registeredOn",
        before: dateValue(existing.registeredOn),
        after: registeredOn,
      });
    if (changes.length || breederToLink) {
      updates.push({
        id: existing.id,
        registrationId: existing.registrationId,
        expectedUpdatedAt: existing.updatedAt,
        expectedRegistrationUpdatedAt: existing.registrationUpdatedAt,
        data,
        ...(registeredOn && { registeredOn }),
        sireRegistrationNo: row.sireRegistrationNo!,
        damRegistrationNo: row.damRegistrationNo!,
      });
      previewRows.push({
        sourceRowNumber: row.sourceRowNumber,
        registrationNo: row.registrationNo,
        name: row.name,
        status: "UPDATE",
        changes,
        ...(breederToLink && { breederToLink: breederToLink.name }),
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
        field:
          reference.sex === "MALE" ? "sireRegistrationNo" : "damRegistrationNo",
      }),
    );
  const plan = {
    creates,
    updates,
    references: referenceRows,
    breederMatches: [...breederMatches.values()],
  };
  const historicalEntries = [
    ...new Set([
      ...creates.map((row) => row.registrationNo),
      ...updates
        .filter((update) => update.data.status === "NORMAL")
        .map(
          (update) =>
            state.dogs.find(
              (dog) => dog.registrationId === update.registrationId,
            )?.registrationNo,
        )
        .filter((registrationNo): registrationNo is string =>
          Boolean(registrationNo),
        ),
    ]),
  ]
    .map((registrationNo) => ({
      registrationNo,
      showEntries: [
        ...(state.historicalLinksByRegistration[registrationNo]?.showEntries ??
          []),
      ].sort((a, b) => a.id.localeCompare(b.id)),
      trialEntries: [
        ...(state.historicalLinksByRegistration[registrationNo]?.trialEntries ??
          []),
      ].sort((a, b) => a.id.localeCompare(b.id)),
    }))
    .filter((links) => links.showEntries.length || links.trialEntries.length);
  const historicalLinks = historicalEntries.map(
    ({ registrationNo, showEntries, trialEntries }) => ({
      registrationNo,
      showEntryIds: showEntries.map(({ id }) => id),
      trialEntryIds: trialEntries.map(({ id }) => id),
    }),
  );
  const planWithHistoricalLinks = { ...plan, historicalLinks };
  const blockedCount = previewRows.filter(
    (row) => row.status === "BLOCKED",
  ).length;
  const hasBlockers =
    blockedCount > 0 || issues.some((issue) => issue.severity === "BLOCKER");
  const hasChanges =
    creates.length > 0 ||
    updates.length > 0 ||
    referenceRows.length > 0 ||
    historicalLinks.length > 0;
  return {
    rows: previewRows,
    issues: issues.sort(
      (a, b) =>
        (a.sourceRowNumber ?? 0) - (b.sourceRowNumber ?? 0) ||
        a.code.localeCompare(b.code),
    ),
    hasBlockers,
    hasChanges,
    previewDigest: digest({
      policyVersion: DOG_IMPORT_POLICY_VERSION,
      rows,
      issues,
      plan: planWithHistoricalLinks,
      historicalEntries,
      colors: [...matchedColors.values()].sort((a, b) => a.code - b.code),
      state: state.dogs.map((dog) => [
        dog.id,
        dog.registrationNo,
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
