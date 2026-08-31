import type { DogSex, TrialEntryKoetyyppi } from "@prisma/client";

export type BestDriverCandidateDb = {
  trialEntryId: string;
  trialEventId: string;
  dogId: string;
  dogName: string;
  dogSex: DogSex;
  registrationNo: string;
  eventDate: Date;
  eventPlace: string;
  kennelDistrict: string | null;
  kennelDistrictNo: string | null;
  weather: string | null;
  trialType: TrialEntryKoetyyppi;
  placement: string | null;
  points: number;
};

export type BestDriverSourceDb = {
  availableEventDates: Date[];
  candidates: BestDriverCandidateDb[];
};
