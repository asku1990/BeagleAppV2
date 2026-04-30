import type { TrialDogPdfPayload } from "@contracts";
import type { PDFFont, PDFDocument, PDFPage } from "pdf-lib";

export type TrialDogPdfRuleSetStatus = "not-supported" | "implemented";

export type TrialDogPdfRenderContext = {
  pdfDocument: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  input: TrialDogPdfPayload;
};

export type TrialDogPdfRuleSet = {
  id: string;
  templateRelativePath: string | null;
  status: TrialDogPdfRuleSetStatus;
  renderFields?: (context: TrialDogPdfRenderContext) => void;
};
