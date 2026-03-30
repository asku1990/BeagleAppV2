import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateAdminShowWorkbookSchemaRule } from "../update-workbook-schema-rule";

const {
  listAdminShowWorkbookSchemaReferenceDataDbMock,
  listAdminShowWorkbookSchemaRulesDbMock,
  updateAdminShowWorkbookSchemaRuleDbMock,
} = vi.hoisted(() => ({
  listAdminShowWorkbookSchemaReferenceDataDbMock: vi.fn(),
  listAdminShowWorkbookSchemaRulesDbMock: vi.fn(),
  updateAdminShowWorkbookSchemaRuleDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listAdminShowWorkbookSchemaReferenceDataDb:
    listAdminShowWorkbookSchemaReferenceDataDbMock,
  listAdminShowWorkbookSchemaRulesDb: listAdminShowWorkbookSchemaRulesDbMock,
  updateAdminShowWorkbookSchemaRuleDb: updateAdminShowWorkbookSchemaRuleDbMock,
}));

describe("updateAdminShowWorkbookSchemaRule", () => {
  beforeEach(() => {
    listAdminShowWorkbookSchemaReferenceDataDbMock.mockReset();
    listAdminShowWorkbookSchemaRulesDbMock.mockReset();
    updateAdminShowWorkbookSchemaRuleDbMock.mockReset();

    listAdminShowWorkbookSchemaReferenceDataDbMock.mockResolvedValue({
      definitions: [
        {
          code: "JUN",
          isEnabled: true,
          categoryCode: "KILPAILULUOKKA",
          valueType: "FLAG",
        },
      ],
      categories: [{ code: "KILPAILULUOKKA", isEnabled: true }],
    });
    listAdminShowWorkbookSchemaRulesDbMock.mockResolvedValue([]);
  });

  it("returns structured validation errors for invalid rule saves", async () => {
    await expect(
      updateAdminShowWorkbookSchemaRule({
        code: "CLASS_VALUE",
        rule: {
          headerName: "Luokka",
          policy: "IMPORT",
          destinationKind: "SHOW_RESULT_ITEM",
          targetField: "CLASS_VALUE",
          parseMode: "DEFINITION_FROM_CELL",
          fixedDefinitionCode: null,
          allowedDefinitionCategoryCode: null,
          headerRequired: false,
          rowValueRequired: false,
          sortOrder: 10,
          isEnabled: true,
          valueMaps: [],
        },
      }),
    ).resolves.toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Workbook schema rule is invalid.",
        code: "INVALID_SHOW_WORKBOOK_SCHEMA_RULE",
        details: {
          errors: [
            {
              field: "allowedDefinitionCategoryCode",
              code: "CATEGORY_REQUIRED",
              message:
                "DEFINITION_FROM_CELL rules must define an allowed definition category.",
            },
          ],
        },
      },
    });

    expect(updateAdminShowWorkbookSchemaRuleDbMock).not.toHaveBeenCalled();
  });
});
