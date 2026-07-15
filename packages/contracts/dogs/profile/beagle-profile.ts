import type { BeagleShowStructuredResultDto } from "@contracts/shows/beagle-shows";
import type { DogColorDto } from "../colors";
import type { DogStatus } from "../status";

export type BeagleDogProfileSex = "U" | "N" | "-";

export type BeagleDogProfileParentDto = {
  id?: string;
  name: string | null;
  registrationNo: string | null;
  ekNo?: number | null;
  status: DogStatus;
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
  trialEntryId: string;
  trialId: string;
  trialRuleWindowId: string | null;
  hasDogTrialPdf: boolean;
  place: string;
  date: string;
  weather: string | null;
  koetyyppi: "NORMAL" | "KOKOKAUDENKOE" | "PITKAKOE";
  koiriaLuokassa: number | null;
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
  eras?: BeagleDogProfileTrialEraDto[];
};

export type BeagleDogProfileTrialEraDto = {
  era: number;
  alkoi: string | null;
  hakumin: number | null;
  ajomin: number | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  tja: number | null;
  pin: number | null;
  huomautusTeksti: string | null;
};

export type BeagleDogTrialsSummaryRowDto = {
  label: "dog" | "breed";
  name: string;
  count: number;
  points: number | null;
  haku: number | null;
  hauk: number | null;
  yva: number | null;
  hlo: number | null;
  alo: number | null;
  mi: number | null;
  pmi: number | null;
};

export type BeagleDogTrialsSummaryDto = {
  allTrials: BeagleDogTrialsSummaryRowDto[];
  drivenTrials: BeagleDogTrialsSummaryRowDto[];
  noPrize: BeagleDogTrialsSummaryRowDto[];
  prizePlacements: BeagleDogTrialsSummaryRowDto[];
  interrupted: BeagleDogTrialsSummaryRowDto[];
};

export type BeagleDogTrialsEraStatsDto = {
  trialCount: number;
  trialCountWithEras: number;
  eraCount: number;
  drivenEraCount: number;
  drivenEraPercentage: number;
  averageDriveMinutes: number;
};

export type BeagleDogProfileShowRowDto = BeagleShowStructuredResultDto & {
  id: string;
  showId: string;
  place: string;
  date: string;
  critiqueText: string | null;
  judge: string | null;
  heightCm: number | null;
};

export type BeagleDogProfileTitleRowDto = {
  awardedOn: string | null;
  titleCode: string;
  titleName: string | null;
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
  color: DogColorDto | null;
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
  color: DogColorDto | null;
};

export type BeagleDogProfileDto = {
  id: string;
  name: string;
  title: string | null;
  registrationNo: string;
  registrationNos: string[];
  birthDate: string | null;
  sex: BeagleDogProfileSex;
  color: DogColorDto | null;
  ekNo: number | null;
  inbreedingCoefficientPct: number | null;
  sire: BeagleDogProfileParentDto | null;
  dam: BeagleDogProfileParentDto | null;
  pedigree: BeagleDogProfilePedigreeGenerationDto[];
  offspringSummary: BeagleDogProfileOffspringSummaryDto;
  litters: BeagleDogProfileLitterDto[];
  siblingsSummary: BeagleDogProfileSiblingsSummaryDto;
  siblings: BeagleDogProfileSiblingRowDto[];
  titles: BeagleDogProfileTitleRowDto[];
  shows: BeagleDogProfileShowRowDto[];
  trials: BeagleDogProfileTrialRowDto[];
};

export type BeagleDogTrialsDto = {
  id: string;
  name: string;
  registrationNo: string;
  trials: BeagleDogProfileTrialRowDto[];
  summary: BeagleDogTrialsSummaryDto;
  eraStats: BeagleDogTrialsEraStatsDto | null;
};
