import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { parseFinnishKennelClubWorkbook } from "../parse-finnish-kennel-club-workbook";

const headers = [
  "Rekisterinumero",
  "Kennel",
  "Nimi",
  "Rotukoodi",
  "Sukupuoli",
  "Syntymäaika",
  "Rekisteröity",
  "Alkuperä",
  "Alkuperämaa",
  "Väri",
  "Häntä",
  "Rekisterinumero isä",
  "Rekisterinumero emä",
];

function workbook(rows: unknown[][], date1904 = false): Buffer {
  const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Koirat");
  if (date1904) book.Workbook = { WBProps: { date1904: true } };
  return XLSX.write(book, { type: "buffer", bookType: "xlsx" });
}

function writeBook(...sheets: XLSX.WorkSheet[]): Buffer {
  const book = XLSX.utils.book_new();
  sheets.forEach((sheet, index) =>
    XLSX.utils.book_append_sheet(
      book,
      sheet,
      index === 0 ? "Koirat" : `Extra${index}`,
    ),
  );
  return XLSX.write(book, { type: "buffer", bookType: "xlsx" });
}

const validRow = [
  "fi123/24",
  "Kennel",
  "  Beagle  ",
  161,
  "NARTTU",
  45292,
  45293,
  "Suomi",
  "FI",
  "punainen",
  null,
  "FI1/20",
  "FI2/20",
];

describe("parseFinnishKennelClubWorkbook", () => {
  it("normalizes a Finnish source row and Excel dates", () => {
    const result = parseFinnishKennelClubWorkbook(workbook([validRow]));

    expect(result.sheetName).toBe("Koirat");
    expect(result.date1904).toBe(false);
    expect(result.rows[0]).toMatchObject({
      source: "FINNISH_KENNEL_CLUB",
      sourceRowNumber: 2,
      registrationNo: "FI123/24",
      name: "Beagle",
      sex: "FEMALE",
      birthDate: "2024-01-01",
      registeredOn: "2024-01-02",
      sireRegistrationNo: "FI1/20",
      damRegistrationNo: "FI2/20",
    });
    expect(result.facts).toEqual([]);
  });

  it("accepts textual breed and Finnish male sex", () => {
    const result = parseFinnishKennelClubWorkbook(
      workbook([
        [...validRow.slice(0, 3), "161", "uros", ...validRow.slice(5)],
      ]),
    );

    expect(result.rows[0]?.sex).toBe("MALE");
    expect(result.facts).toEqual([]);
  });

  it("reports missing, duplicate, unnamed, and unsupported populated headers", () => {
    const row = validRow.slice();
    const result = parseFinnishKennelClubWorkbook(workbook([row]));
    const sheet = XLSX.utils.aoa_to_sheet([
      headers
        .filter((header) => header !== "Kennel")
        .concat(["Lisätieto", "Lisätieto"]),
      row.filter((_, index) => index !== 1).concat(["x", "y"]),
    ]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Koirat");
    const parsed = parseFinnishKennelClubWorkbook(
      XLSX.write(book, { type: "buffer", bookType: "xlsx" }),
    );

    expect(result.facts).toEqual([]);
    expect(parsed.facts.map((fact) => fact.code)).toEqual([
      "UNSUPPORTED_COLUMN_IGNORED",
      "DUPLICATE_COLUMN",
      "OPTIONAL_COLUMN_MISSING",
    ]);

    const unnamedSheet = XLSX.utils.aoa_to_sheet([
      [...headers, null],
      [...validRow, "value"],
    ]);
    const unnamedBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(unnamedBook, unnamedSheet, "Koirat");
    expect(
      parseFinnishKennelClubWorkbook(
        XLSX.write(unnamedBook, { type: "buffer", bookType: "xlsx" }),
      ).facts,
    ).toContainEqual(
      expect.objectContaining({ code: "UNNAMED_COLUMN_WITH_DATA" }),
    );
  });

  it("ignores formatting-only extended ranges and reads the 1904 date system", () => {
    const sheet = XLSX.utils.aoa_to_sheet([headers, validRow]);
    sheet["!ref"] = "A1:M1000";
    sheet["M1000"] = { s: 1 };
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Koirat");
    book.Workbook = { WBProps: { date1904: true } };
    const result = parseFinnishKennelClubWorkbook(
      XLSX.write(book, { type: "buffer", bookType: "xlsx" }),
    );

    expect(result.sourceRowCount).toBe(1);
    expect(result.date1904).toBe(true);
    expect(result.rows[0]?.birthDate).toBe("2028-01-02");
  });

  it("records source facts for non-Beagle and invalid sex rows", () => {
    const result = parseFinnishKennelClubWorkbook(
      workbook([[...validRow.slice(0, 3), "999", "muu", ...validRow.slice(5)]]),
    );

    expect(result.facts.map((fact) => fact.code)).toEqual([
      "BREED_NOT_BEAGLE",
      "DOG_SEX_INVALID",
    ]);
  });

  it("blocks empty, unreadable, and source-limit workbooks", () => {
    const emptyBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      emptyBook,
      XLSX.utils.aoa_to_sheet([headers]),
      "Koirat",
    );
    expect(
      parseFinnishKennelClubWorkbook(
        XLSX.write(emptyBook, { type: "buffer", bookType: "xlsx" }),
      ).facts,
    ).toContainEqual(
      expect.objectContaining({ code: "SOURCE_FILE_UNREADABLE" }),
    );
    expect(
      parseFinnishKennelClubWorkbook(Buffer.from("not an xlsx")).facts,
    ).toContainEqual(
      expect.objectContaining({ code: "SOURCE_FILE_UNREADABLE" }),
    );

    const tooManyRows = Array.from({ length: 10_001 }, () => validRow);
    const result = parseFinnishKennelClubWorkbook(workbook(tooManyRows));
    expect(result.rows).toEqual([]);
    expect(result.facts).toContainEqual(
      expect.objectContaining({ code: "SOURCE_RESOURCE_LIMIT_EXCEEDED" }),
    );
  });

  it("limits columns and populated cells and warns about additional sheets", () => {
    const wide = XLSX.utils.aoa_to_sheet([
      [
        ...headers,
        ...Array.from({ length: 52 }, (_, index) => `Extra ${index}`),
      ],
      [...validRow, ...Array.from({ length: 52 }, () => "x")],
    ]);
    const parsedWide = parseFinnishKennelClubWorkbook(
      writeBook(wide, XLSX.utils.aoa_to_sheet([headers])),
    );
    expect(parsedWide.facts.map((fact) => fact.code)).toContain(
      "SOURCE_RESOURCE_LIMIT_EXCEEDED",
    );
    expect(parsedWide.facts.map((fact) => fact.code)).toContain(
      "ADDITIONAL_SHEETS_IGNORED",
    );

    const manyCells: XLSX.WorkSheet = {
      A1: { v: "x" },
      "!ref": "A1:A100001",
    };
    for (let row = 2; row <= 100_001; row += 1)
      manyCells[`A${row}`] = { v: "x" };
    const parsedCells = parseFinnishKennelClubWorkbook(writeBook(manyCells));
    expect(parsedCells.facts).toContainEqual(
      expect.objectContaining({ code: "SOURCE_RESOURCE_LIMIT_EXCEEDED" }),
    );
  });

  it("accepts only valid ISO calendar dates in text cells", () => {
    const result = parseFinnishKennelClubWorkbook(
      workbook([
        [
          ...validRow.slice(0, 5),
          "2024-02-30",
          "2024-01-02",
          ...validRow.slice(7),
        ],
      ]),
    );
    expect(result.rows[0]?.birthDate).toBeNull();
    expect(result.rows[0]?.registeredOn).toBe("2024-01-02");
    expect(result.facts).toContainEqual(
      expect.objectContaining({ code: "INVALID_DATE", header: "Syntymäaika" }),
    );
  });
});
