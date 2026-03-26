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
  code: string;
  isEnabled: boolean;
  valueType: WorkbookDefinitionValueType;
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

export type WorkbookResolvedStructuralField = {
  key: WorkbookStructuralFieldKey;
  label: string;
  headerName: string;
  required: boolean;
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
  | "UNSUPPORTED_VALUE_TYPE";

export type WorkbookResolvedResultColumn =
  | {
      headerName: string;
      importMode: "VALUE_MAP";
      definitionCodes: string[];
      valueType: "FLAG";
      enabled: boolean;
      supported: boolean;
      allowedValues: Record<string, string>;
    }
  | {
      headerName: string;
      importMode: "NUMERIC";
      definitionCodes: [string];
      valueType: "NUMERIC";
      enabled: boolean;
      supported: boolean;
    }
  | {
      headerName: string;
      importMode: "PUPN";
      definitionCodes: [string];
      valueType: "CODE";
      enabled: boolean;
      supported: boolean;
    }
  | {
      headerName: string;
      importMode: "DIRECT";
      definitionCodes: [string];
      valueType: WorkbookDefinitionValueType;
      enabled: boolean;
      supported: boolean;
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
    key: WorkbookStructuralFieldKey;
    label: string;
  }>;
  resultColumns: WorkbookResolvedResultColumn[];
  blockedColumns: WorkbookResolvedBlockedColumn[];
  coverage: {
    totalWorkbookColumns: number;
    importedColumnCount: number;
    blockedColumnCount: number;
  };
};

export type WorkbookLookupData = {
  dogIdByRegistration: Map<string, string>;
  enabledDefinitionCodes: Set<string>;
  definitionsByCode: Map<string, WorkbookDefinitionMeta>;
  definitionCount: number;
};

export type WorkbookRowLookupData = Pick<
  WorkbookLookupData,
  "dogIdByRegistration" | "enabledDefinitionCodes"
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
