import * as XLSX from "xlsx";
import {
  isValidRegistrationNo,
  normalizeRegistrationNo,
} from "@server/dogs/core/registration";
import {
  DOG_IMPORT_SOURCE,
  type CanonicalDogImportRow,
} from "@server/admin/dogs/import/internal/model/canonical-dog-import";

const REQUIRED_HEADERS = [
  "Rekisterinumero",
  "Nimi",
  "Rotukoodi",
  "Sukupuoli",
  "Syntymäaika",
  "Alkuperä",
  "Rekisterinumero isä",
  "Rekisterinumero emä",
] as const;

const OPTIONAL_HEADERS = [
  "Kennel",
  "Rekisteröity",
  "Alkuperämaa",
  "Väri",
  "Häntä",
] as const;

const KNOWN_HEADERS = new Set<string>([
  ...REQUIRED_HEADERS.map((header) => headerKey(header)!).filter(Boolean),
  ...OPTIONAL_HEADERS.map((header) => headerKey(header)!).filter(Boolean),
]);

type Cell = string | number | boolean | Date | null | undefined;

const MAX_SOURCE_ROWS = 10_000;
const MAX_COLUMNS = 64;
const MAX_POPULATED_CELLS = 100_000;

export type FinnishWorkbookFact = {
  code:
    | "REQUIRED_COLUMN_MISSING"
    | "OPTIONAL_COLUMN_MISSING"
    | "DUPLICATE_COLUMN"
    | "UNNAMED_COLUMN_WITH_DATA"
    | "UNSUPPORTED_COLUMN_IGNORED"
    | "REQUIRED_VALUE_MISSING"
    | "BREED_NOT_BEAGLE"
    | "DOG_SEX_INVALID"
    | "INVALID_DATE"
    | "SOURCE_FILE_UNREADABLE"
    | "SOURCE_RESOURCE_LIMIT_EXCEEDED"
    | "ADDITIONAL_SHEETS_IGNORED";
  header: string | null;
  columnIndex: number | null;
  sourceRowNumber?: number;
};

export type FinnishWorkbookParseResult = {
  sheetName: string;
  date1904: boolean;
  rows: CanonicalDogImportRow[];
  sourceRowCount: number;
  facts: FinnishWorkbookFact[];
};

function text(value: Cell): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  const normalized = String(value).trim();
  return normalized || null;
}

function headerKey(value: Cell): string | null {
  const valueText = text(value);
  return valueText
    ? valueText.replace(/\s+/gu, " ").toLocaleLowerCase("fi-FI")
    : null;
}

function excelDate(value: Cell, date1904: boolean): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : value.toISOString().slice(0, 10);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const wholeDays = Math.floor(value);
    if (!date1904 && wholeDays === 60) return null;
    const adjustedDays = date1904 || wholeDays < 60 ? wholeDays : wholeDays - 1;
    const base = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, 31);
    const date = new Date(base + adjustedDays * 86400000);
    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString().slice(0, 10);
  }
  const valueText = text(value);
  if (!valueText) return null;
  return isValidIsoDate(valueText) ? valueText : null;
}

function isValidIsoDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function registration(value: Cell): string | null {
  const normalized = normalizeRegistrationNo(text(value));
  return normalized && isValidRegistrationNo(normalized) ? normalized : null;
}

function sex(value: Cell): CanonicalDogImportRow["sex"] {
  const normalized = text(value)?.toLocaleLowerCase("fi-FI");
  if (normalized === "uros") return "MALE";
  if (normalized === "narttu") return "FEMALE";
  return null;
}

function valueAt(
  row: Cell[],
  indexes: Map<string, number>,
  header: string,
): Cell {
  const key = headerKey(header);
  const columnIndex = key === null ? -1 : (indexes.get(key) ?? -1);
  return row[columnIndex];
}

function populatedCell(cell: unknown): cell is { v?: Cell; f?: string } {
  return (
    typeof cell === "object" &&
    cell !== null &&
    (("v" in cell && (cell as { v?: Cell }).v !== undefined) ||
      ("f" in cell && typeof (cell as { f?: string }).f === "string"))
  );
}

/** Parses the first Finnish registry sheet without trusting its inflated !ref. */
export function parseFinnishKennelClubWorkbook(
  buffer: Buffer | Uint8Array | ArrayBuffer,
): FinnishWorkbookParseResult {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: false });
  } catch {
    return {
      sheetName: "",
      date1904: false,
      rows: [],
      sourceRowCount: 0,
      facts: [
        { code: "SOURCE_FILE_UNREADABLE", header: null, columnIndex: null },
      ],
    };
  }
  const sheetName = workbook.SheetNames[0];
  if (!sheetName)
    return {
      sheetName: "",
      date1904: false,
      rows: [],
      sourceRowCount: 0,
      facts: [
        { code: "SOURCE_FILE_UNREADABLE", header: null, columnIndex: null },
      ],
    };
  const sheet = workbook.Sheets[sheetName];
  if (!sheet)
    return {
      sheetName,
      date1904: false,
      rows: [],
      sourceRowCount: 0,
      facts: [
        { code: "SOURCE_FILE_UNREADABLE", header: null, columnIndex: null },
      ],
    };

  const populated = Object.entries(sheet).filter(([, cell]) =>
    populatedCell(cell),
  );
  const coordinates = populated
    .map(([address]) => XLSX.utils.decode_cell(address))
    .filter((coordinate) => coordinate.r >= 0 && coordinate.c >= 0);
  const sourceRows = new Set(
    coordinates.filter(({ r }) => r > 0).map(({ r }) => r),
  );
  const maxRow = coordinates.reduce((max, { r }) => Math.max(max, r), 0);
  const maxColumn = coordinates.reduce((max, { c }) => Math.max(max, c), 0);
  const date1904 = workbook.Workbook?.WBProps?.date1904 === true;
  const limitFact =
    sourceRows.size > MAX_SOURCE_ROWS ||
    maxColumn + 1 > MAX_COLUMNS ||
    populated.length > MAX_POPULATED_CELLS;
  const facts: FinnishWorkbookFact[] = [];
  if (workbook.SheetNames.length > 1)
    facts.push({
      code: "ADDITIONAL_SHEETS_IGNORED",
      header: null,
      columnIndex: null,
    });
  if (limitFact)
    return {
      sheetName,
      date1904,
      rows: [],
      sourceRowCount: 0,
      facts: [
        ...facts,
        {
          code: "SOURCE_RESOURCE_LIMIT_EXCEEDED",
          header: null,
          columnIndex: null,
        },
      ],
    };
  if (sourceRows.size === 0)
    return {
      sheetName,
      date1904,
      rows: [],
      sourceRowCount: 0,
      facts: [
        ...facts,
        { code: "SOURCE_FILE_UNREADABLE", header: null, columnIndex: null },
      ],
    };
  const matrix = Array.from({ length: maxRow + 1 }, (_, row) =>
    Array.from({ length: maxColumn + 1 }, (_, column) => {
      const cell = sheet[XLSX.utils.encode_cell({ r: row, c: column })];
      return populatedCell(cell) ? (cell.v ?? null) : null;
    }),
  ) as Cell[][];

  const headers = matrix[0] ?? [];
  const indexes = new Map<string, number>();
  headers.forEach((value, columnIndex) => {
    const key = headerKey(value);
    const header = text(value);
    const hasData = matrix
      .slice(1)
      .some((row) => text(row[columnIndex]) !== null);
    if (!key) {
      if (hasData)
        facts.push({
          code: "UNNAMED_COLUMN_WITH_DATA",
          header: null,
          columnIndex,
        });
      return;
    }
    if (indexes.has(key)) {
      facts.push({ code: "DUPLICATE_COLUMN", header, columnIndex });
      return;
    }
    indexes.set(key, columnIndex);
    if (!KNOWN_HEADERS.has(key)) {
      facts.push({ code: "UNSUPPORTED_COLUMN_IGNORED", header, columnIndex });
    }
  });
  for (const header of REQUIRED_HEADERS) {
    if (!indexes.has(headerKey(header)!))
      facts.push({
        code: "REQUIRED_COLUMN_MISSING",
        header,
        columnIndex: null,
      });
  }
  for (const header of OPTIONAL_HEADERS) {
    if (!indexes.has(headerKey(header)!))
      facts.push({
        code: "OPTIONAL_COLUMN_MISSING",
        header,
        columnIndex: null,
      });
  }

  const rows = matrix.slice(1).flatMap((row, index) => {
    if (!row.some((cell) => text(cell) !== null)) return [];
    const sourceRowNumber = index + 2;
    const breed = text(valueAt(row, indexes, "Rotukoodi"));
    const sourceSex = text(valueAt(row, indexes, "Sukupuoli"));
    const sourceDate = valueAt(row, indexes, "Syntymäaika");
    const sourceRegisteredOn = valueAt(row, indexes, "Rekisteröity");
    const parsedBirthDate = excelDate(sourceDate, date1904);
    const parsedRegisteredOn = excelDate(sourceRegisteredOn, date1904);
    for (const [header, value] of [
      ["Rekisterinumero", valueAt(row, indexes, "Rekisterinumero")],
      ["Nimi", valueAt(row, indexes, "Nimi")],
      ["Alkuperä", valueAt(row, indexes, "Alkuperä")],
      ["Rekisterinumero isä", valueAt(row, indexes, "Rekisterinumero isä")],
      ["Rekisterinumero emä", valueAt(row, indexes, "Rekisterinumero emä")],
    ] as const) {
      if (text(value) === null)
        facts.push({
          code: "REQUIRED_VALUE_MISSING",
          header,
          columnIndex: indexes.get(headerKey(header) ?? "") ?? null,
          sourceRowNumber,
        });
    }
    if (breed !== "161")
      facts.push({
        code: "BREED_NOT_BEAGLE",
        header: "Rotukoodi",
        columnIndex: indexes.get(headerKey("Rotukoodi") ?? "") ?? null,
        sourceRowNumber,
      });
    if (sourceSex !== null && sex(sourceSex) === null)
      facts.push({
        code: "DOG_SEX_INVALID",
        header: "Sukupuoli",
        columnIndex: indexes.get(headerKey("Sukupuoli") ?? "") ?? null,
        sourceRowNumber,
      });
    if (text(sourceDate) !== null && parsedBirthDate === null)
      facts.push({
        code: "INVALID_DATE",
        header: "Syntymäaika",
        columnIndex: indexes.get(headerKey("Syntymäaika") ?? "") ?? null,
        sourceRowNumber,
      });
    if (text(sourceRegisteredOn) !== null && parsedRegisteredOn === null)
      facts.push({
        code: "INVALID_DATE",
        header: "Rekisteröity",
        columnIndex: indexes.get(headerKey("Rekisteröity") ?? "") ?? null,
        sourceRowNumber,
      });
    return [
      {
        source: DOG_IMPORT_SOURCE,
        sourceRowNumber,
        registrationNo: registration(valueAt(row, indexes, "Rekisterinumero")),
        name: text(valueAt(row, indexes, "Nimi")),
        sex: sex(valueAt(row, indexes, "Sukupuoli")),
        birthDate: parsedBirthDate,
        registeredOn: parsedRegisteredOn,
        breederNameText: text(valueAt(row, indexes, "Kennel")),
        originTypeText: text(valueAt(row, indexes, "Alkuperä")),
        originCountryText: text(valueAt(row, indexes, "Alkuperämaa")),
        colorName: text(valueAt(row, indexes, "Väri")),
        tailText: text(valueAt(row, indexes, "Häntä")),
        sireRegistrationNo: registration(
          valueAt(row, indexes, "Rekisterinumero isä"),
        ),
        damRegistrationNo: registration(
          valueAt(row, indexes, "Rekisterinumero emä"),
        ),
      },
    ];
  });
  return { sheetName, date1904, rows, sourceRowCount: rows.length, facts };
}
