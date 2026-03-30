import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyAdminShowWorkbookImport } from "../apply-workbook-import";
import { ISSUE_CODES } from "../internal/workbook-preview-constants";

const { evaluateWorkbookImportMock, writeAdminShowWorkbookImportDbMock } =
  vi.hoisted(() => ({
    evaluateWorkbookImportMock: vi.fn(),
    writeAdminShowWorkbookImportDbMock: vi.fn(),
  }));

vi.mock("../internal/runtime/evaluate-workbook-import", () => ({
  evaluateWorkbookImport: evaluateWorkbookImportMock,
}));

vi.mock("@beagle/db", () => ({
  WORKBOOK_IMPORT_WRITE_TX_CONFIG: {
    maxWait: 10_000,
    timeout: 20_000,
  },
  writeAdminShowWorkbookImportDb: writeAdminShowWorkbookImportDbMock,
}));

describe("applyAdminShowWorkbookImport", () => {
  beforeEach(() => {
    evaluateWorkbookImportMock.mockReset();
    writeAdminShowWorkbookImportDbMock.mockReset();
  });

  it("blocks apply when runtime has errors", async () => {
    evaluateWorkbookImportMock.mockResolvedValue({
      ok: true,
      sheetName: "Näyttelytulokset",
      rows: [],
      schema: {
        structuralFields: {},
        missingRequiredFields: [],
        resultColumns: [],
        ignoredColumns: [],
        blockedColumns: [],
        coverage: {
          totalWorkbookColumns: 0,
          importedColumnCount: 0,
          ignoredColumnCount: 0,
          blockedColumnCount: 0,
        },
      },
      issues: [
        {
          rowNumber: 2,
          columnName: "SERT",
          severity: "ERROR",
          code: "ERR",
          message: "x",
          registrationNo: "FI1/24",
          eventLookupKey: "2025-01-01|PAIKKA",
        },
      ],
      rowCount: 1,
      acceptedRowCount: 0,
      rejectedRowCount: 1,
      eventCount: 0,
      entryCount: 0,
      resultItemCount: 0,
      infoCount: 0,
      warningCount: 0,
      errorCount: 1,
      events: [],
    });

    const result = await applyAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: Buffer.from("xlsx"),
    });
    expect(result.body.ok).toBe(true);
    if (result.body.ok) {
      expect(result.body.data.success).toBe(false);
      expect(result.body.data.errorCount).toBe(1);
    }
  });

  it("creates events, entries and items in one transaction", async () => {
    evaluateWorkbookImportMock.mockResolvedValue({
      ok: true,
      sheetName: "Näyttelytulokset",
      rows: [
        {
          rowNumber: 2,
          eventLookupKey: "2025-01-01|HELSINKI HALLI",
          eventDateIso: "2025-01-01",
          eventCity: "Helsinki",
          eventPlace: "Helsinki Halli",
          eventType: "Kansallinen",
          accepted: true,
          issueCount: 0,
          itemCount: 1,
          registrationNo: "FI1/24",
          dogName: "KOIRA",
          dogMatched: true,
          judge: null,
          critiqueText: null,
          classValue: "",
          qualityValue: "",
          resultItems: [
            {
              columnName: "SERT",
              definitionCode: "SERT",
              valueCode: null,
              valueNumeric: null,
            },
          ],
        },
      ],
      schema: {
        structuralFields: {},
        missingRequiredFields: [],
        resultColumns: [],
        ignoredColumns: [],
        blockedColumns: [],
        coverage: {
          totalWorkbookColumns: 0,
          importedColumnCount: 0,
          ignoredColumnCount: 0,
          blockedColumnCount: 0,
        },
      },
      issues: [],
      rowCount: 1,
      acceptedRowCount: 1,
      rejectedRowCount: 0,
      eventCount: 1,
      entryCount: 1,
      resultItemCount: 1,
      infoCount: 0,
      warningCount: 0,
      errorCount: 0,
      events: [],
    });
    writeAdminShowWorkbookImportDbMock.mockResolvedValue({
      eventsCreated: 1,
      entriesCreated: 1,
      itemsCreated: 1,
    });

    const result = await applyAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: Buffer.from("xlsx"),
    });
    expect(result.body.ok).toBe(true);
    if (result.body.ok) {
      expect(result.body.data.success).toBe(true);
      expect(result.body.data.eventsCreated).toBe(1);
      expect(result.body.data.entriesCreated).toBe(1);
      expect(result.body.data.itemsCreated).toBe(1);
    }
  });

  it("returns unreadable when workbook parsing fails before write", async () => {
    evaluateWorkbookImportMock.mockRejectedValue(
      new Error("Corrupted workbook"),
    );

    const result = await applyAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: Buffer.from("xlsx"),
    });

    expect(result.status).toBe(400);
    expect(result.body.ok).toBe(false);
    if (!result.body.ok) {
      expect(result.body.code).toBe(ISSUE_CODES.unreadable);
    }
    expect(writeAdminShowWorkbookImportDbMock).not.toHaveBeenCalled();
  });

  it("returns write failure code when persistence fails", async () => {
    evaluateWorkbookImportMock.mockResolvedValue({
      ok: true,
      sheetName: "Näyttelytulokset",
      rows: [
        {
          rowNumber: 2,
          eventLookupKey: "2025-01-01|HELSINKI HALLI",
          eventDateIso: "2025-01-01",
          eventCity: "Helsinki",
          eventPlace: "Helsinki Halli",
          eventType: "Kansallinen",
          accepted: true,
          issueCount: 0,
          itemCount: 0,
          registrationNo: "FI1/24",
          dogName: "KOIRA",
          dogMatched: true,
          judge: null,
          critiqueText: null,
          classValue: "",
          qualityValue: "",
          resultItems: [],
        },
      ],
      schema: {
        structuralFields: {},
        missingRequiredFields: [],
        resultColumns: [],
        ignoredColumns: [],
        blockedColumns: [],
        coverage: {
          totalWorkbookColumns: 0,
          importedColumnCount: 0,
          ignoredColumnCount: 0,
          blockedColumnCount: 0,
        },
      },
      issues: [],
      rowCount: 1,
      acceptedRowCount: 1,
      rejectedRowCount: 0,
      eventCount: 1,
      entryCount: 1,
      resultItemCount: 0,
      infoCount: 0,
      warningCount: 0,
      errorCount: 0,
      events: [],
    });
    writeAdminShowWorkbookImportDbMock.mockRejectedValue(new Error("db write"));

    const result = await applyAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: Buffer.from("xlsx"),
    });

    expect(result.status).toBe(409);
    expect(result.body.ok).toBe(false);
    if (!result.body.ok) {
      expect(result.body.code).toBe(ISSUE_CODES.importWriteFailed);
    }
  });

  it("returns timeout code when persistence transaction expires", async () => {
    evaluateWorkbookImportMock.mockResolvedValue({
      ok: true,
      sheetName: "Näyttelytulokset",
      rows: [
        {
          rowNumber: 2,
          eventLookupKey: "2025-01-01|HELSINKI HALLI",
          eventDateIso: "2025-01-01",
          eventCity: "Helsinki",
          eventPlace: "Helsinki Halli",
          eventType: "Kansallinen",
          accepted: true,
          issueCount: 0,
          itemCount: 0,
          registrationNo: "FI1/24",
          dogName: "KOIRA",
          dogMatched: true,
          judge: null,
          critiqueText: null,
          classValue: "",
          qualityValue: "",
          resultItems: [],
        },
      ],
      schema: {
        structuralFields: {},
        missingRequiredFields: [],
        resultColumns: [],
        ignoredColumns: [],
        blockedColumns: [],
        coverage: {
          totalWorkbookColumns: 0,
          importedColumnCount: 0,
          ignoredColumnCount: 0,
          blockedColumnCount: 0,
        },
      },
      issues: [],
      rowCount: 1,
      acceptedRowCount: 1,
      rejectedRowCount: 0,
      eventCount: 1,
      entryCount: 1,
      resultItemCount: 0,
      infoCount: 0,
      warningCount: 0,
      errorCount: 0,
      events: [],
    });
    writeAdminShowWorkbookImportDbMock.mockRejectedValue(
      new Error(
        "Transaction API error: A commit cannot be executed on an expired transaction.",
      ),
    );

    const result = await applyAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: Buffer.from("xlsx"),
    });

    expect(result.status).toBe(409);
    expect(result.body.ok).toBe(false);
    if (!result.body.ok) {
      expect(result.body.code).toBe(ISSUE_CODES.importTimeout);
      expect(result.body.error).toContain("No rows were written");
    }
  });

  it("returns timeout code when persistence cannot start transaction in time", async () => {
    evaluateWorkbookImportMock.mockResolvedValue({
      ok: true,
      sheetName: "Näyttelytulokset",
      rows: [
        {
          rowNumber: 2,
          eventLookupKey: "2025-01-01|HELSINKI HALLI",
          eventDateIso: "2025-01-01",
          eventCity: "Helsinki",
          eventPlace: "Helsinki Halli",
          eventType: "Kansallinen",
          accepted: true,
          issueCount: 0,
          itemCount: 0,
          registrationNo: "FI1/24",
          dogName: "KOIRA",
          dogMatched: true,
          judge: null,
          critiqueText: null,
          classValue: "",
          qualityValue: "",
          resultItems: [],
        },
      ],
      schema: {
        structuralFields: {},
        missingRequiredFields: [],
        resultColumns: [],
        ignoredColumns: [],
        blockedColumns: [],
        coverage: {
          totalWorkbookColumns: 0,
          importedColumnCount: 0,
          ignoredColumnCount: 0,
          blockedColumnCount: 0,
        },
      },
      issues: [],
      rowCount: 1,
      acceptedRowCount: 1,
      rejectedRowCount: 0,
      eventCount: 1,
      entryCount: 1,
      resultItemCount: 0,
      infoCount: 0,
      warningCount: 0,
      errorCount: 0,
      events: [],
    });
    const timeoutError = Object.assign(
      new Error(
        "Transaction API error: Unable to start a transaction in the given time.",
      ),
      {
        code: "P2028",
      },
    );
    writeAdminShowWorkbookImportDbMock.mockRejectedValue(timeoutError);

    const result = await applyAdminShowWorkbookImport({
      fileName: "Näyttelyt.xlsx",
      workbook: Buffer.from("xlsx"),
    });

    expect(result.status).toBe(409);
    expect(result.body.ok).toBe(false);
    if (!result.body.ok) {
      expect(result.body.code).toBe(ISSUE_CODES.importTimeout);
      expect(result.body.error).toContain("No rows were written");
    }
  });
});
