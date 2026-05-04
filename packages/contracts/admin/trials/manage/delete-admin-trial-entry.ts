export type DeleteAdminTrialEntryRequest = {
  trialEventId: string;
  trialEntryId: string;
};

export type DeleteAdminTrialEntryResponse = {
  deletedTrialEntryId: string;
  trialEventId: string;
  deletedTrialEvent: boolean;
};
