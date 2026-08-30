export type BestDriverTrialType = "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";

export type BestDriverRankingRequest = {
  season?: number;
};

export type BestDriverQualifyingResult = {
  trialEntryId: string;
  trialEventId: string;
  eventDate: string;
  eventPlace: string;
  kennelDistrict: string | null;
  kennelDistrictNo: string | null;
  weather: string | null;
  trialType: BestDriverTrialType;
  placement: string | null;
  points: number;
};

export type BestDriverRankingRow = {
  position: number;
  dogId: string;
  dogName: string;
  registrationNo: string;
  sex: "U" | "N" | "-";
  totalPoints: number;
  results: BestDriverQualifyingResult[];
};

export type BestDriverRankingResponse = {
  season: number;
  availableSeasons: number[];
  items: BestDriverRankingRow[];
};
