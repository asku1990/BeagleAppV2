import {
  DogSex,
  DogStatus,
  prisma,
  type ImportIssueSeverity,
  type LegacyDogRow,
} from "@beagle/db";
import {
  isValidRegistrationNo,
  normalizeBreederKey,
  normalizeNullable,
  normalizeRegistrationNo,
  parseLegacyDate,
} from "@server/imports/core";

type ParentRole = "sire" | "dam";

type RecordIssue = (issue: {
  stage: string;
  severity?: ImportIssueSeverity;
  code: string;
  message: string;
  registrationNo?: string | null;
  sourceTable?: string | null;
  payloadJson?: string | null;
}) => Promise<void>;

export type CreatedReferenceOnlyParent = {
  dogId: string;
  registrationNo: string;
  role: ParentRole;
  sex: DogSex;
  referenceCount: number;
  linkedChildrenCount: number;
  sourceDetailsMatched: boolean;
  usedRegistrationNameFallback: boolean;
};

export type CreateReferenceOnlyParentsResult = {
  createdByRegistration: Map<string, CreatedReferenceOnlyParent>;
  ambiguousRegistrations: Set<string>;
};

type ParentRoleCounts = {
  sire: number;
  dam: number;
};

function isPlaceholderRegistration(value: string): boolean {
  return /^U0+$/i.test(value);
}

function parseLegacyColorCode(
  value: string | number | null | undefined,
): number | null | "INVALID" {
  if (value == null) return null;
  const normalized = String(value).trim();
  if (!normalized) return null;
  if (!/^\d+$/u.test(normalized)) return "INVALID";
  const parsed = Number(normalized);
  if (!Number.isSafeInteger(parsed)) return "INVALID";
  return parsed > 0 ? parsed : null;
}

function addParentReference(
  roleCountsByRegistration: Map<string, ParentRoleCounts>,
  value: string | null,
  role: ParentRole,
): void {
  const registrationNo = normalizeRegistrationNo(value);
  if (
    !registrationNo ||
    !isValidRegistrationNo(registrationNo) ||
    isPlaceholderRegistration(registrationNo)
  ) {
    return;
  }

  const counts = roleCountsByRegistration.get(registrationNo) ?? {
    sire: 0,
    dam: 0,
  };
  counts[role] += 1;
  roleCountsByRegistration.set(registrationNo, counts);
}

// Creates missing parents only from rows whose child can reach phase-one relation writes.
export async function createReferenceOnlyParents(input: {
  rows: LegacyDogRow[];
  dogIdByRegistration: Map<string, string>;
  breederIdByNameKey: ReadonlyMap<string, string>;
  importedDogColorCodes: ReadonlySet<number>;
  recordIssue: RecordIssue;
}): Promise<CreateReferenceOnlyParentsResult> {
  const {
    rows,
    dogIdByRegistration,
    breederIdByNameKey,
    importedDogColorCodes,
    recordIssue,
  } = input;
  const roleCountsByRegistration = new Map<string, ParentRoleCounts>();
  const sourceRowByRegistration = new Map<string, LegacyDogRow>();

  for (const row of rows) {
    const sourceRegistrationNo = normalizeRegistrationNo(row.registrationNo);
    if (
      sourceRegistrationNo &&
      !sourceRowByRegistration.has(sourceRegistrationNo)
    ) {
      sourceRowByRegistration.set(sourceRegistrationNo, row);
    }

    if (
      !sourceRegistrationNo ||
      !isValidRegistrationNo(sourceRegistrationNo) ||
      !dogIdByRegistration.has(sourceRegistrationNo)
    ) {
      continue;
    }

    addParentReference(
      roleCountsByRegistration,
      row.sireRegistrationNo,
      "sire",
    );
    addParentReference(roleCountsByRegistration, row.damRegistrationNo, "dam");
  }

  const createdByRegistration = new Map<string, CreatedReferenceOnlyParent>();
  const ambiguousRegistrations = new Set<string>();

  for (const [registrationNo, counts] of roleCountsByRegistration) {
    if (dogIdByRegistration.has(registrationNo)) {
      continue;
    }

    if (counts.sire > 0 && counts.dam > 0) {
      ambiguousRegistrations.add(registrationNo);
      await recordIssue({
        stage: "relations",
        severity: "ERROR",
        code: "RELATION_PARENT_ROLE_AMBIGUOUS",
        message:
          "Parent registration appears as both sire and dam in bearek_id; no reference-only dog was created.",
        registrationNo,
        sourceTable: "bearek_id",
        payloadJson: JSON.stringify({
          registrationNo,
          sireReferenceCount: counts.sire,
          damReferenceCount: counts.dam,
        }),
      });
      continue;
    }

    const role: ParentRole = counts.sire > 0 ? "sire" : "dam";
    const sex = role === "sire" ? DogSex.MALE : DogSex.FEMALE;
    const sourceRow = sourceRowByRegistration.get(registrationNo);
    const sourceName = normalizeNullable(sourceRow?.name);
    const breederNameText = normalizeNullable(sourceRow?.breederName);
    const breederNameKey = normalizeBreederKey(breederNameText);
    const colorCode = parseLegacyColorCode(sourceRow?.colorCode);
    let dogColorCode: number | null = null;

    if (colorCode === "INVALID") {
      await recordIssue({
        stage: "relations",
        severity: "WARNING",
        code: "DOG_COLOR_INVALID_CODE",
        message:
          "Reference-only dog source row has an invalid color code; color was treated as unknown.",
        registrationNo,
        sourceTable: "bearek_id",
        payloadJson: JSON.stringify({
          registrationNo,
          colorCode: sourceRow?.colorCode,
        }),
      });
    } else if (colorCode != null && !importedDogColorCodes.has(colorCode)) {
      await recordIssue({
        stage: "relations",
        severity: "WARNING",
        code: "DOG_COLOR_LOOKUP_NOT_FOUND",
        message:
          "Reference-only dog source row references a color missing from the canonical catalog; color was treated as unknown.",
        registrationNo,
        sourceTable: "bearek_id",
        payloadJson: JSON.stringify({ registrationNo, colorCode }),
      });
    } else {
      dogColorCode = colorCode;
    }

    const created = await prisma.dog.create({
      data: {
        name: sourceName ?? registrationNo,
        sex,
        status: DogStatus.REFERENCE_ONLY,
        birthDate: parseLegacyDate(sourceRow?.birthDateRaw),
        breederNameText,
        breederId: breederNameKey
          ? (breederIdByNameKey.get(breederNameKey) ?? null)
          : null,
        colorCode: dogColorCode,
        registrations: {
          create: {
            registrationNo,
            source: "CANONICAL",
          },
        },
      },
      select: { id: true },
    });

    dogIdByRegistration.set(registrationNo, created.id);
    createdByRegistration.set(registrationNo, {
      dogId: created.id,
      registrationNo,
      role,
      sex,
      referenceCount: counts[role],
      linkedChildrenCount: 0,
      sourceDetailsMatched: sourceRow != null,
      usedRegistrationNameFallback: sourceName == null,
    });
  }

  return { createdByRegistration, ambiguousRegistrations };
}
