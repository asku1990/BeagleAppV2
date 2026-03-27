import { prisma } from "../../../core/prisma";

export type AdminShowWorkbookSchemaDefinitionRefDb = {
  code: string;
  isEnabled: boolean;
  categoryCode: string;
  valueType: "FLAG" | "CODE" | "TEXT" | "NUMERIC" | "DATE";
};

export type AdminShowWorkbookSchemaCategoryRefDb = {
  code: string;
  isEnabled: boolean;
};

export async function listAdminShowWorkbookSchemaReferenceDataDb(): Promise<{
  definitions: AdminShowWorkbookSchemaDefinitionRefDb[];
  categories: AdminShowWorkbookSchemaCategoryRefDb[];
}> {
  const [definitions, categories] = await Promise.all([
    prisma.showResultDefinition.findMany({
      select: {
        code: true,
        isEnabled: true,
        valueType: true,
        category: { select: { code: true } },
      },
      orderBy: [{ code: "asc" }],
    }),
    prisma.showResultCategory.findMany({
      select: {
        code: true,
        isEnabled: true,
      },
      orderBy: [{ sortOrder: "asc" }, { code: "asc" }],
    }),
  ]);

  return {
    definitions: definitions.map((definition) => ({
      code: definition.code,
      isEnabled: definition.isEnabled,
      categoryCode: definition.category.code,
      valueType: definition.valueType,
    })),
    categories,
  };
}
