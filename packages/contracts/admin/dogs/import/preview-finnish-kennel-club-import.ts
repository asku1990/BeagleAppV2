import type { DogImportIssue } from "./types";

export type AdminDogImportPreviewRow = {
  sourceRowNumber: number;
  registrationNo: string | null;
  name: string | null;
  status: "CREATE" | "UPDATE" | "UNCHANGED" | "BLOCKED";
  issues: DogImportIssue[];
};

export type AdminFinnishKennelClubImportPreviewResponse = {
  source: "FINNISH_KENNEL_CLUB";
  fileName: string;
  sheetName: string;
  policyVersion: string;
  previewDigest: string;
  sourceFileSha256: string;
  applyAllowed: boolean;
  rowCount: number;
  createCount: number;
  updateCount: number;
  unchangedCount: number;
  blockedCount: number;
  referenceCount: number;
  issues: DogImportIssue[];
  rows: AdminDogImportPreviewRow[];
};
