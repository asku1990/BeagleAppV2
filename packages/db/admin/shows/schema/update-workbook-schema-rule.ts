import type { Prisma } from "@prisma/client";
import { prisma } from "@db/core/prisma";
import type { AdminShowWorkbookSchemaRuleDb } from "./list-workbook-schema-rules";

export type UpdateAdminShowWorkbookSchemaRuleDbInput = {
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

type ShowWorkbookColumnRuleWithValueMapsRow = {
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

function mapRuleRow(
  row: ShowWorkbookColumnRuleWithValueMapsRow,
): AdminShowWorkbookSchemaRuleDb {
  return {
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
  };
}

export async function updateAdminShowWorkbookSchemaRuleDb(
  input: UpdateAdminShowWorkbookSchemaRuleDbInput,
): Promise<AdminShowWorkbookSchemaRuleDb> {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updatedRule = await tx.showWorkbookColumnRule.update({
      where: { code: input.code },
      data: {
        headerName: input.headerName,
        policy: input.policy,
        destinationKind: input.destinationKind,
        targetField: input.targetField,
        parseMode: input.parseMode,
        fixedDefinitionCode: input.fixedDefinitionCode,
        allowedDefinitionCategoryCode: input.allowedDefinitionCategoryCode,
        headerRequired: input.headerRequired,
        rowValueRequired: input.rowValueRequired,
        sortOrder: input.sortOrder,
        isEnabled: input.isEnabled,
      },
      select: { id: true },
    });

    await tx.showWorkbookColumnValueMap.deleteMany({
      where: { ruleId: updatedRule.id },
    });

    if (input.valueMaps.length > 0) {
      await tx.showWorkbookColumnValueMap.createMany({
        data: input.valueMaps.map((valueMap) => ({
          ruleId: updatedRule.id,
          workbookValue: valueMap.workbookValue,
          definitionCode: valueMap.definitionCode,
          sortOrder: valueMap.sortOrder,
        })),
      });
    }

    const row = await tx.showWorkbookColumnRule.findUniqueOrThrow({
      where: { code: input.code },
      include: {
        valueMaps: {
          orderBy: [{ sortOrder: "asc" }, { workbookValue: "asc" }],
        },
      },
    });

    return mapRuleRow(row);
  });
}
