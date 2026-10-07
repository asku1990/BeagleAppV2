import type { DogImportIssue } from "./types";

export type AdminFinnishKennelClubImportApplyRequest = {
  previewDigest: string;
  sourceFileSha256: string;
};

export type AdminFinnishKennelClubImportApplyResponse = {
  success: boolean;
  policyVersion: string;
  createdCount: number;
  updatedCount: number;
  unchangedCount: number;
  referenceCount: number;
  issues: DogImportIssue[];
};
