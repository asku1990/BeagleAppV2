import { prisma } from "../../../core/prisma";

// Loads all workbook import lookup datasets in one DB boundary call for server parsing use-cases.
export type AdminShowWorkbookImportLookupDataDb = {
  dogRegistrations: Array<{ registrationNo: string; dogId: string }>;
  definitions: Array<{
    id: string;
    code: string;
    isEnabled: boolean;
    valueType: "FLAG" | "CODE" | "TEXT" | "NUMERIC" | "DATE";
    categoryCode: string;
  }>;
  categories: Array<{ code: string; isEnabled: boolean }>;
  columnRules: Array<{
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
  }>;
};

export async function loadAdminShowWorkbookImportLookupDataDb(): Promise<AdminShowWorkbookImportLookupDataDb> {
  const [dogRegistrations, definitions, categories, columnRules] =
    await Promise.all([
      prisma.dogRegistration.findMany({
        select: { registrationNo: true, dogId: true },
      }),
      prisma.showResultDefinition.findMany({
        select: {
          id: true,
          code: true,
          isEnabled: true,
          valueType: true,
          category: { select: { code: true } },
        },
      }),
      prisma.showResultCategory.findMany({
        select: { code: true, isEnabled: true },
        orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
      }),
      prisma.showWorkbookColumnRule.findMany({
        where: { isEnabled: true },
        include: {
          valueMaps: {
            orderBy: [{ sortOrder: "asc" }, { workbookValue: "asc" }],
          },
        },
        orderBy: [{ sortOrder: "asc" }, { headerName: "asc" }],
      }),
    ]);

  return {
    dogRegistrations,
    definitions: definitions.map((definition) => ({
      id: definition.id,
      code: definition.code,
      isEnabled: definition.isEnabled,
      valueType: definition.valueType,
      categoryCode: definition.category.code,
    })),
    categories,
    columnRules: columnRules.map((rule) => ({
      code: rule.code,
      headerName: rule.headerName,
      policy: rule.policy,
      destinationKind: rule.destinationKind,
      targetField: rule.targetField,
      parseMode: rule.parseMode,
      fixedDefinitionCode: rule.fixedDefinitionCode,
      allowedDefinitionCategoryCode: rule.allowedDefinitionCategoryCode,
      headerRequired: rule.headerRequired,
      rowValueRequired: rule.rowValueRequired,
      sortOrder: rule.sortOrder,
      isEnabled: rule.isEnabled,
      valueMaps: rule.valueMaps.map((valueMap) => ({
        workbookValue: valueMap.workbookValue,
        definitionCode: valueMap.definitionCode,
        sortOrder: valueMap.sortOrder,
      })),
    })),
  };
}
