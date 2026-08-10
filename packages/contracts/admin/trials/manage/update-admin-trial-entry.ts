import type { AdminTrialEntryWriteData } from "./admin-trial-entry-write";

export type UpdateAdminTrialEntryRequest = AdminTrialEntryWriteData & {
  trialEventId: string;
  trialEntryId: string;
};

/** @deprecated Use AdminTrialEntryLisatietoWriteRow. */
export type UpdateAdminTrialEntryLisatietoRow =
  AdminTrialEntryWriteData["lisatiedotRows"][number];

export type UpdateAdminTrialEntryResponse = {
  trialEventId: string;
  trialEntryId: string;
};
