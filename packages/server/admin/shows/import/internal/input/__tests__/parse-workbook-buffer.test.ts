import { describe, expect, it, vi, beforeEach } from "vitest";
import { parseWorkbookBuffer } from "../parse-workbook-buffer";

const { readMock, sheetToJsonMock } = vi.hoisted(() => ({
  readMock: vi.fn(),
  sheetToJsonMock: vi.fn(),
}));

vi.mock("xlsx", () => ({
  __esModule: true,
  read: readMock,
  utils: {
    sheet_to_json: sheetToJsonMock,
  },
}));

describe("parseWorkbookBuffer", () => {
  beforeEach(() => {
    readMock.mockReset();
    sheetToJsonMock.mockReset();
  });

  it("parses the first sheet and filters out empty rows", () => {
    readMock.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: {
        Sheet1: { name: "Sheet1" },
      },
    });
    sheetToJsonMock.mockReturnValue([
      ["Rekisterinumero", "Aika"],
      ["FI12345/24", "2025-05-01"],
      [null, null],
      ["FI54321/24", ""],
    ]);

    expect(parseWorkbookBuffer(Buffer.from("workbook"))).toEqual({
      sheetName: "Sheet1",
      headers: ["Rekisterinumero", "Aika"],
      rows: [
        ["FI12345/24", "2025-05-01"],
        ["FI54321/24", ""],
      ],
    });

    expect(readMock).toHaveBeenCalledWith(Buffer.from("workbook"), {
      type: "buffer",
      cellDates: true,
    });
  });

  it("throws when the workbook does not contain any sheets", () => {
    readMock.mockReturnValue({
      SheetNames: [],
      Sheets: {},
    });

    expect(() => parseWorkbookBuffer(Buffer.from("workbook"))).toThrow(
      "Workbook does not contain any sheets.",
    );
  });

  it("throws when the first sheet is missing", () => {
    readMock.mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: {},
    });

    expect(() => parseWorkbookBuffer(Buffer.from("workbook"))).toThrow(
      "Workbook sheet is missing.",
    );
  });
});
