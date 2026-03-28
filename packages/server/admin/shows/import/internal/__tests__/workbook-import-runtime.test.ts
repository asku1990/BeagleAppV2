import { beforeEach, describe, expect, it, vi } from "vitest";
import { ISSUE_CODES } from "../workbook-preview-constants";
import { evaluateWorkbookImport } from "../workbook-import-runtime";

const {
  listExistingShowImportKeysDbMock,
  buildColumnMapMock,
  countIssueSeverityMock,
  getCellMock,
  loadLookupDataMock,
  parseWorkbookBufferMock,
  buildPreviewEventsMock,
  parseWorkbookRowMock,
  buildWorkbookSchemaIssuesMock,
  resolveWorkbookSchemaMock,
  validateAdminShowWorkbookSchemaRulesMock,
} = vi.hoisted(() => ({
  listExistingShowImportKeysDbMock: vi.fn(),
  buildColumnMapMock: vi.fn(),
  countIssueSeverityMock: vi.fn(),
  getCellMock: vi.fn(),
  loadLookupDataMock: vi.fn(),
  parseWorkbookBufferMock: vi.fn(),
  buildPreviewEventsMock: vi.fn(),
  parseWorkbookRowMock: vi.fn(),
  buildWorkbookSchemaIssuesMock: vi.fn(),
  resolveWorkbookSchemaMock: vi.fn(),
  validateAdminShowWorkbookSchemaRulesMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listExistingShowImportKeysDb: listExistingShowImportKeysDbMock,
}));

vi.mock("../workbook-preview-io", () => ({
  buildColumnMap: buildColumnMapMock,
  countIssueSeverity: countIssueSeverityMock,
  getCell: getCellMock,
  loadLookupData: loadLookupDataMock,
  parseWorkbookBuffer: parseWorkbookBufferMock,
}));

vi.mock("../workbook-preview-events", () => ({
  buildPreviewEvents: buildPreviewEventsMock,
}));

vi.mock("../workbook-preview-row", () => ({
  parseWorkbookRow: parseWorkbookRowMock,
}));

vi.mock("../workbook-preview-schema", () => ({
  buildWorkbookSchemaIssues: buildWorkbookSchemaIssuesMock,
  resolveWorkbookSchema: resolveWorkbookSchemaMock,
}));

vi.mock("../../../core/workbook-schema-validation", () => ({
  validateAdminShowWorkbookSchemaRules:
    validateAdminShowWorkbookSchemaRulesMock,
}));

describe("evaluateWorkbookImport", () => {
  beforeEach(() => {
    listExistingShowImportKeysDbMock.mockReset();
    buildColumnMapMock.mockReset();
    countIssueSeverityMock.mockReset();
    getCellMock.mockReset();
    loadLookupDataMock.mockReset();
    parseWorkbookBufferMock.mockReset();
    buildPreviewEventsMock.mockReset();
    parseWorkbookRowMock.mockReset();
    buildWorkbookSchemaIssuesMock.mockReset();
    resolveWorkbookSchemaMock.mockReset();
    validateAdminShowWorkbookSchemaRulesMock.mockReset();

    parseWorkbookBufferMock.mockReturnValue({
      sheetName: "Sheet1",
      headers: ["Rekisterinumero"],
      rows: [["REG-1"], ["REG-2"]],
    });
    buildColumnMapMock.mockReturnValue(new Map());
    getCellMock.mockReturnValue(null);
    loadLookupDataMock.mockResolvedValue({
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
    countIssueSeverityMock.mockImplementation((issues: Array<unknown>) => ({
      infoCount: 0,
      warningCount: 0,
      errorCount: issues.length,
    }));
    buildPreviewEventsMock.mockReturnValue([{ eventLookupKey: "preview" }]);
    listExistingShowImportKeysDbMock.mockResolvedValue({
      events: [],
      entries: [],
    });
  });

  it("returns a schema-missing error when no column rules are configured", async () => {
    loadLookupDataMock.mockResolvedValue({
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

  it("marks duplicate existing entries and conflicting existing events as rejected", async () => {
    parseWorkbookRowMock
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
    listExistingShowImportKeysDbMock.mockResolvedValue({
      entries: [{ entryLookupKey: "REG-1|event-1" }],
      events: [
        {
          eventLookupKey: "event-2",
          eventCity: "Lahti",
          eventType: "All Breed",
        },
      ],
    });

    await expect(
      evaluateWorkbookImport({
        workbook: Buffer.from("test"),
        runDuplicateChecks: true,
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        ok: true,
        acceptedRowCount: 0,
        rejectedRowCount: 2,
        eventCount: 0,
        entryCount: 0,
        resultItemCount: 0,
        errorCount: 2,
        rows: [
          expect.objectContaining({
            registrationNo: "REG-1",
            accepted: false,
            issueCount: 1,
            itemCount: 0,
            resultItems: [],
          }),
          expect.objectContaining({
            registrationNo: "REG-2",
            accepted: false,
            issueCount: 1,
            itemCount: 0,
            resultItems: [],
          }),
        ],
        issues: expect.arrayContaining([
          expect.objectContaining({
            code: ISSUE_CODES.duplicateExistingEntry,
            registrationNo: "REG-1",
            eventLookupKey: "event-1",
          }),
          expect.objectContaining({
            code: ISSUE_CODES.eventMetadataConflict,
            registrationNo: "REG-2",
            eventLookupKey: "event-2",
            message: expect.stringContaining("city differs"),
          }),
        ]),
        events: [{ eventLookupKey: "preview" }],
      }),
    );
  });
});
