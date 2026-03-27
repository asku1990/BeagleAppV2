import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import { previewAdminShowWorkbookImport } from "../preview-workbook-import";

const {
  dogRegistrationFindManyMock,
  showResultDefinitionFindManyMock,
  showResultCategoryFindManyMock,
  showWorkbookColumnRuleFindManyMock,
  showEventFindManyMock,
  showEntryFindManyMock,
} = vi.hoisted(() => ({
  dogRegistrationFindManyMock: vi.fn(),
  showResultDefinitionFindManyMock: vi.fn(),
  showResultCategoryFindManyMock: vi.fn(),
  showWorkbookColumnRuleFindManyMock: vi.fn(),
  showEventFindManyMock: vi.fn(),
  showEntryFindManyMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  prisma: {
    dogRegistration: {
      findMany: dogRegistrationFindManyMock,
    },
    showResultDefinition: {
      findMany: showResultDefinitionFindManyMock,
    },
    showResultCategory: {
      findMany: showResultCategoryFindManyMock,
    },
    showWorkbookColumnRule: {
      findMany: showWorkbookColumnRuleFindManyMock,
    },
    showEvent: {
      findMany: showEventFindManyMock,
    },
    showEntry: {
      findMany: showEntryFindManyMock,
    },
  },
}));

const SUPPORTED_HEADERS: unknown[] = [
  "Rekisterinumero",
  "Aika",
  "Paikkakunta",
  "Paikka",
  "Näyttelytyyppi",
  "Nimi",
  "Luokka",
  "Laatuarvostelu",
  "Sijoitus",
  "PuPn",
  "SERT",
  "CACIB",
  "SA",
  "Tuomari",
  "Arvostelu",
];

const IDX = {
  registrationNo: 0,
  eventDate: 1,
  eventCity: 2,
  eventPlace: 3,
  eventType: 4,
  dogName: 5,
  classValue: 6,
  qualityValue: 7,
  sijoitus: 8,
  pupn: 9,
  sert: 10,
  cacib: 11,
  sa: 12,
  judge: 13,
  critiqueText: 14,
} as const;

function buildWorkbookBuffer(
  rows: unknown[][],
  headers: unknown[] = SUPPORTED_HEADERS,
): Buffer {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Näyttelytulokset");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

function createRow(
  overrides: Record<number, unknown>,
  length: number = SUPPORTED_HEADERS.length,
): unknown[] {
  const row = Array<unknown>(length).fill(null);
  for (const [index, value] of Object.entries(overrides)) {
    row[Number(index)] = value;
  }
  return row;
}

const sharedDefinitions = [
  {
    code: "AVO",
    isEnabled: true,
    valueType: "FLAG" as const,
    category: { code: "KILPAILULUOKKA" },
  },
  {
    code: "JUN",
    isEnabled: true,
    valueType: "FLAG" as const,
    category: { code: "KILPAILULUOKKA" },
  },
  {
    code: "ERI",
    isEnabled: true,
    valueType: "FLAG" as const,
    category: { code: "LAATUARVOSTELU" },
  },
  {
    code: "SERT",
    isEnabled: true,
    valueType: "FLAG" as const,
    category: { code: "SERTTIMERKINTA" },
  },
  {
    code: "varaSERT",
    isEnabled: true,
    valueType: "FLAG" as const,
    category: { code: "SERTTIMERKINTA" },
  },
  {
    code: "CACIB",
    isEnabled: true,
    valueType: "FLAG" as const,
    category: { code: "SERTTIMERKINTA" },
  },
  {
    code: "varaCACIB",
    isEnabled: true,
    valueType: "FLAG" as const,
    category: { code: "SERTTIMERKINTA" },
  },
  {
    code: "SA",
    isEnabled: true,
    valueType: "FLAG" as const,
    category: { code: "SERTTIMERKINTA" },
  },
  {
    code: "SIJOITUS",
    isEnabled: true,
    valueType: "NUMERIC" as const,
    category: { code: "SIJOITUS" },
  },
  {
    code: "PUPN",
    isEnabled: true,
    valueType: "CODE" as const,
    category: { code: "PUPN" },
  },
];

const sharedCategories = [
  { code: "KILPAILULUOKKA", isEnabled: true },
  { code: "LAATUARVOSTELU", isEnabled: true },
  { code: "SERTTIMERKINTA", isEnabled: true },
  { code: "SIJOITUS", isEnabled: true },
  { code: "PUPN", isEnabled: true },
];

function createColumnRule(overrides: Record<string, unknown>) {
  return {
    code: "RULE",
    headerName: "Header",
    policy: "IMPORT",
    destinationKind: "SHOW_ENTRY",
    targetField: null,
    parseMode: "TEXT",
    fixedDefinitionCode: null,
    allowedDefinitionCategoryCode: null,
    headerRequired: false,
    rowValueRequired: false,
    sortOrder: 0,
    isEnabled: true,
    valueMaps: [] as Array<{
      workbookValue: string;
      definitionCode: string;
      sortOrder: number;
    }>,
    ...overrides,
  };
}

function buildDefaultColumnRules() {
  return [
    createColumnRule({
      code: "REGISTRATION_NO",
      headerName: "Rekisterinumero",
      destinationKind: "SHOW_ENTRY",
      targetField: "REGISTRATION_NO",
      parseMode: "TEXT",
      headerRequired: true,
      rowValueRequired: true,
      sortOrder: 10,
    }),
    createColumnRule({
      code: "EVENT_DATE",
      headerName: "Aika",
      destinationKind: "SHOW_EVENT",
      targetField: "EVENT_DATE",
      parseMode: "DATE",
      headerRequired: true,
      rowValueRequired: true,
      sortOrder: 20,
    }),
    createColumnRule({
      code: "EVENT_CITY",
      headerName: "Paikkakunta",
      destinationKind: "SHOW_EVENT",
      targetField: "EVENT_CITY",
      parseMode: "TEXT",
      headerRequired: true,
      rowValueRequired: true,
      sortOrder: 30,
    }),
    createColumnRule({
      code: "EVENT_PLACE",
      headerName: "Paikka",
      destinationKind: "SHOW_EVENT",
      targetField: "EVENT_PLACE",
      parseMode: "TEXT",
      headerRequired: true,
      rowValueRequired: true,
      sortOrder: 40,
    }),
    createColumnRule({
      code: "EVENT_TYPE",
      headerName: "Näyttelytyyppi",
      destinationKind: "SHOW_EVENT",
      targetField: "EVENT_TYPE",
      parseMode: "TEXT",
      headerRequired: true,
      rowValueRequired: true,
      sortOrder: 50,
    }),
    createColumnRule({
      code: "DOG_NAME",
      headerName: "Nimi",
      destinationKind: "SHOW_ENTRY",
      targetField: "DOG_NAME",
      parseMode: "TEXT",
      headerRequired: true,
      rowValueRequired: true,
      sortOrder: 60,
    }),
    createColumnRule({
      code: "CLASS_VALUE",
      headerName: "Luokka",
      destinationKind: "SHOW_RESULT_ITEM",
      targetField: "CLASS_VALUE",
      parseMode: "DEFINITION_FROM_CELL",
      allowedDefinitionCategoryCode: "KILPAILULUOKKA",
      headerRequired: true,
      rowValueRequired: true,
      sortOrder: 70,
    }),
    createColumnRule({
      code: "QUALITY_VALUE",
      headerName: "Laatuarvostelu",
      destinationKind: "SHOW_RESULT_ITEM",
      targetField: "QUALITY_VALUE",
      parseMode: "DEFINITION_FROM_CELL",
      allowedDefinitionCategoryCode: "LAATUARVOSTELU",
      headerRequired: true,
      rowValueRequired: true,
      sortOrder: 80,
    }),
    createColumnRule({
      code: "BREED_CODE",
      headerName: "Rotukoodi",
      policy: "IGNORE",
      destinationKind: null,
      targetField: null,
      parseMode: "TEXT",
      sortOrder: 90,
    }),
    createColumnRule({
      code: "PLACEMENT",
      headerName: "Sijoitus",
      destinationKind: "SHOW_RESULT_ITEM",
      parseMode: "FIXED_NUMERIC",
      fixedDefinitionCode: "SIJOITUS",
      sortOrder: 100,
    }),
    createColumnRule({
      code: "PUPN",
      headerName: "PuPn",
      destinationKind: "SHOW_RESULT_ITEM",
      parseMode: "FIXED_CODE",
      fixedDefinitionCode: "PUPN",
      sortOrder: 110,
    }),
    createColumnRule({
      code: "CERT",
      headerName: "SERT",
      destinationKind: "SHOW_RESULT_ITEM",
      parseMode: "VALUE_MAP",
      sortOrder: 120,
      valueMaps: [
        { workbookValue: "SERT", definitionCode: "SERT", sortOrder: 10 },
        {
          workbookValue: "varaSERT",
          definitionCode: "varaSERT",
          sortOrder: 20,
        },
      ],
    }),
    createColumnRule({
      code: "CACIB",
      headerName: "CACIB",
      destinationKind: "SHOW_RESULT_ITEM",
      parseMode: "VALUE_MAP",
      sortOrder: 130,
      valueMaps: [
        { workbookValue: "CACIB", definitionCode: "CACIB", sortOrder: 10 },
        {
          workbookValue: "varaCACIB",
          definitionCode: "varaCACIB",
          sortOrder: 20,
        },
      ],
    }),
    createColumnRule({
      code: "SA",
      headerName: "SA",
      destinationKind: "SHOW_RESULT_ITEM",
      parseMode: "FIXED_FLAG",
      fixedDefinitionCode: "SA",
      sortOrder: 140,
    }),
    createColumnRule({
      code: "JUDGE",
      headerName: "Tuomari",
      destinationKind: "SHOW_ENTRY",
      targetField: "JUDGE",
      parseMode: "TEXT",
      sortOrder: 150,
    }),
    createColumnRule({
      code: "CRITIQUE_TEXT",
      headerName: "Arvostelu",
      destinationKind: "SHOW_ENTRY",
      targetField: "CRITIQUE_TEXT",
      parseMode: "TEXT",
      sortOrder: 160,
    }),
  ];
}

describe("previewAdminShowWorkbookImport", () => {
  beforeEach(() => {
    dogRegistrationFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockReset();
    showResultCategoryFindManyMock.mockReset();
    showWorkbookColumnRuleFindManyMock.mockReset();
    showEventFindManyMock.mockReset();
    showEntryFindManyMock.mockReset();

    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI16175/23", dogId: "dog_1" },
    ]);
    showResultDefinitionFindManyMock.mockResolvedValue(sharedDefinitions);
    showResultCategoryFindManyMock.mockResolvedValue(sharedCategories);
    showWorkbookColumnRuleFindManyMock.mockResolvedValue(
      buildDefaultColumnRules(),
    );
    showEventFindManyMock.mockResolvedValue([]);
    showEntryFindManyMock.mockResolvedValue([]);
  });

  it("parses a workbook preview when seeded metadata and definitions cover the workbook", async () => {
    const row1 = createRow({
      [IDX.registrationNo]: "FI16175/23",
      [IDX.eventDate]: new Date("2025-01-10T21:59:11.000Z"),
      [IDX.eventCity]: "Kajaani",
      [IDX.eventPlace]: "Kajaanin Pallohalli",
      [IDX.eventType]: "Kansainvälinen näyttely",
      [IDX.dogName]: "CARDIEM KIND REGARDS",
      [IDX.classValue]: "AVO",
      [IDX.qualityValue]: "ERI",
      [IDX.sijoitus]: 1,
      [IDX.pupn]: "PN4",
      [IDX.sa]: "SA",
      [IDX.judge]: "Laakso Jari",
      [IDX.critiqueText]: "Arvosteluteksti",
    });

    const row2 = createRow({
      [IDX.registrationNo]: "FI15442/24",
      [IDX.eventDate]: new Date("2025-01-10T21:59:11.000Z"),
      [IDX.eventCity]: "Kajaani",
      [IDX.eventPlace]: "Kajaanin Pallohalli",
      [IDX.eventType]: "Kansainvälinen näyttely",
      [IDX.dogName]: "CARDIEM PARK ME IN FIFTH AVENUE",
      [IDX.classValue]: "JUN",
      [IDX.qualityValue]: "ERI",
      [IDX.judge]: "Laakso Jari",
      [IDX.critiqueText]: "Toinen arvostelu",
    });

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: buildWorkbookBuffer([row1, row2]),
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data).toMatchObject({
      fileName: "Näyttelyt.xlsx",
      sheetName: "Näyttelytulokset",
      rowCount: 2,
      acceptedRowCount: 2,
      rejectedRowCount: 0,
      eventCount: 1,
      entryCount: 2,
      resultItemCount: 7,
      warningCount: 1,
      errorCount: 0,
    });
    expect(result.body.data.schema.coverage).toEqual({
      totalWorkbookColumns: 15,
      importedColumnCount: 15,
      ignoredColumnCount: 0,
      blockedColumnCount: 0,
    });
    expect(result.body.data.schema.ignoredColumns).toEqual([]);
    expect(result.body.data.schema.blockedColumns).toEqual([]);
    expect(result.body.data.events[0]?.entries[0]?.resultItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          columnName: "Sijoitus",
          definitionCode: "SIJOITUS",
          valueNumeric: 1,
        }),
        expect.objectContaining({
          columnName: "PuPn",
          definitionCode: "PUPN",
          valueCode: "PN4",
        }),
      ]),
    );
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_DOG_NOT_FOUND",
          severity: "WARNING",
          registrationNo: "FI15442/24",
        }),
      ]),
    );
  });

  it("accepts headers that only differ by whitespace or punctuation after normalization", async () => {
    const workbook = buildWorkbookBuffer(
      [
        createRow({
          [IDX.registrationNo]: "FI16175/23",
          [IDX.eventDate]: new Date("2025-01-10T21:59:11.000Z"),
          [IDX.eventCity]: "Kajaani",
          [IDX.eventPlace]: "Kajaanin Pallohalli",
          [IDX.eventType]: "Kansainvälinen näyttely",
          [IDX.dogName]: "CARDIEM KIND REGARDS",
          [IDX.classValue]: "AVO",
          [IDX.qualityValue]: "ERI",
          [IDX.sijoitus]: 1,
          [IDX.pupn]: "PN4",
          [IDX.sert]: "varaSERT",
          [IDX.sa]: "SA",
          [IDX.judge]: "Laakso Jari",
          [IDX.critiqueText]: "Hyvä rungonpituus.",
        }),
      ],
      [
        "Rekisteri numero",
        "Aika",
        "Paikka kunta",
        "Paikka",
        "Näyttely tyyppi",
        "Nimi",
        "Luokka",
        "Laatu arvostelu",
        "Sijoitus",
        "PU/PN",
        "SERT",
        "CACIB",
        "SA",
        "Tuomari",
        "Arvostelu",
      ],
    );

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(1);
    expect(result.body.data.errorCount).toBe(0);
    expect(result.body.data.schema.missingStructuralFields).toHaveLength(0);
    expect(result.body.data.schema.blockedColumns).toHaveLength(0);
  });

  it("treats Rotukoodi as explicitly ignored by policy", async () => {
    const headers = [...SUPPORTED_HEADERS];
    headers.splice(6, 0, "Rotukoodi");

    const row = createRow(
      {
        0: "FI16175/23",
        1: new Date("2025-01-10T21:59:11.000Z"),
        2: "Kajaani",
        3: "Kajaanin Pallohalli",
        4: "Kansainvälinen näyttely",
        5: "CARDIEM KIND REGARDS",
        6: "161",
        7: "AVO",
        8: "ERI",
        9: 1,
        10: "PN4",
        13: "SA",
      },
      headers.length,
    );

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: buildWorkbookBuffer([row], headers),
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(1);
    expect(result.body.data.schema.coverage).toEqual({
      totalWorkbookColumns: 16,
      importedColumnCount: 15,
      ignoredColumnCount: 1,
      blockedColumnCount: 0,
    });
    expect(result.body.data.schema.ignoredColumns).toEqual([
      expect.objectContaining({
        headerName: "Rotukoodi",
        ruleCode: "BREED_CODE",
      }),
    ]);
    expect(result.body.data.schema.blockedColumns).toEqual([]);
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_COLUMN_IGNORED",
          severity: "INFO",
          columnName: "Rotukoodi",
        }),
      ]),
    );
  });

  it("rejects structural class values that are not defined in the database", async () => {
    const workbook = buildWorkbookBuffer([
      createRow({
        [IDX.registrationNo]: "FI16175/23",
        [IDX.eventDate]: new Date("2025-01-11T00:00:00.000Z"),
        [IDX.eventCity]: "Kajaani",
        [IDX.eventPlace]: "Kajaanin Pallohalli",
        [IDX.eventType]: "Kansainvälinen näyttely",
        [IDX.dogName]: "CARDIEM KIND REGARDS",
        [IDX.classValue]: "JU",
        [IDX.qualityValue]: "ERI",
        [IDX.judge]: "Laakso Jari",
      }),
    ]);

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(0);
    expect(result.body.data.rejectedRowCount).toBe(1);
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_INVALID_RESULT_VALUE",
          severity: "ERROR",
          columnName: "Luokka",
          message: "Unsupported class value: JU.",
          registrationNo: "FI16175/23",
        }),
      ]),
    );
  });

  it("adds only one missing-value error for required class column", async () => {
    const workbook = buildWorkbookBuffer([
      createRow({
        [IDX.registrationNo]: "FI16175/23",
        [IDX.eventDate]: new Date("2025-01-11T00:00:00.000Z"),
        [IDX.eventCity]: "Kajaani",
        [IDX.eventPlace]: "Kajaanin Pallohalli",
        [IDX.eventType]: "Kansainvälinen näyttely",
        [IDX.dogName]: "CARDIEM KIND REGARDS",
        [IDX.classValue]: null,
        [IDX.qualityValue]: "ERI",
        [IDX.judge]: "Laakso Jari",
      }),
    ]);

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    const classMissingIssues = result.body.data.issues.filter(
      (issue) =>
        issue.code === "SHOW_WORKBOOK_MISSING_COLUMNS" &&
        issue.columnName === "Luokka" &&
        issue.message === "Luokka is required.",
    );
    expect(classMissingIssues).toHaveLength(1);
  });

  it("uses metadata rowValueRequired for optional structural fields at runtime", async () => {
    showWorkbookColumnRuleFindManyMock.mockResolvedValue(
      buildDefaultColumnRules().map((rule) =>
        rule.code === "JUDGE" ? { ...rule, rowValueRequired: true } : rule,
      ),
    );

    const workbook = buildWorkbookBuffer([
      createRow({
        [IDX.registrationNo]: "FI16175/23",
        [IDX.eventDate]: new Date("2025-01-11T00:00:00.000Z"),
        [IDX.eventCity]: "Kajaani",
        [IDX.eventPlace]: "Kajaanin Pallohalli",
        [IDX.eventType]: "Kansainvälinen näyttely",
        [IDX.dogName]: "CARDIEM KIND REGARDS",
        [IDX.classValue]: "AVO",
        [IDX.qualityValue]: "ERI",
      }),
    ]);

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(0);
    expect(result.body.data.rejectedRowCount).toBe(1);
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_MISSING_COLUMNS",
          severity: "ERROR",
          columnName: "Tuomari",
          message: "Tuomari is required.",
        }),
      ]),
    );
  });

  it("respects class and quality metadata when they are optional and non-definition-backed", async () => {
    showWorkbookColumnRuleFindManyMock.mockResolvedValue(
      buildDefaultColumnRules().map((rule) => {
        if (rule.code === "CLASS_VALUE" || rule.code === "QUALITY_VALUE") {
          return {
            ...rule,
            parseMode: "TEXT",
            destinationKind: "SHOW_ENTRY",
            allowedDefinitionCategoryCode: null,
            rowValueRequired: false,
          };
        }
        return rule;
      }),
    );

    const workbook = buildWorkbookBuffer([
      createRow({
        [IDX.registrationNo]: "FI16175/23",
        [IDX.eventDate]: new Date("2025-01-11T00:00:00.000Z"),
        [IDX.eventCity]: "Kajaani",
        [IDX.eventPlace]: "Kajaanin Pallohalli",
        [IDX.eventType]: "Kansainvälinen näyttely",
        [IDX.dogName]: "CARDIEM KIND REGARDS",
        [IDX.classValue]: null,
        [IDX.qualityValue]: null,
        [IDX.judge]: "Laakso Jari",
      }),
    ]);

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(1);
    expect(result.body.data.rejectedRowCount).toBe(0);
    expect(result.body.data.issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_INVALID_RESULT_VALUE",
          columnName: "Luokka",
        }),
        expect.objectContaining({
          code: "SHOW_WORKBOOK_INVALID_RESULT_VALUE",
          columnName: "Laatuarvostelu",
        }),
      ]),
    );
  });

  it("scopes DEFINITION_FROM_CELL resolution to the rule category", async () => {
    const workbook = buildWorkbookBuffer([
      createRow({
        [IDX.registrationNo]: "FI16175/23",
        [IDX.eventDate]: new Date("2025-01-11T00:00:00.000Z"),
        [IDX.eventCity]: "Kajaani",
        [IDX.eventPlace]: "Kajaanin Pallohalli",
        [IDX.eventType]: "Kansainvälinen näyttely",
        [IDX.dogName]: "CARDIEM KIND REGARDS",
        [IDX.classValue]: "SERT",
        [IDX.qualityValue]: "ERI",
        [IDX.judge]: "Laakso Jari",
      }),
    ]);

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(0);
    expect(result.body.data.rejectedRowCount).toBe(1);
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_INVALID_RESULT_VALUE",
          severity: "ERROR",
          columnName: "Luokka",
          message: "Unsupported class value: SERT.",
        }),
      ]),
    );
  });

  it("blocks preview when the workbook contains an unsupported extra column", async () => {
    const headers = [...SUPPORTED_HEADERS, "TuntematonSarake"];
    const row = createRow(
      {
        [IDX.registrationNo]: "FI16175/23",
        [IDX.eventDate]: new Date("2025-01-10T21:59:11.000Z"),
        [IDX.eventCity]: "Kajaani",
        [IDX.eventPlace]: "Kajaanin Pallohalli",
        [IDX.eventType]: "Kansainvälinen näyttely",
        [IDX.dogName]: "CARDIEM KIND REGARDS",
        [IDX.classValue]: "AVO",
        [IDX.qualityValue]: "ERI",
        [SUPPORTED_HEADERS.length]: "extra value",
      },
      headers.length,
    );

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: buildWorkbookBuffer([row], headers),
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(0);
    expect(result.body.data.schema.blockedColumns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          headerName: "TuntematonSarake",
          reasonCode: "UNSUPPORTED_COLUMN",
        }),
      ]),
    );
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_UNSUPPORTED_COLUMN",
          severity: "ERROR",
          columnName: "TuntematonSarake",
        }),
      ]),
    );
  });

  it("blocks preview when a required structural column is missing", async () => {
    const headers = [
      "Rekisterinumero",
      "Aika",
      "Paikkakunta",
      "Paikka",
      "Nimi",
      "Luokka",
      "Laatuarvostelu",
    ];

    const workbook = buildWorkbookBuffer(
      [
        [
          "FI16175/23",
          new Date("2025-01-10T21:59:11.000Z"),
          "Kajaani",
          "Kajaanin Pallohalli",
          "CARDIEM KIND REGARDS",
          "AVO",
          "ERI",
        ],
      ],
      headers,
    );

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(0);
    expect(result.body.data.events).toHaveLength(0);
    expect(result.body.data.schema.missingStructuralFields).toEqual([
      expect.objectContaining({
        fieldKey: "eventType",
        expectedHeader: "Näyttelytyyppi",
      }),
    ]);
  });

  it("blocks preview when a required result column header is missing", async () => {
    showWorkbookColumnRuleFindManyMock.mockResolvedValue(
      buildDefaultColumnRules().map((rule) =>
        rule.code === "SA" ? { ...rule, headerRequired: true } : rule,
      ),
    );

    const headers = SUPPORTED_HEADERS.filter((header) => header !== "SA");
    const workbook = buildWorkbookBuffer(
      [
        createRow(
          {
            [IDX.registrationNo]: "FI16175/23",
            [IDX.eventDate]: new Date("2025-01-10T21:59:11.000Z"),
            [IDX.eventCity]: "Kajaani",
            [IDX.eventPlace]: "Kajaanin Pallohalli",
            [IDX.eventType]: "Kansainvälinen näyttely",
            [IDX.dogName]: "CARDIEM KIND REGARDS",
            [IDX.classValue]: "AVO",
            [IDX.qualityValue]: "ERI",
            [IDX.judge]: "Laakso Jari",
          },
          headers.length,
        ),
      ],
      headers,
    );

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(0);
    expect(result.body.data.schema.missingStructuralFields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fieldKey: "SA",
          expectedHeader: "SA",
        }),
      ]),
    );
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_REQUIRED_FIELD_MISSING",
          severity: "ERROR",
          columnName: "SA",
        }),
      ]),
    );
  });

  it("rejects rows when required result-item values are empty", async () => {
    showWorkbookColumnRuleFindManyMock.mockResolvedValue(
      buildDefaultColumnRules().map((rule) =>
        rule.code === "SA" ? { ...rule, rowValueRequired: true } : rule,
      ),
    );

    const workbook = buildWorkbookBuffer([
      createRow({
        [IDX.registrationNo]: "FI16175/23",
        [IDX.eventDate]: new Date("2025-01-10T21:59:11.000Z"),
        [IDX.eventCity]: "Kajaani",
        [IDX.eventPlace]: "Kajaanin Pallohalli",
        [IDX.eventType]: "Kansainvälinen näyttely",
        [IDX.dogName]: "CARDIEM KIND REGARDS",
        [IDX.classValue]: "AVO",
        [IDX.qualityValue]: "ERI",
        [IDX.sa]: null,
        [IDX.judge]: "Laakso Jari",
      }),
    ]);

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(0);
    expect(result.body.data.rejectedRowCount).toBe(1);
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_MISSING_COLUMNS",
          severity: "ERROR",
          columnName: "SA",
          message: "SA is required.",
        }),
      ]),
    );
    const saMissingIssues = result.body.data.issues.filter(
      (issue) =>
        issue.code === "SHOW_WORKBOOK_MISSING_COLUMNS" &&
        issue.columnName === "SA" &&
        issue.message === "SA is required.",
    );
    expect(saMissingIssues).toHaveLength(1);
  });

  it("blocks preview when a metadata-mapped definition is disabled", async () => {
    showResultDefinitionFindManyMock.mockResolvedValue([
      ...sharedDefinitions.filter((definition) => definition.code !== "SA"),
      {
        code: "SA",
        isEnabled: false,
        valueType: "FLAG" as const,
        category: { code: "SERTTIMERKINTA" },
      },
    ]);

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: buildWorkbookBuffer([
        createRow({
          [IDX.registrationNo]: "FI16175/23",
          [IDX.eventDate]: new Date("2025-01-10T21:59:11.000Z"),
          [IDX.eventCity]: "Kajaani",
          [IDX.eventPlace]: "Kajaanin Pallohalli",
          [IDX.eventType]: "Kansainvälinen näyttely",
          [IDX.dogName]: "CARDIEM KIND REGARDS",
          [IDX.classValue]: "AVO",
          [IDX.qualityValue]: "ERI",
          [IDX.sa]: "SA",
        }),
      ]),
    });

    expect(result).toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Definition SA is disabled.",
        code: "SHOW_WORKBOOK_SCHEMA_INVALID",
      },
    });
  });

  it("fails with a server error when workbook metadata is invalid", async () => {
    showWorkbookColumnRuleFindManyMock.mockResolvedValue([
      createColumnRule({
        code: "CLASS_VALUE",
        headerName: "Luokka",
        destinationKind: "SHOW_RESULT_ITEM",
        targetField: "CLASS_VALUE",
        parseMode: "DEFINITION_FROM_CELL",
        allowedDefinitionCategoryCode: null,
        headerRequired: true,
        rowValueRequired: true,
      }),
    ]);

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: buildWorkbookBuffer([]),
    });

    expect(result).toEqual({
      status: 500,
      body: {
        ok: false,
        error:
          "DEFINITION_FROM_CELL rules must define an allowed definition category.",
        code: "SHOW_WORKBOOK_SCHEMA_INVALID",
      },
    });
  });

  it("blocks preview when the workbook contains a duplicate non-empty header", async () => {
    const workbook = buildWorkbookBuffer(
      [],
      [
        "Rekisterinumero",
        "Rekisterinumero",
        "Paikkakunta",
        "Paikka",
        "Näyttelytyyppi",
        "Nimi",
        "Luokka",
        "Laatuarvostelu",
      ],
    );

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.schema.blockedColumns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          headerName: "Rekisterinumero",
          reasonCode: "DUPLICATE_HEADER",
        }),
      ]),
    );
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_DUPLICATE_HEADER",
          columnName: "Rekisterinumero",
        }),
      ]),
    );
  });

  it("blocks preview when an unnamed column contains data", async () => {
    const workbook = buildWorkbookBuffer(
      [
        [
          "FI16175/23",
          new Date("2025-01-10T21:59:11.000Z"),
          "Kajaani",
          "Kajaanin Pallohalli",
          "Kansainvälinen näyttely",
          "CARDIEM KIND REGARDS",
          "AVO",
          "ERI",
          "has data",
        ],
      ],
      [
        "Rekisterinumero",
        "Aika",
        "Paikkakunta",
        "Paikka",
        "Näyttelytyyppi",
        "Nimi",
        "Luokka",
        "Laatuarvostelu",
        null,
      ],
    );

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook,
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.schema.blockedColumns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          reasonCode: "UNNAMED_COLUMN_WITH_DATA",
        }),
      ]),
    );
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_UNNAMED_COLUMN_WITH_DATA",
          severity: "ERROR",
        }),
      ]),
    );
  });

  it("fails with a server error when workbook column metadata seed is missing", async () => {
    showWorkbookColumnRuleFindManyMock.mockResolvedValue([]);

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: buildWorkbookBuffer([]),
    });

    expect(result).toEqual({
      status: 500,
      body: {
        ok: false,
        error: "Show workbook import schema is missing; run the seed first.",
        code: "SHOW_WORKBOOK_SCHEMA_MISSING",
      },
    });
  });
});
