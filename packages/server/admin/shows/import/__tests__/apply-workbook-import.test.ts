import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyAdminShowWorkbookImport } from "../apply-workbook-import";

type TransactionClientMock = {
  showEvent: {
    findMany: typeof showEventFindManyMock;
    create: typeof showEventCreateMock;
  };
  dogRegistration: {
    findMany: typeof dogRegistrationFindManyMock;
  };
  showResultDefinition: {
    findMany: typeof showResultDefinitionFindManyMock;
  };
  showEntry: {
    create: typeof showEntryCreateMock;
  };
  showResultItem: {
    create: typeof showResultItemCreateMock;
  };
};

const {
  evaluateWorkbookImportMock,
  transactionMock,
  showEventFindManyMock,
  showEventCreateMock,
  dogRegistrationFindManyMock,
  showResultDefinitionFindManyMock,
  showEntryCreateMock,
  showResultItemCreateMock,
} = vi.hoisted(() => ({
  evaluateWorkbookImportMock: vi.fn(),
  transactionMock: vi.fn(),
  showEventFindManyMock: vi.fn(),
  showEventCreateMock: vi.fn(),
  dogRegistrationFindManyMock: vi.fn(),
  showResultDefinitionFindManyMock: vi.fn(),
  showEntryCreateMock: vi.fn(),
  showResultItemCreateMock: vi.fn(),
}));

vi.mock("../internal/workbook-import-runtime", () => ({
  evaluateWorkbookImport: evaluateWorkbookImportMock,
}));

vi.mock("@beagle/db", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

describe("applyAdminShowWorkbookImport", () => {
  beforeEach(() => {
    evaluateWorkbookImportMock.mockReset();
    transactionMock.mockReset();
    showEventFindManyMock.mockReset();
    showEventCreateMock.mockReset();
    dogRegistrationFindManyMock.mockReset();
    showResultDefinitionFindManyMock.mockReset();
    showEntryCreateMock.mockReset();
    showResultItemCreateMock.mockReset();

    transactionMock.mockImplementation(
      async (callback: (client: TransactionClientMock) => Promise<unknown>) =>
        callback({
          showEvent: {
            findMany: showEventFindManyMock,
            create: showEventCreateMock,
          },
          dogRegistration: {
            findMany: dogRegistrationFindManyMock,
          },
          showResultDefinition: {
            findMany: showResultDefinitionFindManyMock,
          },
          showEntry: {
            create: showEntryCreateMock,
          },
          showResultItem: {
            create: showResultItemCreateMock,
          },
        }),
    );
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
    showEventFindManyMock.mockResolvedValue([]);
    dogRegistrationFindManyMock.mockResolvedValue([
      { registrationNo: "FI1/24", dogId: "dog_1" },
    ]);
    showResultDefinitionFindManyMock.mockResolvedValue([
      { id: "def_1", code: "SERT" },
    ]);
    showEventCreateMock.mockResolvedValue({ id: "event_1" });
    showEntryCreateMock.mockResolvedValue({ id: "entry_1" });
    showResultItemCreateMock.mockResolvedValue({ id: "item_1" });

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
});
