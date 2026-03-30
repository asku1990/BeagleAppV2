import type { AdminShowWorkbookSchemaTargetField } from "@beagle/contracts";
import type { WorkbookStructuralFieldKey } from "./workbook-preview-types";

const TARGET_FIELD_TO_STRUCTURAL_FIELD_KEY: Record<
  AdminShowWorkbookSchemaTargetField,
  WorkbookStructuralFieldKey
> = {
  REGISTRATION_NO: "registrationNo",
  EVENT_DATE: "eventDate",
  EVENT_CITY: "eventCity",
  EVENT_PLACE: "eventPlace",
  EVENT_TYPE: "eventType",
  DOG_NAME: "dogName",
  CLASS_VALUE: "classValue",
  QUALITY_VALUE: "qualityValue",
  JUDGE: "judge",
  CRITIQUE_TEXT: "critiqueText",
};

const STRUCTURAL_FIELD_KEY_TO_TARGET_FIELD: Record<
  WorkbookStructuralFieldKey,
  AdminShowWorkbookSchemaTargetField
> = {
  registrationNo: "REGISTRATION_NO",
  eventDate: "EVENT_DATE",
  eventCity: "EVENT_CITY",
  eventPlace: "EVENT_PLACE",
  eventType: "EVENT_TYPE",
  dogName: "DOG_NAME",
  classValue: "CLASS_VALUE",
  qualityValue: "QUALITY_VALUE",
  judge: "JUDGE",
  critiqueText: "CRITIQUE_TEXT",
};

export function mapTargetFieldToWorkbookStructuralFieldKey(
  targetField: AdminShowWorkbookSchemaTargetField | null,
): WorkbookStructuralFieldKey | null {
  return targetField ? TARGET_FIELD_TO_STRUCTURAL_FIELD_KEY[targetField] : null;
}

export function mapWorkbookStructuralFieldKeyToTargetField(
  key: WorkbookStructuralFieldKey | null,
): AdminShowWorkbookSchemaTargetField | null {
  return key ? STRUCTURAL_FIELD_KEY_TO_TARGET_FIELD[key] : null;
}
