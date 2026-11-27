import type {
  DogImportField,
  DogImportIssue,
  DogImportIssueCode,
  DogImportIssueValue,
} from "@beagle/contracts";
import { getDogImportPolicyRule } from "../policy/dog-import-policy";

export type DogImportFact = {
  code: DogImportIssueCode;
  field?: DogImportField | null;
  registrationNo?: string | null;
  sourceRowNumber?: number | null;
  currentValue?: DogImportIssueValue;
  incomingValue?: DogImportIssueValue;
  message?: string;
};

export function issueFromDogImportFact(fact: DogImportFact): DogImportIssue {
  const rule = getDogImportPolicyRule(fact.code);
  return {
    code: fact.code,
    severity: rule.severity,
    field: fact.field ?? null,
    registrationNo: fact.registrationNo ?? null,
    sourceRowNumber: fact.sourceRowNumber ?? null,
    currentValue: fact.currentValue ?? null,
    incomingValue: fact.incomingValue ?? null,
    message: fact.message ?? fact.code,
    resolution: rule.resolution,
    overridable: rule.overridable,
  };
}

export function issuesFromDogImportFacts(
  facts: readonly DogImportFact[],
): DogImportIssue[] {
  return facts.map(issueFromDogImportFact);
}
