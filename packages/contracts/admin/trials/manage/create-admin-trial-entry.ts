import type { AdminTrialEntryWriteData } from "./admin-trial-entry-write";

export type CreateAdminTrialEntryRequest = AdminTrialEntryWriteData & {
  trialEventId: string;
  registrationNo: string;
};

export type CreateAdminTrialEntryResponse = {
  trialEventId: string;
  trialEntryId: string;
};
