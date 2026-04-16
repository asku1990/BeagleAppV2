export type KoiratietokantaAjokWarningCode =
  | "DOG_NOT_FOUND"
  | "OPTIONAL_FIELD_PARSE_FAILED"
  | "OPTIONAL_FIELD_NORMALIZED_TO_NULL";

export type KoiratietokantaAjokWarning = {
  code: KoiratietokantaAjokWarningCode;
  field?: string;
  message: string;
};

export type KoiratietokantaAjokValidationIssue = {
  field: string;
  code: "REQUIRED" | "INVALID";
  message: string;
};

export type KoiratietokantaAjokUpsertRequest = Record<string, unknown>;

export type KoiratietokantaAjokUpsertResponse = {
  trialEventId: string;
  trialEntryId: string;
  created: boolean;
  updated: boolean;
  warnings: KoiratietokantaAjokWarning[];
};
