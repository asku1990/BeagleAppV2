import type { AdminTrialEventSummary } from "./admin-trials-list";

export type AdminTrialEventDetailsRequest = {
  trialEventId: string;
};

export type AdminTrialEventEntry = {
  trialId: string;
  dogId: string | null;
  dogName: string;
  registrationNo: string | null;
  entryKey: string;
  rank: string | null;
  award: string | null;
  points: number | null;
  judge: string | null;
};

export type AdminTrialEventDetails = AdminTrialEventSummary & {
  koemuoto: string | null;
  entries: AdminTrialEventEntry[];
};

export type AdminTrialEventDetailsResponse = {
  event: AdminTrialEventDetails;
};
