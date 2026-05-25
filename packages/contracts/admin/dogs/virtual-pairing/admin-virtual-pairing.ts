import type { VirtualPairingDogOption } from "@contracts/dogs/virtual-pairing";

export type AdminVirtualPairingContributionDto = {
  ancestorId: string;
  label: string;
  contributionPct: number;
  rawContributionPct: number;
  occurrenceCount: number;
  displayPct: string;
  sireGeneration: number;
  sireIndex: number;
  damGeneration: number;
  damIndex: number;
};

export type AdminVirtualPairingDiagnosticsDto = {
  sharedAncestorCount: number;
  sharedOccurrenceCount: number;
  includedOccurrenceCount: number;
  includedSirePositionCount: number;
  includedDamPositionCount: number;
  includedPositionCount: number;
  knownSlotCount: number;
  knownPedigreePct: number;
  contributions: AdminVirtualPairingContributionDto[];
};

export type CalculateAdminVirtualPairingRequest = {
  sireRegistrationNo: string;
  damRegistrationNo: string;
  generationDepth?: number;
};

export type AdminVirtualPairingPlaceholderSection = {
  label: string;
  value: string;
};

export type CalculateAdminVirtualPairingResponse = {
  generationDepth: number;
  sire: VirtualPairingDogOption;
  dam: VirtualPairingDogOption;
  inbreedingCoefficientPct: number | null;
  diagnostics: AdminVirtualPairingDiagnosticsDto;
  placeholders: {
    epi: AdminVirtualPairingPlaceholderSection;
    lafora: AdminVirtualPairingPlaceholderSection;
    pur: AdminVirtualPairingPlaceholderSection;
    risk: AdminVirtualPairingPlaceholderSection;
    diagnostics: AdminVirtualPairingPlaceholderSection;
    pedigree: AdminVirtualPairingPlaceholderSection;
  };
};
