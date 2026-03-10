// Internal dog profile DB types for Prisma row shaping and profile mapping.
// Public DB DTO types are re-exported through the profile entrypoint.
import { DogSex } from "@prisma/client";

export type BeagleDogProfileSexDb = "U" | "N" | "-";

export type BeagleDogProfileParentDb = {
  id: string;
  name: string;
  registrationNo: string | null;
  ekNo: number | null;
};

export type BeagleDogProfilePedigreeCardDb = {
  id: string;
  sire: BeagleDogProfileParentDb | null;
  dam: BeagleDogProfileParentDb | null;
};

export type BeagleDogProfilePedigreeGenerationDb = {
  generation: number;
  cards: BeagleDogProfilePedigreeCardDb[];
};

export type BeagleDogProfileOffspringSummaryDb = {
  litterCount: number;
  puppyCount: number;
};

export type BeagleDogProfileOffspringRowDb = {
  id: string;
  dogId: string;
  name: string;
  registrationNo: string;
  sex: BeagleDogProfileSexDb;
  ekNo: number | null;
  trialCount: number;
  showCount: number;
  litterCount: number;
};

export type BeagleDogProfileLitterDb = {
  id: string;
  birthDate: Date | null;
  otherParent: BeagleDogProfileParentDb | null;
  puppyCount: number;
  puppies: BeagleDogProfileOffspringRowDb[];
};

export type BeagleDogProfileSiblingsSummaryDb = {
  siblingCount: number;
};

export type BeagleDogProfileSiblingRowDb = {
  id: string;
  dogId: string;
  name: string;
  registrationNo: string;
  sex: BeagleDogProfileSexDb;
  ekNo: number | null;
  trialCount: number;
  showCount: number;
  litterCount: number;
};

export type BeagleDogProfileDb = {
  id: string;
  name: string;
  title: string | null;
  registrationNo: string;
  registrationNos: string[];
  birthDate: Date | null;
  sex: BeagleDogProfileSexDb;
  color: string | null;
  ekNo: number | null;
  inbreedingCoefficientPct: number | null;
  sire: BeagleDogProfileParentDb | null;
  dam: BeagleDogProfileParentDb | null;
  pedigree: BeagleDogProfilePedigreeGenerationDb[];
  offspringSummary: BeagleDogProfileOffspringSummaryDb;
  litters: BeagleDogProfileLitterDb[];
  siblingsSummary: BeagleDogProfileSiblingsSummaryDb;
  siblings: BeagleDogProfileSiblingRowDb[];
};

export type RegistrationNode = {
  registrationNo: string;
  createdAt: Date;
};

export type ParentDogNode = {
  id: string;
  name: string;
  ekNo?: number | null;
  registrations: RegistrationNode[];
};

export type PedigreeDogNode = ParentDogNode & {
  sire?: PedigreeDogNode | null;
  dam?: PedigreeDogNode | null;
};

export type OffspringDogNode = {
  id: string;
  name: string;
  sex: DogSex;
  birthDate: Date | null;
  ekNo?: number | null;
  registrations: RegistrationNode[];
  sire: ParentDogNode | null;
  dam: ParentDogNode | null;
  whelpedPuppies: OffspringLitterRelationNode[];
  siredPuppies: OffspringLitterRelationNode[];
  _count: {
    showResults: number;
    trialResults: number;
  };
};

export type OffspringLitterParentNode = {
  id: string;
  registrations: RegistrationNode[];
};

export type OffspringLitterRelationNode = {
  id: string;
  birthDate: Date | null;
  sire: OffspringLitterParentNode | null;
  dam: OffspringLitterParentNode | null;
};
