import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateAdminShowWorkbookSchemaRule } from "../validate-workbook-schema-rule";

const {
  listAdminShowWorkbookSchemaReferenceDataDbMock,
  listAdminShowWorkbookSchemaRulesDbMock,
  validateAdminShowWorkbookSchemaRuleDraftMock,
} = vi.hoisted(() => ({
  listAdminShowWorkbookSchemaReferenceDataDbMock: vi.fn(),
  listAdminShowWorkbookSchemaRulesDbMock: vi.fn(),
  validateAdminShowWorkbookSchemaRuleDraftMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminShowWorkbookSchemaReferenceDataDb:
    listAdminShowWorkbookSchemaReferenceDataDbMock,
  listAdminShowWorkbookSchemaRulesDb: listAdminShowWorkbookSchemaRulesDbMock,
}));

vi.mock("../../core/workbook-schema-validation", () => ({
  validateAdminShowWorkbookSchemaRuleDraft:
    validateAdminShowWorkbookSchemaRuleDraftMock,
}));

describe("validateAdminShowWorkbookSchemaRule", () => {
  beforeEach(() => {
    listAdminShowWorkbookSchemaReferenceDataDbMock.mockReset();
    listAdminShowWorkbookSchemaRulesDbMock.mockReset();
    validateAdminShowWorkbookSchemaRuleDraftMock.mockReset();

    listAdminShowWorkbookSchemaReferenceDataDbMock.mockResolvedValue({
      definitions: [{ code: "JUN" }],
      categories: [{ code: "KILPAILULUOKKA" }],
    });
    listAdminShowWorkbookSchemaRulesDbMock.mockResolvedValue([
      { code: "CLASS_VALUE" },
    ]);
  });

  it("returns valid=true when draft validation passes", async () => {
    validateAdminShowWorkbookSchemaRuleDraftMock.mockReturnValue([]);

    await expect(
      validateAdminShowWorkbookSchemaRule({
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
      }),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          valid: true,
          errors: [],
        },
      },
    });
  });

  it("returns draft validation errors when the rule is invalid", async () => {
    const errors = [
      {
        field: "allowedDefinitionCategoryCode",
        code: "CATEGORY_REQUIRED",
        message: "Category is required.",
      },
    ];
    validateAdminShowWorkbookSchemaRuleDraftMock.mockReturnValue(errors);

    await expect(
      validateAdminShowWorkbookSchemaRule({
        headerName: "Luokka",
        policy: "IMPORT",
        destinationKind: "SHOW_RESULT_ITEM",
        targetField: "CLASS_VALUE",
        parseMode: "DEFINITION_FROM_CELL",
        fixedDefinitionCode: null,
        allowedDefinitionCategoryCode: null,
        headerRequired: true,
        rowValueRequired: true,
        sortOrder: 10,
        isEnabled: true,
        valueMaps: [],
      }),
    ).resolves.toEqual({
      status: 200,
      body: {
        ok: true,
        data: {
          valid: false,
          errors,
        },
      },
    });
  });
});
