export type BeagleDogProfileSex = "U" | "N" | "-";

export type BeagleDogProfileParentDto = {
  id?: string;
  name: string;
  registrationNo: string | null;
  ekNo?: number | null;
};

export type BeagleDogProfilePedigreeCardDto = {
  id: string;
  sire: BeagleDogProfileParentDto | null;
  dam: BeagleDogProfileParentDto | null;
};

export type BeagleDogProfilePedigreeGenerationDto = {
  generation: number;
  cards: BeagleDogProfilePedigreeCardDto[];
};

export type BeagleDogProfileTrialRowDto = {
  id: string;
  trialId: string;
  place: string;
  date: string;
  weather: string | null;
  className: string | null;
  rank: string | null;
  points: number | null;
  award: string | null;
  judge: string | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  tja: number | null;
  pin: number | null;
};

export type BeagleDogProfileShowRowDto = {
  id: string;
  showId: string;
  place: string;
  date: string;
  result: string | null;
  judge: string | null;
  heightCm: number | null;
};

export type BeagleDogProfileOffspringSummaryDto = {
  litterCount: number;
  puppyCount: number;
};

export type BeagleDogProfileOffspringRowDto = {
  id: string;
  dogId: string;
  name: string;
  registrationNo: string;
  sex: BeagleDogProfileSex;
  ekNo: number | null;
  trialCount: number;
  showCount: number;
  litterCount: number;
};

export type BeagleDogProfileLitterDto = {
  id: string;
  birthDate: string | null;
  otherParent: BeagleDogProfileParentDto | null;
  puppyCount: number;
  puppies: BeagleDogProfileOffspringRowDto[];
};

export type BeagleDogProfileSiblingsSummaryDto = {
  siblingCount: number;
};

export type BeagleDogProfileSiblingRowDto = {
  id: string;
  dogId: string;
  name: string;
  registrationNo: string;
  sex: BeagleDogProfileSex;
  ekNo: number | null;
  trialCount: number;
  showCount: number;
  litterCount: number;
};

export type BeagleDogProfileDto = {
  id: string;
  name: string;
  title: string | null;
  registrationNo: string;
  registrationNos: string[];
  birthDate: string | null;
  sex: BeagleDogProfileSex;
  color: string | null;
  ekNo: number | null;
  inbreedingCoefficientPct: number | null;
  sire: BeagleDogProfileParentDto | null;
  dam: BeagleDogProfileParentDto | null;
  pedigree: BeagleDogProfilePedigreeGenerationDto[];
  offspringSummary: BeagleDogProfileOffspringSummaryDto;
  litters: BeagleDogProfileLitterDto[];
  siblingsSummary: BeagleDogProfileSiblingsSummaryDto;
  siblings: BeagleDogProfileSiblingRowDto[];
  shows: BeagleDogProfileShowRowDto[];
  trials: BeagleDogProfileTrialRowDto[];
};
