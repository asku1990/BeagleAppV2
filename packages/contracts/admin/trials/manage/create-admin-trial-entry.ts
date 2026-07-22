import type { AdminTrialEntryWriteData } from "./admin-trial-entry-write";

export type CreateAdminTrialEntryRequest = AdminTrialEntryWriteData & {
  trialEventId: string;
  registrationNo: string;
};

export type CreateAdminTrialEntryResponse = {
  trialEventId: string;
  trialEntryId: string;
};

export type AdminTrialEntryValidationIssue = {
  area: "entry" | "eras" | "additional_info";
  reason:
    | "invalid_write_shape"
    | "invalid_koetyyppi"
    | "invalid_huomautus"
    | "invalid_entry_integer"
    | "invalid_entry_number"
    | "missing_eras"
    | "invalid_era_number"
    | "duplicate_eras"
    | "non_continuous_eras"
    | "invalid_era_integer"
    | "invalid_era_number_field"
    | "invalid_lisatieto_code"
    | "duplicate_lisatieto_key"
    | "invalid_lisatieto_era"
    | "duplicate_lisatieto_era_value"
    | "invalid_lisatieto_order";
  value?: string;
  koodi?: string;
  osa?: string;
};
