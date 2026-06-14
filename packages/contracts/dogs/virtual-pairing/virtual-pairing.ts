export type VirtualPairingSearchField = "ek" | "reg" | "name";

export type VirtualPairingSearchRequest = {
  field: VirtualPairingSearchField;
  query: string;
  page?: number;
  pageSize?: number;
};

export type VirtualPairingDogOption = {
  id: string;
  ekNo: number | null;
  registrationNo: string;
  name: string;
  sex: "U" | "N" | "-";
};

export type VirtualPairingSearchDogRow = VirtualPairingDogOption & {
  trialCount: number;
  showCount: number;
};

export type VirtualPairingSearchResponse = {
  field: VirtualPairingSearchField;
  query: string;
  total: number;
  totalPages: number;
  page: number;
  isLimited: boolean;
  candidateLimit: number | null;
  items: VirtualPairingSearchDogRow[];
};

export type VirtualPairingContributionPosition = {
  sireGeneration: number;
  sireIndex: number;
  damGeneration: number;
  damIndex: number;
};

export type VirtualPairingContributionDto = {
  ancestorId: string;
  label: string;
  contributionPct: number;
  rawContributionPct: number;
  occurrenceCount: number;
  positions: VirtualPairingContributionPosition[];
};

export type VirtualPairingHealthTieredDto = {
  value: number;
  text: string;
  tier: 1 | 2 | 3;
  display: string;
};

export type VirtualPairingHealthTextDto = {
  value: number;
  display: string;
};

export type PublicVirtualPairingHealthDto = {
  epi: VirtualPairingHealthTieredDto;
  risk: VirtualPairingHealthTextDto;
};

export type PublicVirtualPairingSummaryDto = {
  sharedAncestorCount: number;
  sharedOccurrenceCount: number;
  includedOccurrenceCount: number;
  includedSirePositionCount: number;
  includedDamPositionCount: number;
  includedPositionCount: number;
  knownPedigreePct: number;
  contributions: VirtualPairingContributionDto[];
};

export type CalculatePublicVirtualPairingRequest = {
  sireRegistrationNo: string;
  damRegistrationNo: string;
  generationDepth?: number;
};

export type CalculatePublicVirtualPairingResponse = {
  generationDepth: number;
  sire: VirtualPairingDogOption;
  dam: VirtualPairingDogOption;
  inbreedingCoefficientPct: number | null;
  rawInbreedingCoefficientPct: number | null;
  health: PublicVirtualPairingHealthDto;
  summary: PublicVirtualPairingSummaryDto;
};
