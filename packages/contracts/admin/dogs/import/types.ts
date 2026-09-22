export type DogImportIssueSeverity = "BLOCKER" | "WARNING" | "INFO";

export type DogImportResolution =
  | "AUTO_UPDATE"
  | "KEEP_EXISTING"
  | "BLOCK"
  | "CREATE_REFERENCE"
  | "IGNORE";

export type DogImportField =
  | "registrationNo"
  | "name"
  | "sex"
  | "birthDate"
  | "registeredOn"
  | "breederNameText"
  | "originTypeText"
  | "originCountryText"
  | "colorName"
  | "tailText"
  | "sireRegistrationNo"
  | "damRegistrationNo";

export type DogImportIssueCode =
  | "SOURCE_FILE_UNREADABLE"
  | "SOURCE_RESOURCE_LIMIT_EXCEEDED"
  | "ADDITIONAL_SHEETS_IGNORED"
  | "REQUIRED_COLUMN_MISSING"
  | "DUPLICATE_COLUMN"
  | "UNNAMED_COLUMN_WITH_DATA"
  | "OPTIONAL_COLUMN_MISSING"
  | "UNSUPPORTED_COLUMN_IGNORED"
  | "REQUIRED_VALUE_MISSING"
  | "REGISTRATION_INVALID"
  | "REGISTRATION_TOO_LONG"
  | "REGISTRATION_CANONICAL_COLLISION"
  | "REGISTRATION_OWNERSHIP_CONFLICT"
  | "DUPLICATE_SOURCE_REGISTRATION"
  | "MULTIPLE_SOURCE_ROWS_SAME_DOG"
  | "BREED_NOT_BEAGLE"
  | "DOG_SEX_INVALID"
  | "DOG_NAME_TOO_LONG"
  | "DOG_NAME_CONFLICT"
  | "DOG_NAME_FORMAT_DIFFERS"
  | "DOG_SEX_CONFLICT"
  | "DOG_BIRTH_DATE_INVALID"
  | "DOG_BIRTH_DATE_CONFLICT"
  | "DOG_SIRE_CONFLICT"
  | "DOG_DAM_CONFLICT"
  | "DOG_COLOR_DIFFERS"
  | "DOG_COLOR_UNRESOLVED"
  | "DOG_BREEDER_TEXT_DIFFERS"
  | "DOG_BREEDER_LINK_CONFLICT"
  | "DOG_REGISTRATION_DATE_INVALID"
  | "DOG_REGISTRATION_DATE_DIFFERS"
  | "DOG_ORIGIN_TYPE_DIFFERS"
  | "DOG_ORIGIN_COUNTRY_DIFFERS"
  | "DOG_TAIL_DIFFERS"
  | "SOURCE_EMPTY_PRESERVED"
  | "PARENT_REGISTRATION_INVALID"
  | "PARENT_REGISTRATION_PLACEHOLDER"
  | "PARENT_ROLE_AMBIGUOUS"
  | "PARENT_SELF_REFERENCE"
  | "PARENT_SAME_IDENTITY"
  | "PARENT_SEX_CONFLICT"
  | "PARENT_SOURCE_SEX_CONFLICT"
  | "PARENT_SOURCE_ROW_BLOCKED"
  | "REFERENCE_PARENT_PLANNED"
  | "REFERENCE_DOG_PROMOTED"
  | "REFERENCE_FALLBACK_NAME_REPLACED"
  | "REFERENCE_UNKNOWN_SEX_FILLED"
  | "SOURCE_FILE_CHANGED"
  | "PREVIEW_STALE";

export type DogImportIssueValue = string | number | boolean | null;

export type DogImportIssue = {
  code: DogImportIssueCode;
  severity: DogImportIssueSeverity;
  field: DogImportField | null;
  registrationNo: string | null;
  sourceRowNumber: number | null;
  currentValue: DogImportIssueValue;
  incomingValue: DogImportIssueValue;
  message: string;
  resolution: DogImportResolution;
  overridable: boolean;
};
