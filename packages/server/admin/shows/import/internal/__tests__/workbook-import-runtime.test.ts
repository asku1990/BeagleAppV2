import { beforeEach, describe, expect, it, vi } from "vitest";
import { ISSUE_CODES } from "../workbook-preview-constants";
import { evaluateWorkbookImport } from "../runtime/evaluate-workbook-import";

const {
  buildColumnMapMock,
  checkExistingImportConflictsMock,
  getCellMock,
  loadWorkbookLookupDataMock,
  parseWorkbookBufferMock,
  evaluateWorkbookRowMock,
  buildWorkbookSchemaIssuesMock,
  resolveWorkbookSchemaMock,
  summarizeWorkbookImportMock,
  validateAdminShowWorkbookSchemaRulesMock,
} = vi.hoisted(() => ({
  buildColumnMapMock: vi.fn(),
  checkExistingImportConflictsMock: vi.fn(),
  getCellMock: vi.fn(),
  loadWorkbookLookupDataMock: vi.fn(),
  parseWorkbookBufferMock: vi.fn(),
  evaluateWorkbookRowMock: vi.fn(),
  buildWorkbookSchemaIssuesMock: vi.fn(),
  resolveWorkbookSchemaMock: vi.fn(),
  summarizeWorkbookImportMock: vi.fn(),
  validateAdminShowWorkbookSchemaRulesMock: vi.fn(),
}));

vi.mock("../input/build-column-map", () => ({
  buildColumnMap: buildColumnMapMock,
}));

vi.mock("../input/get-cell", () => ({
  getCell: getCellMock,
}));

vi.mock("../input/load-workbook-lookup-data", () => ({
  loadWorkbookLookupData: loadWorkbookLookupDataMock,
}));

vi.mock("../input/parse-workbook-buffer", () => ({
  parseWorkbookBuffer: parseWorkbookBufferMock,
}));

vi.mock("../duplicates/check-existing-import-conflicts", () => ({
  checkExistingImportConflicts: checkExistingImportConflictsMock,
}));

vi.mock("../rows/evaluate-workbook-row", () => ({
  evaluateWorkbookRow: evaluateWorkbookRowMock,
}));

vi.mock("../schema/build-workbook-schema-issues", () => ({
  buildWorkbookSchemaIssues: buildWorkbookSchemaIssuesMock,
}));

vi.mock("../schema/resolve-workbook-schema", () => ({
  resolveWorkbookSchema: resolveWorkbookSchemaMock,
}));

vi.mock("../runtime/summarize-workbook-import", () => ({
  summarizeWorkbookImport: summarizeWorkbookImportMock,
}));

vi.mock("../../../core/workbook-schema-validation", () => ({
  validateAdminShowWorkbookSchemaRules:
    validateAdminShowWorkbookSchemaRulesMock,
}));

describe("evaluateWorkbookImport", () => {
  beforeEach(() => {
    buildColumnMapMock.mockReset();
    checkExistingImportConflictsMock.mockReset();
    getCellMock.mockReset();
    loadWorkbookLookupDataMock.mockReset();
    parseWorkbookBufferMock.mockReset();
    evaluateWorkbookRowMock.mockReset();
    buildWorkbookSchemaIssuesMock.mockReset();
    resolveWorkbookSchemaMock.mockReset();
    summarizeWorkbookImportMock.mockReset();
    validateAdminShowWorkbookSchemaRulesMock.mockReset();

    parseWorkbookBufferMock.mockReturnValue({
      sheetName: "Sheet1",
      headers: ["Rekisterinumero"],
      rows: [["REG-1"], ["REG-2"]],
    });
    buildColumnMapMock.mockReturnValue(new Map());
    getCellMock.mockReturnValue(null);
    loadWorkbookLookupDataMock.mockResolvedValue({
      dogIdByRegistration: new Map(),
      enabledDefinitionCodes: new Set(["AVO"]),
      definitionsByCode: new Map([
        [
          "AVO",
          {
            id: "def-1",
            code: "AVO",
            isEnabled: true,
            valueType: "FLAG",
            categoryCode: "KILPAILULUOKKA",
          },
        ],
      ]),
      definitionCategories: [{ code: "KILPAILULUOKKA", isEnabled: true }],
      definitionCount: 1,
      columnRules: [
        {
          code: "REGISTRATION_NO",
          headerName: "Rekisterinumero",
          policy: "IMPORT",
          destinationKind: "SHOW_ENTRY",
          targetField: "registrationNo",
          parseMode: "TEXT",
          fixedDefinitionCode: null,
          allowedDefinitionCategoryCode: null,
          headerRequired: true,
          rowValueRequired: true,
          sortOrder: 10,
          isEnabled: true,
          valueMaps: [],
        },
      ],
      columnRuleCount: 1,
    });
    validateAdminShowWorkbookSchemaRulesMock.mockReturnValue([]);
    resolveWorkbookSchemaMock.mockReturnValue({
      structuralFields: {},
      missingRequiredFields: [],
      resultColumns: [],
      ignoredColumns: [],
      blockedColumns: [],
      coverage: {
        totalWorkbookColumns: 1,
        importedColumnCount: 1,
        ignoredColumnCount: 0,
        blockedColumnCount: 0,
      },
    });
    buildWorkbookSchemaIssuesMock.mockReturnValue([]);
    checkExistingImportConflictsMock.mockResolvedValue(undefined);
    summarizeWorkbookImportMock.mockImplementation(
      ({ sheetName, rows, issues, schema }) => ({
        ok: true,
        sheetName,
        rows,
        issues,
        schema,
        rowCount: rows.length,
        acceptedRowCount: rows.filter(
          (row: { accepted: boolean }) => row.accepted,
        ).length,
        rejectedRowCount: rows.filter(
          (row: { accepted: boolean }) => !row.accepted,
        ).length,
        eventCount: rows.some((row: { accepted: boolean }) => row.accepted)
          ? 1
          : 0,
        entryCount: rows.filter((row: { accepted: boolean }) => row.accepted)
          .length,
        resultItemCount: rows.reduce(
          (sum: number, row: { itemCount: number; accepted: boolean }) =>
            sum + (row.accepted ? row.itemCount : 0),
          0,
        ),
        infoCount: 0,
        warningCount: 0,
        errorCount: issues.length,
        events: [{ eventLookupKey: "preview" }],
      }),
    );
  });

  it("returns a schema-missing error when no column rules are configured", async () => {
    loadWorkbookLookupDataMock.mockResolvedValue({
      dogIdByRegistration: new Map(),
      enabledDefinitionCodes: new Set(["AVO"]),
      definitionsByCode: new Map(),
      definitionCategories: [],
      definitionCount: 1,
      columnRules: [],
      columnRuleCount: 0,
    });

    await expect(
      evaluateWorkbookImport({
        workbook: Buffer.from("test"),
        runDuplicateChecks: false,
      }),
    ).resolves.toEqual({
      ok: false,
      status: 500,
      code: ISSUE_CODES.schemaMissing,
      error: "Show workbook import schema is missing; run the seed first.",
    });
  });

  it("returns a schema-invalid error when rule metadata validation fails", async () => {
    validateAdminShowWorkbookSchemaRulesMock.mockReturnValue([
      { message: "Broken workbook schema." },
    ]);

    await expect(
      evaluateWorkbookImport({
        workbook: Buffer.from("test"),
        runDuplicateChecks: false,
      }),
    ).resolves.toEqual({
      ok: false,
      status: 500,
      code: ISSUE_CODES.schemaInvalid,
      error: "Broken workbook schema.",
    });
  });

  it("passes parsed rows to duplicate checking and runtime summary", async () => {
    evaluateWorkbookRowMock
      .mockReturnValueOnce({
        accepted: true,
        issues: [],
        itemCount: 2,
        eventLookupKey: "event-1",
        eventDateIso: "2025-05-01",
        eventCity: "Helsinki",
        eventPlace: "Messukeskus",
        eventType: "All Breed",
        registrationNo: "REG-1",
        dogName: "Dog 1",
        dogMatched: true,
        judge: null,
        critiqueText: null,
        classValue: "AVO",
        qualityValue: "ERI",
        resultItems: [{ code: "AVO", label: "Avoin" }],
      })
      .mockReturnValueOnce({
        accepted: true,
        issues: [],
        itemCount: 1,
        eventLookupKey: "event-2",
        eventDateIso: "2025-05-02",
        eventCity: "Tampere",
        eventPlace: "Halli",
        eventType: "Specialty",
        registrationNo: "REG-2",
        dogName: "Dog 2",
        dogMatched: true,
        judge: null,
        critiqueText: null,
        classValue: "JUN",
        qualityValue: "ERI",
        resultItems: [{ code: "ERI", label: "Erinomainen" }],
      });

    await expect(
      evaluateWorkbookImport({
        workbook: Buffer.from("test"),
        runDuplicateChecks: true,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        acceptedRowCount: 2,
        rejectedRowCount: 0,
        eventCount: 1,
        entryCount: 2,
        resultItemCount: 3,
        errorCount: 0,
        events: [{ eventLookupKey: "preview" }],
      }),
    );

    expect(checkExistingImportConflictsMock).toHaveBeenCalledWith({
      issues: [],
      rows: expect.arrayContaining([
        expect.objectContaining({
          registrationNo: "REG-1",
          accepted: true,
          issueCount: 0,
          itemCount: 2,
        }),
        expect.objectContaining({
          registrationNo: "REG-2",
          accepted: true,
          issueCount: 0,
          itemCount: 1,
        }),
      ]),
    });
    expect(summarizeWorkbookImportMock).toHaveBeenCalledWith({
      sheetName: "Sheet1",
      rows: expect.any(Array),
      issues: [],
      schema: expect.any(Object),
    });
  });
});
