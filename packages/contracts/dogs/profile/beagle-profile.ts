export type BeagleDogProfileSex = "U" | "N" | "-";

export type BeagleDogProfileParentDto = {
  name: string;
  registrationNo: string | null;
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
  place: string;
  date: string;
  weather: string | null;
  className: string | null;
  rank: string | null;
  points: number | null;
};

export type BeagleDogProfileShowRowDto = {
  id: string;
  place: string;
  date: string;
  result: string | null;
  judge: string | null;
  heightCm: number | null;
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
  shows: BeagleDogProfileShowRowDto[];
  trials: BeagleDogProfileTrialRowDto[];
};
