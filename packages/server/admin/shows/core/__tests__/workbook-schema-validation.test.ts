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

  it("allows admin-managed requiredness changes for non-key fields", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "Tuomari",
        targetField: "JUDGE",
        parseMode: "TEXT",
        destinationKind: "SHOW_ENTRY",
        allowedDefinitionCategoryCode: null,
        headerRequired: false,
        rowValueRequired: false,
      }),
      references,
    );

    expect(errors).toEqual([]);
  });

  it("rejects optional lookup-key fields", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "Aika",
        targetField: "EVENT_DATE",
        parseMode: "DATE",
        destinationKind: "SHOW_EVENT",
        allowedDefinitionCategoryCode: null,
        headerRequired: false,
        rowValueRequired: false,
      }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "rowValueRequired",
          code: "LOOKUP_KEY_FIELD_REQUIRED",
        }),
      ]),
    );
  });

  it("rejects ignored lookup-key fields", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "Paikka",
        targetField: "EVENT_PLACE",
        parseMode: "TEXT",
        destinationKind: null,
        allowedDefinitionCategoryCode: null,
        policy: "IGNORE",
      }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "policy",
          code: "LOOKUP_KEY_FIELD_IMPORT_REQUIRED",
        }),
      ]),
    );
  });

  it("rejects disabled lookup-key fields", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "Paikkakunta",
        targetField: "EVENT_CITY",
        parseMode: "TEXT",
        destinationKind: "SHOW_EVENT",
        allowedDefinitionCategoryCode: null,
        isEnabled: false,
      }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "policy",
          code: "LOOKUP_KEY_FIELD_ENABLED_REQUIRED",
        }),
      ]),
    );
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

  it("rejects targetField on VALUE_MAP rules", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "ROP",
        parseMode: "VALUE_MAP",
        destinationKind: "SHOW_RESULT_ITEM",
        targetField: "CLASS_VALUE",
        fixedDefinitionCode: null,
        allowedDefinitionCategoryCode: null,
        valueMaps: [
          { workbookValue: "ROP", definitionCode: "SERT", sortOrder: 10 },
        ],
      }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "targetField",
          code: "TARGET_FIELD_NOT_ALLOWED",
        }),
      ]),
    );
  });

  it("rejects targetField on FIXED_* rules", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "SA",
        parseMode: "FIXED_FLAG",
        destinationKind: "SHOW_RESULT_ITEM",
        targetField: "CLASS_VALUE",
        fixedDefinitionCode: "SERT",
        allowedDefinitionCategoryCode: null,
      }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "targetField",
          code: "TARGET_FIELD_NOT_ALLOWED",
        }),
      ]),
    );
  });

  it("rejects class and quality fields outside DEFINITION_FROM_CELL mode", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "Luokka",
        parseMode: "TEXT",
        destinationKind: "SHOW_ENTRY",
        targetField: "CLASS_VALUE",
        allowedDefinitionCategoryCode: null,
      }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "targetField",
          code: "TARGET_FIELD_PARSE_MODE_MISMATCH",
        }),
      ]),
    );
  });

  it("rejects DEFINITION_FROM_CELL on non-result target fields", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "Tuomari",
        parseMode: "DEFINITION_FROM_CELL",
        destinationKind: "SHOW_RESULT_ITEM",
        targetField: "JUDGE",
        allowedDefinitionCategoryCode: "KILPAILULUOKKA",
      }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "targetField",
          code: "TARGET_FIELD_PARSE_MODE_MISMATCH",
        }),
      ]),
    );
  });

  it("rejects non-flag definitions in VALUE_MAP rules", () => {
    const errors = validateAdminShowWorkbookSchemaRuleDraft(
      createRuleDraft({
        headerName: "PuPn",
        parseMode: "VALUE_MAP",
        destinationKind: "SHOW_RESULT_ITEM",
        targetField: null,
        fixedDefinitionCode: null,
        allowedDefinitionCategoryCode: null,
        valueMaps: [
          {
            workbookValue: "1",
            definitionCode: "SIJOITUS",
            sortOrder: 10,
          },
        ],
      }),
      references,
    );

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "valueMaps",
          code: "INVALID_VALUE_TYPE",
        }),
      ]),
    );
  });
});
