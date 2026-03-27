import { describe, expect, it } from "vitest";
import { validateAdminShowWorkbookSchemaRuleDraft } from "../workbook-schema-validation";
import type {
  AdminShowWorkbookSchemaRule,
  AdminShowWorkbookSchemaRuleDraft,
} from "@beagle/contracts";

const references = {
  definitions: [
    {
      code: "JUN",
      isEnabled: true,
      categoryCode: "KILPAILULUOKKA",
      valueType: "FLAG" as const,
    },
    {
      code: "SIJOITUS",
      isEnabled: true,
      categoryCode: "SIJOITUS",
      valueType: "NUMERIC" as const,
    },
    {
      code: "SERT",
      isEnabled: true,
      categoryCode: "SERTTIMERKINTA",
      valueType: "FLAG" as const,
    },
  ],
  categories: [
    { code: "KILPAILULUOKKA", isEnabled: true },
    { code: "SIJOITUS", isEnabled: true },
    { code: "SERTTIMERKINTA", isEnabled: true },
  ],
};

function createRuleDraft(
  overrides: Partial<AdminShowWorkbookSchemaRuleDraft> = {},
): AdminShowWorkbookSchemaRuleDraft {
  return {
    headerName: "Luokka",
    policy: "IMPORT",
    destinationKind: "SHOW_RESULT_ITEM",
    targetField: "CLASS_VALUE",
    parseMode: "DEFINITION_FROM_CELL",
    fixedDefinitionCode: null,
    allowedDefinitionCategoryCode: "KILPAILULUOKKA",
    headerRequired: true,
    rowValueRequired: true,
    sortOrder: 10,
    isEnabled: true,
    valueMaps: [],
    ...overrides,
  };
}

function createExistingRule(
  overrides: Partial<AdminShowWorkbookSchemaRule> = {},
): AdminShowWorkbookSchemaRule {
  return {
    code: "CLASS_VALUE",
    ...createRuleDraft(),
    ...overrides,
  };
}

describe("validateAdminShowWorkbookSchemaRuleDraft", () => {
  it("rejects duplicate normalized headers", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({ headerName: "Luokka" }),
      references,
      [createExistingRule({ code: "OTHER_RULE", headerName: "Luokka!" })],
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "headerName",
          code: "DUPLICATE_HEADER_NAME",
        }),
      ]),
    );
  });

  it("rejects missing allowed category for DEFINITION_FROM_CELL", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({ allowedDefinitionCategoryCode: null }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "allowedDefinitionCategoryCode",
          code: "CATEGORY_REQUIRED",
        }),
      ]),
    );
  });

  it("allows admin-managed requiredness changes for core fields", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerRequired: false,
        rowValueRequired: false,
      }),
      references,
    );

    expect(errors).toEqual([]);
  });

  it("rejects fixed definitions with an incompatible value type", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "Sijoitus",
        targetField: null,
        parseMode: "FIXED_FLAG",
        fixedDefinitionCode: "SIJOITUS",
        allowedDefinitionCategoryCode: null,
      }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "fixedDefinitionCode",
          code: "INVALID_VALUE_TYPE",
        }),
      ]),
    );
  });
});
