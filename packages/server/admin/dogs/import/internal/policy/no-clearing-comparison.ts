import type {
  DogImportField,
  DogImportIssue,
  DogImportIssueValue,
} from "@beagle/contracts";
import { issueFromDogImportFact } from "../issues/dog-import-issues";

export type DogImportComparison = {
  field: DogImportField;
  currentValue: DogImportIssueValue;
  incomingValue: DogImportIssueValue;
  registrationNo?: string | null;
  sourceRowNumber?: number | null;
};

/** Compares an optional field without ever treating an empty source as a clear. */
export function compareWithoutClearing(
  input: DogImportComparison,
): DogImportIssue | null {
  const currentEmpty = input.currentValue === null || input.currentValue === "";
  const incomingEmpty =
    input.incomingValue === null || input.incomingValue === "";
  if (incomingEmpty) {
    if (currentEmpty) return null;
    return issueFromDogImportFact({
      ...input,
      code: "SOURCE_EMPTY_PRESERVED",
      message: "Incoming empty value preserves the existing value.",
    });
  }
  return null;
}
