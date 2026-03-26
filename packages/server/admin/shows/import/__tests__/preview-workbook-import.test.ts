import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";
import { previewAdminShowWorkbookImport } from "../preview-workbook-import";

const { dogRegistrationFindManyMock, showResultDefinitionFindManyMock } =
  vi.hoisted(() => ({
    dogRegistrationFindManyMock: vi.fn(),
    showResultDefinitionFindManyMock: vi.fn(),
  }));

vi.mock("@beagle/db", () => ({
  prisma: {
    dogRegistration: {
      findMany: dogRegistrationFindManyMock,
    },
    showResultDefinition: {
      findMany: showResultDefinitionFindManyMock,
    },
  },
}));

const SUPPORTED_HEADERS: unknown[] = [
  "Rekisterinumero",
  null,
  null,
  "Aika",
  null,
  "Paikkakunta",
  "Paikka",
  "Näyttelytyyppi",
  null,
  "Nimi",
  "Luokka",
  "Laatuarvostelu",
  "Sijoitus",
  "PuPn",
  "ROP",
  "SERT",
  "NORD-SERT",
  "JUN-SERT",
  "VET-SERT",
  "MVA",
  "JMVA",
  "VMVA",
  "CACIB",
  "CACIB-J",
  "CACIB-V",
  "VET-ROP",
  "JUN-ROP",
  "SA",
  "KP",
  "Tuomari",
  "Arvostelu",
];

const WITH_ROTUKOODI_HEADERS: unknown[] = [
  "Rekisterinumero",
  null,
  null,
  "Aika",
  null,
  "Paikkakunta",
  "Paikka",
  "Näyttelytyyppi",
  null,
  "Nimi",
  "Rotukoodi",
  "Luokka",
  "Laatuarvostelu",
  "Sijoitus",
  "PuPn",
  "ROP",
  "SERT",
  "NORD-SERT",
  "JUN-SERT",
  "VET-SERT",
  "MVA",
  "JMVA",
  "VMVA",
  "CACIB",
  "CACIB-J",
  "CACIB-V",
  "VET-ROP",
  "JUN-ROP",
  "SA",
  "KP",
  "Tuomari",
  "Arvostelu",
];

const IDX = {
  registrationNo: 0,
  eventDate: 3,
  eventCity: 5,
  eventPlace: 6,
  eventType: 7,
  dogName: 9,
  classValue: 10,
  qualityValue: 11,
  sijoitus: 12,
  pupn: 13,
  rop: 14,
  sert: 15,
  nordSert: 16,
  junSert: 17,
  vetSert: 18,
  mva: 19,
  jmva: 20,
  vmva: 21,
  cacib: 22,
  cacibJ: 23,
  cacibV: 24,
  vetRop: 25,
  junRop: 26,
  sa: 27,
  kp: 28,
  judge: 29,
  critiqueText: 30,
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
  "PEN",
  "JUN",
  "NUO",
  "AVO",
  "KÄY",
  "VAL",
  "VET",
  "ERI",
  "EH",
  "H",
  "T",
  "EVA",
  "HYL",
  "ROP",
  "VSP",
  "SA",
  "KP",
  "SERT",
  "varaSERT",
  "NORD-SERT",
  "NORD-varaSERT",
  "JUN-SERT",
  "VET-SERT",
  "MVA",
  "JMVA",
  "VMVA",
  "CACIB",
  "varaCACIB",
  "CACIB-J",
  "CACIB-V",
  "VET-ROP",
  "VET-VSP",
  "JUN-ROP",
  "JUN-VSP",
].map((code) => ({ code, isEnabled: true, valueType: "FLAG" as const }));

const numericDefinitions = [
  { code: "SIJOITUS", isEnabled: true, valueType: "NUMERIC" as const },
  { code: "PUPN", isEnabled: true, valueType: "CODE" as const },
];

describe("previewAdminShowWorkbookImport", () => {
  beforeEach(() => {
    dogRegistrationFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockReset();

    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI16175/23", dogId: "dog_1" },
    ]);
    showResultDefinitionFindManyMock.mockResolvedValue([
      ...sharedDefinitions,
      ...numericDefinitions,
    ]);
  });

  it("parses a workbook preview when all workbook columns have persisted destinations", async () => {
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
      totalWorkbookColumns: 27,
      importedColumnCount: 27,
      blockedColumnCount: 0,
    });
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

  it("accepts headers that only differ by whitespace or punctuation", async () => {
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
        null,
        null,
        "Aika",
        null,
        "Paikka kunta",
        "Paikka",
        "Näyttely tyyppi",
        null,
        "Nimi",
        "Luokka",
        "Laatu arvostelu",
        "Sijoitus",
        "PU/PN",
        "ROP",
        "SERT",
        "NORD SERT",
        "JUN SERT",
        "VET SERT",
        "MVA",
        "JMVA",
        "VMVA",
        "CACIB",
        "CACIB J",
        "CACIB V",
        "VET ROP",
        "JUN ROP",
        "SA",
        "KP",
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

  it("rejects unsupported result values", async () => {
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
        [IDX.sijoitus]: 1,
        [IDX.pupn]: "PN4",
        [IDX.sert]: "bogus",
        [IDX.cacib]: "varaCACIB",
        [IDX.sa]: "SA",
        [IDX.judge]: "Laakso Jari",
        [IDX.critiqueText]: "Nice dog",
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
    expect(result.body.data.errorCount).toBeGreaterThan(0);
    expect(result.body.data.events).toHaveLength(1);
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_INVALID_RESULT_VALUE",
          severity: "ERROR",
          columnName: "SERT",
          registrationNo: "FI16175/23",
        }),
      ]),
    );
  });

  it("rejects structural class aliases that are not present in the workbook contract", async () => {
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

  it("imports a new workbook result column when the header matches a seeded definition", async () => {
    showResultDefinitionFindManyMock.mockResolvedValue([
      ...sharedDefinitions,
      ...numericDefinitions,
      { code: "NEW-FLAG", isEnabled: true, valueType: "FLAG" as const },
    ]);

    const headers = [...SUPPORTED_HEADERS, "NEW-FLAG"];
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
        [SUPPORTED_HEADERS.length]: "NEW-FLAG",
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
    expect(result.body.data.schema.definitionColumns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          headerName: "NEW-FLAG",
          definitionCodes: ["NEW-FLAG"],
          importMode: "DIRECT",
          enabled: true,
          supported: true,
        }),
      ]),
    );
    expect(result.body.data.events[0]?.entries[0]?.resultItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          columnName: "NEW-FLAG",
          definitionCode: "NEW-FLAG",
        }),
      ]),
    );
  });

  it("blocks preview when a required structural column is missing", async () => {
    const headers = [
      "Rekisterinumero",
      null,
      null,
      "Aika",
      null,
      "Paikkakunta",
      "Paikka",
      null,
      null,
      "Nimi",
      "Luokka",
      "Laatuarvostelu",
    ];
    const workbook = buildWorkbookBuffer(
      [
        [
          "FI16175/23",
          null,
          null,
          new Date("2025-01-10T21:59:11.000Z"),
          null,
          "Kajaani",
          "Kajaanin Pallohalli",
          null,
          null,
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

  it("blocks workbook columns that have no persisted destination", async () => {
    const row = createRow(
      {
        [0]: "FI16175/23",
        [3]: new Date("2025-01-10T21:59:11.000Z"),
        [5]: "Kajaani",
        [6]: "Kajaanin Pallohalli",
        [7]: "Kansainvälinen näyttely",
        [9]: "CARDIEM KIND REGARDS",
        [10]: "161",
        [11]: "AVO",
        [12]: "ERI",
      },
      WITH_ROTUKOODI_HEADERS.length,
    );

    const result = await previewAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: buildWorkbookBuffer([row], WITH_ROTUKOODI_HEADERS),
    });

    expect(result.status).toBe(200);
    if (!result.body.ok) {
      throw new Error("Expected a successful preview response");
    }

    expect(result.body.data.acceptedRowCount).toBe(0);
    expect(result.body.data.schema.blockedColumns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          headerName: "Rotukoodi",
          reasonCode: "UNSUPPORTED_COLUMN",
        }),
      ]),
    );
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_UNSUPPORTED_COLUMN",
          severity: "ERROR",
          columnName: "Rotukoodi",
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

  it("blocks preview when a matched definition column is disabled", async () => {
    showResultDefinitionFindManyMock.mockResolvedValue([
      ...sharedDefinitions,
      ...numericDefinitions,
      { code: "DISABLED-FLAG", isEnabled: false, valueType: "FLAG" as const },
    ]);

    const headers = [...SUPPORTED_HEADERS, "DISABLED-FLAG"];
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
        [SUPPORTED_HEADERS.length]: "DISABLED-FLAG",
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
          headerName: "DISABLED-FLAG",
          reasonCode: "DISABLED_DEFINITION",
        }),
      ]),
    );
    expect(result.body.data.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "SHOW_WORKBOOK_DEFINITION_NOT_FOUND",
          columnName: "DISABLED-FLAG",
          severity: "ERROR",
        }),
      ]),
    );
  });

  it("blocks preview when the workbook contains a duplicate non-empty header", async () => {
    const workbook = buildWorkbookBuffer(
      [],
      [
        "Rekisterinumero",
        "Rekisterinumero",
        null,
        "Aika",
        null,
        "Paikkakunta",
        "Paikka",
        "Näyttelytyyppi",
        null,
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
          null,
          null,
          new Date("2025-01-10T21:59:11.000Z"),
          null,
          "Kajaani",
          "Kajaanin Pallohalli",
          "Kansainvälinen näyttely",
          null,
          "CARDIEM KIND REGARDS",
          "AVO",
          "ERI",
          "has data",
        ],
      ],
      [
        "Rekisterinumero",
        null,
        null,
        "Aika",
        null,
        "Paikkakunta",
        "Paikka",
        "Näyttelytyyppi",
        null,
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
});
