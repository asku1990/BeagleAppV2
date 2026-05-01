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
  koemuoto: string | null;
  koetyyppi: "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";
  rank: string | null;
  award: string | null;
  points: number | null;
  judge: string | null;
};

export type AdminTrialEventDetails = AdminTrialEventSummary & {
  entries: AdminTrialEventEntry[];
};

export type AdminTrialEventDetailsResponse = {
  event: AdminTrialEventDetails;
};
