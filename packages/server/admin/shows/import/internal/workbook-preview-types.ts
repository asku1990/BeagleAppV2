import type {
  AdminShowWorkbookImportIssue,
  AdminShowWorkbookImportPreviewItem,
} from "@beagle/contracts";

export type WorkbookDefinitionValueType =
  | "FLAG"
  | "CODE"
  | "TEXT"
  | "NUMERIC"
  | "DATE";

export type WorkbookCell = string | number | boolean | Date | null | undefined;
export type WorkbookRow = WorkbookCell[];
export type WorkbookColumnMap = Map<string, number>;

export type WorkbookDefinitionMeta = {
  id: string;
  code: string;
  isEnabled: boolean;
  valueType: WorkbookDefinitionValueType;
  categoryCode: string;
};

export type WorkbookStructuralFieldKey =
  | "registrationNo"
  | "eventDate"
  | "eventCity"
  | "eventPlace"
  | "eventType"
  | "dogName"
  | "classValue"
  | "qualityValue"
  | "judge"
  | "critiqueText";

export type WorkbookColumnRulePolicy = "IMPORT" | "IGNORE";
export type WorkbookColumnRuleDestinationKind =
  | "SHOW_EVENT"
  | "SHOW_ENTRY"
  | "SHOW_RESULT_ITEM";
export type WorkbookColumnRuleParseMode =
  | "TEXT"
  | "DATE"
  | "DEFINITION_FROM_CELL"
  | "FIXED_FLAG"
  | "FIXED_NUMERIC"
  | "FIXED_CODE"
  | "VALUE_MAP";

export type WorkbookColumnRuleValueMap = {
  workbookValue: string;
  definitionCode: string;
  sortOrder: number;
};

export type WorkbookColumnRuleMeta = {
  code: string;
  headerName: string;
  policy: WorkbookColumnRulePolicy;
  destinationKind: WorkbookColumnRuleDestinationKind | null;
  targetField: WorkbookStructuralFieldKey | null;
  parseMode: WorkbookColumnRuleParseMode;
  fixedDefinitionCode: string | null;
  allowedDefinitionCategoryCode: string | null;
  headerRequired: boolean;
  rowValueRequired: boolean;
  sortOrder: number;
  isEnabled: boolean;
  valueMaps: WorkbookColumnRuleValueMap[];
};

export type WorkbookResolvedStructuralField = {
  key: WorkbookStructuralFieldKey;
  label: string;
  headerName: string;
  required: boolean;
  rowValueRequired: boolean;
  destinationKind: WorkbookColumnRuleDestinationKind;
  parseMode: WorkbookColumnRuleParseMode;
  allowedDefinitionCategoryCode: string | null;
};

export type WorkbookResolvedResultColumnImportMode =
  | "VALUE_MAP"
  | "DIRECT"
  | "NUMERIC"
  | "PUPN";

export type WorkbookResolvedBlockedColumnReasonCode =
  | "UNSUPPORTED_COLUMN"
  | "DUPLICATE_HEADER"
  | "UNNAMED_COLUMN_WITH_DATA"
  | "DISABLED_DEFINITION"
  | "UNSUPPORTED_VALUE_TYPE"
  | "MISSING_DEFINITION";

export type WorkbookResolvedIgnoredColumn = {
  headerName: string;
  columnIndex: number;
  ruleCode: string;
  reasonText: string;
};

export type WorkbookResolvedResultColumn =
  | {
      ruleCode: string;
      headerName: string;
      rowValueRequired: boolean;
      importMode: "VALUE_MAP";
      parseMode: "VALUE_MAP";
      definitionCodes: string[];
      valueType: "FLAG";
      allowedValues: Record<string, string>;
    }
  | {
      ruleCode: string;
      headerName: string;
      rowValueRequired: boolean;
      importMode: "NUMERIC";
      parseMode: "FIXED_NUMERIC";
      definitionCodes: [string];
      valueType: "NUMERIC";
    }
  | {
      ruleCode: string;
      headerName: string;
      rowValueRequired: boolean;
      importMode: "PUPN";
      parseMode: "FIXED_CODE";
      definitionCodes: [string];
      valueType: "CODE";
    }
  | {
      ruleCode: string;
      headerName: string;
      rowValueRequired: boolean;
      importMode: "DIRECT";
      parseMode: "FIXED_FLAG" | "DEFINITION_FROM_CELL";
      definitionCodes: string[];
      valueType: WorkbookDefinitionValueType;
      allowedDefinitionCategoryCode: string | null;
    };

export type WorkbookResolvedBlockedColumn = {
  headerName: string;
  columnIndex: number;
  reasonCode: WorkbookResolvedBlockedColumnReasonCode;
  reasonText: string;
};

export type WorkbookResolvedSchema = {
  structuralFields: Partial<
    Record<WorkbookStructuralFieldKey, WorkbookResolvedStructuralField>
  >;
  missingRequiredFields: Array<{
    key: string;
    label: string;
  }>;
  resultColumns: WorkbookResolvedResultColumn[];
  ignoredColumns: WorkbookResolvedIgnoredColumn[];
  blockedColumns: WorkbookResolvedBlockedColumn[];
  coverage: {
    totalWorkbookColumns: number;
    importedColumnCount: number;
    ignoredColumnCount: number;
    blockedColumnCount: number;
  };
};

export type WorkbookLookupData = {
  dogIdByRegistration: Map<string, string>;
  enabledDefinitionCodes: Set<string>;
  definitionsByCode: Map<string, WorkbookDefinitionMeta>;
  definitionCategories: Array<{ code: string; isEnabled: boolean }>;
  definitionCount: number;
  columnRules: WorkbookColumnRuleMeta[];
  columnRuleCount: number;
};

export type WorkbookRowLookupData = Pick<
  WorkbookLookupData,
  "dogIdByRegistration" | "enabledDefinitionCodes" | "definitionsByCode"
> & {
  schema: WorkbookResolvedSchema;
};

export type WorkbookParsedRow = {
  rowNumber: number;
  eventLookupKey: string;
  eventDateIso: string;
  eventCity: string;
  eventPlace: string;
  eventType: string;
  accepted: boolean;
  issueCount: number;
  itemCount: number;
  registrationNo: string;
  dogName: string;
  dogMatched: boolean;
  judge: string | null;
  critiqueText: string | null;
  classValue: string;
  qualityValue: string;
  resultItems: AdminShowWorkbookImportPreviewItem[];
};

export type WorkbookRowParseResult = {
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

export type WorkbookIssueInput = {
  rowNumber: number | null;
  columnName: string | null;
  severity: AdminShowWorkbookImportIssue["severity"];
  code: string;
  message: string;
  registrationNo: string | null;
  eventLookupKey: string | null;
};
