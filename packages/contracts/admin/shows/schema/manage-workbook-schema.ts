export type AdminShowWorkbookSchemaRulePolicy = "IMPORT" | "IGNORE";
export type AdminShowWorkbookSchemaDestinationKind =
  | "SHOW_EVENT"
  | "SHOW_ENTRY"
  | "SHOW_RESULT_ITEM";
export type AdminShowWorkbookSchemaTargetField =
  | "REGISTRATION_NO"
  | "EVENT_DATE"
  | "EVENT_CITY"
  | "EVENT_PLACE"
  | "EVENT_TYPE"
  | "DOG_NAME"
  | "CLASS_VALUE"
  | "QUALITY_VALUE"
  | "JUDGE"
  | "CRITIQUE_TEXT";
export type AdminShowWorkbookSchemaParseMode =
  | "TEXT"
  | "DATE"
  | "DEFINITION_FROM_CELL"
  | "FIXED_FLAG"
  | "FIXED_NUMERIC"
  | "FIXED_CODE"
  | "VALUE_MAP";

export type AdminShowWorkbookSchemaValueMap = {
  workbookValue: string;
  definitionCode: string;
  sortOrder: number;
};

export type AdminShowWorkbookSchemaRuleDraft = {
  headerName: string;
  policy: AdminShowWorkbookSchemaRulePolicy;
  destinationKind: AdminShowWorkbookSchemaDestinationKind | null;
  targetField: AdminShowWorkbookSchemaTargetField | null;
  parseMode: AdminShowWorkbookSchemaParseMode;
  fixedDefinitionCode: string | null;
  allowedDefinitionCategoryCode: string | null;
  headerRequired: boolean;
  rowValueRequired: boolean;
  sortOrder: number;
  isEnabled: boolean;
  valueMaps: AdminShowWorkbookSchemaValueMap[];
};

export type AdminShowWorkbookSchemaRule = AdminShowWorkbookSchemaRuleDraft & {
  code: string;
};

export type AdminShowWorkbookSchemaValidationError = {
  field:
    | "headerName"
    | "policy"
    | "destinationKind"
    | "targetField"
    | "parseMode"
    | "fixedDefinitionCode"
    | "allowedDefinitionCategoryCode"
    | "headerRequired"
    | "rowValueRequired"
    | "valueMaps";
  code: string;
  message: string;
};

export type ListAdminShowWorkbookSchemaResponse = {
  rules: AdminShowWorkbookSchemaRule[];
};

export type ValidateAdminShowWorkbookSchemaRuleRequest =
  AdminShowWorkbookSchemaRuleDraft & {
    code?: string;
  };

export type ValidateAdminShowWorkbookSchemaRuleResponse = {
  valid: boolean;
  errors: AdminShowWorkbookSchemaValidationError[];
};

export type UpdateAdminShowWorkbookSchemaRuleRequest = {
  code: string;
  rule: AdminShowWorkbookSchemaRuleDraft;
};

export type UpdateAdminShowWorkbookSchemaRuleResponse = {
  rule: AdminShowWorkbookSchemaRule;
};
