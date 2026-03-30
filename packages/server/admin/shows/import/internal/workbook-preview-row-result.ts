import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import type {
  WorkbookParsedRow,
  WorkbookRowParseResult,
} from "./workbook-preview-types";

type WorkbookRowResultInput = {
  issues: AdminShowWorkbookImportIssue[];
  accepted: boolean;
  eventLookupKey: string | null;
  itemCount: number;
  eventDateIso: string | null;
  eventCity: string | null;
  eventPlace: string | null;
  eventType: string | null;
  registrationNo: string | null;
  dogName: string | null;
  dogMatched: boolean;
  judge: string | null;
  critiqueText: string | null;
  classValue: string | null;
  qualityValue: string | null;
  resultItems: WorkbookParsedRow["resultItems"];
};

export function createWorkbookRowParseResult(
  input: WorkbookRowResultInput,
): WorkbookRowParseResult {
  return input;
}
