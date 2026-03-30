import { prisma } from "../../../core/prisma";

export type AdminShowWorkbookSchemaRuleDb = {
  code: string;
  headerName: string;
  policy: "IMPORT" | "IGNORE";
  destinationKind: "SHOW_EVENT" | "SHOW_ENTRY" | "SHOW_RESULT_ITEM" | null;
  targetField:
    | "REGISTRATION_NO"
    | "EVENT_DATE"
    | "EVENT_CITY"
    | "EVENT_PLACE"
    | "EVENT_TYPE"
    | "DOG_NAME"
    | "CLASS_VALUE"
    | "QUALITY_VALUE"
    | "JUDGE"
    | "CRITIQUE_TEXT"
    | null;
  parseMode:
    | "TEXT"
    | "DATE"
    | "DEFINITION_FROM_CELL"
    | "FIXED_FLAG"
    | "FIXED_NUMERIC"
    | "FIXED_CODE"
    | "VALUE_MAP";
  fixedDefinitionCode: string | null;
  allowedDefinitionCategoryCode: string | null;
  headerRequired: boolean;
  rowValueRequired: boolean;
  sortOrder: number;
  isEnabled: boolean;
  valueMaps: Array<{
    workbookValue: string;
    definitionCode: string;
    sortOrder: number;
  }>;
};

export async function listAdminShowWorkbookSchemaRulesDb(): Promise<
  AdminShowWorkbookSchemaRuleDb[]
> {
  const rows = await prisma.showWorkbookColumnRule.findMany({
    include: {
      valueMaps: {
        orderBy: [{ sortOrder: "asc" }, { workbookValue: "asc" }],
      },
    },
    orderBy: [{ sortOrder: "asc" }, { headerName: "asc" }],
  });

  return rows.map((row) => ({
    code: row.code,
    headerName: row.headerName,
    policy: row.policy,
    destinationKind: row.destinationKind,
    targetField: row.targetField,
    parseMode: row.parseMode,
    fixedDefinitionCode: row.fixedDefinitionCode,
    allowedDefinitionCategoryCode: row.allowedDefinitionCategoryCode,
    headerRequired: row.headerRequired,
    rowValueRequired: row.rowValueRequired,
    sortOrder: row.sortOrder,
    isEnabled: row.isEnabled,
    valueMaps: row.valueMaps.map((valueMap) => ({
      workbookValue: valueMap.workbookValue,
      definitionCode: valueMap.definitionCode,
      sortOrder: valueMap.sortOrder,
    })),
  }));
}
