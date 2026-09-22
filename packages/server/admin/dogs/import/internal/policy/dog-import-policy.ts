import type {
  DogImportIssueCode,
  DogImportResolution,
  DogImportIssueSeverity,
} from "@beagle/contracts";

export type DogImportPolicyRule = {
  severity: DogImportIssueSeverity;
  resolution: DogImportResolution;
  overridable: boolean;
};

type RuleOptions = Omit<DogImportPolicyRule, "overridable"> & {
  overridable?: boolean;
};
const blocker = (resolution: DogImportResolution = "BLOCK"): RuleOptions => ({
  severity: "BLOCKER",
  resolution,
});
const overridableBlocker = (): RuleOptions => ({
  severity: "BLOCKER",
  resolution: "BLOCK",
  overridable: true,
});
const warning = (resolution: DogImportResolution): RuleOptions => ({
  severity: "WARNING",
  resolution,
  overridable: true,
});
const info = (resolution: DogImportResolution): RuleOptions => ({
  severity: "INFO",
  resolution,
  overridable: true,
});

const nonOverridable = new Set<DogImportIssueCode>([
  "SOURCE_FILE_UNREADABLE",
  "SOURCE_RESOURCE_LIMIT_EXCEEDED",
  "ADDITIONAL_SHEETS_IGNORED",
  "REQUIRED_COLUMN_MISSING",
  "DUPLICATE_COLUMN",
  "UNNAMED_COLUMN_WITH_DATA",
  "OPTIONAL_COLUMN_MISSING",
  "REQUIRED_VALUE_MISSING",
  "REGISTRATION_INVALID",
  "REGISTRATION_TOO_LONG",
  "REGISTRATION_CANONICAL_COLLISION",
  "REGISTRATION_OWNERSHIP_CONFLICT",
  "DUPLICATE_SOURCE_REGISTRATION",
  "MULTIPLE_SOURCE_ROWS_SAME_DOG",
  "BREED_NOT_BEAGLE",
  "DOG_SEX_INVALID",
  "DOG_NAME_TOO_LONG",
  "DOG_BIRTH_DATE_INVALID",
  "DOG_REGISTRATION_DATE_INVALID",
  "PARENT_REGISTRATION_INVALID",
  "PARENT_REGISTRATION_PLACEHOLDER",
  "PARENT_ROLE_AMBIGUOUS",
  "PARENT_SELF_REFERENCE",
  "PARENT_SAME_IDENTITY",
  "PARENT_SOURCE_SEX_CONFLICT",
  "PARENT_SOURCE_ROW_BLOCKED",
  "REFERENCE_DOG_PROMOTED",
  "REFERENCE_FALLBACK_NAME_REPLACED",
  "REFERENCE_UNKNOWN_SEX_FILLED",
  "SOURCE_FILE_CHANGED",
  "PREVIEW_STALE",
  "SOURCE_EMPTY_PRESERVED",
]);

const rules: Record<DogImportIssueCode, RuleOptions> = {
  SOURCE_FILE_UNREADABLE: blocker(),
  SOURCE_RESOURCE_LIMIT_EXCEEDED: blocker(),
  ADDITIONAL_SHEETS_IGNORED: warning("IGNORE"),
  REQUIRED_COLUMN_MISSING: blocker(),
  DUPLICATE_COLUMN: blocker(),
  UNNAMED_COLUMN_WITH_DATA: blocker(),
  OPTIONAL_COLUMN_MISSING: info("IGNORE"),
  UNSUPPORTED_COLUMN_IGNORED: warning("IGNORE"),
  REQUIRED_VALUE_MISSING: blocker(),
  REGISTRATION_INVALID: blocker(),
  REGISTRATION_TOO_LONG: blocker(),
  REGISTRATION_CANONICAL_COLLISION: blocker(),
  REGISTRATION_OWNERSHIP_CONFLICT: blocker(),
  DUPLICATE_SOURCE_REGISTRATION: blocker(),
  MULTIPLE_SOURCE_ROWS_SAME_DOG: blocker(),
  BREED_NOT_BEAGLE: blocker(),
  DOG_SEX_INVALID: blocker(),
  DOG_NAME_TOO_LONG: blocker(),
  DOG_NAME_CONFLICT: overridableBlocker(),
  DOG_NAME_FORMAT_DIFFERS: info("KEEP_EXISTING"),
  DOG_SEX_CONFLICT: overridableBlocker(),
  DOG_BIRTH_DATE_INVALID: blocker(),
  DOG_BIRTH_DATE_CONFLICT: overridableBlocker(),
  DOG_SIRE_CONFLICT: overridableBlocker(),
  DOG_DAM_CONFLICT: overridableBlocker(),
  DOG_COLOR_DIFFERS: warning("AUTO_UPDATE"),
  DOG_COLOR_UNRESOLVED: warning("KEEP_EXISTING"),
  DOG_BREEDER_TEXT_DIFFERS: warning("AUTO_UPDATE"),
  DOG_BREEDER_LINK_CONFLICT: warning("KEEP_EXISTING"),
  DOG_REGISTRATION_DATE_INVALID: blocker(),
  DOG_REGISTRATION_DATE_DIFFERS: warning("AUTO_UPDATE"),
  DOG_ORIGIN_TYPE_DIFFERS: warning("AUTO_UPDATE"),
  DOG_ORIGIN_COUNTRY_DIFFERS: warning("AUTO_UPDATE"),
  DOG_TAIL_DIFFERS: warning("AUTO_UPDATE"),
  SOURCE_EMPTY_PRESERVED: info("KEEP_EXISTING"),
  PARENT_REGISTRATION_INVALID: blocker(),
  PARENT_REGISTRATION_PLACEHOLDER: blocker(),
  PARENT_ROLE_AMBIGUOUS: blocker(),
  PARENT_SELF_REFERENCE: blocker(),
  PARENT_SAME_IDENTITY: blocker(),
  PARENT_SEX_CONFLICT: overridableBlocker(),
  PARENT_SOURCE_SEX_CONFLICT: blocker(),
  PARENT_SOURCE_ROW_BLOCKED: blocker(),
  REFERENCE_PARENT_PLANNED: info("CREATE_REFERENCE"),
  REFERENCE_DOG_PROMOTED: info("AUTO_UPDATE"),
  REFERENCE_FALLBACK_NAME_REPLACED: info("AUTO_UPDATE"),
  REFERENCE_UNKNOWN_SEX_FILLED: info("AUTO_UPDATE"),
  SOURCE_FILE_CHANGED: blocker(),
  PREVIEW_STALE: blocker(),
};

export const DOG_IMPORT_POLICY_VERSION = "1" as const;
export const DOG_IMPORT_POLICY_DEFAULTS = Object.fromEntries(
  Object.entries(rules).map(([code, rule]) => [
    code,
    {
      ...rule,
      overridable:
        !nonOverridable.has(code as DogImportIssueCode) &&
        rule.overridable === true,
    },
  ]),
) as { readonly [K in DogImportIssueCode]: DogImportPolicyRule };

export function getDogImportPolicyRule(
  code: DogImportIssueCode,
): DogImportPolicyRule {
  return DOG_IMPORT_POLICY_DEFAULTS[code];
}
