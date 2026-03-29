import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import { ISSUE_CODES } from "../../workbook-preview-constants";
import type { WorkbookParsedRow } from "../../workbook-preview-types";
import { checkExistingImportConflicts } from "../check-existing-import-conflicts";

const { listExistingShowImportKeysDbMock } = vi.hoisted(() => ({
  listExistingShowImportKeysDbMock: vi.fn(),
}));

vi.mock("@beagle/db", () => ({
  listExistingShowImportKeysDb: listExistingShowImportKeysDbMock,
}));

function createRow(overrides: Partial<WorkbookParsedRow>): WorkbookParsedRow {
  return {
    rowNumber: 2,
    eventLookupKey: "2025-05-01|HELSINKI|MESSUKESKUS|ALL BREED",
    eventDateIso: "2025-05-01",
    eventCity: "Helsinki",
    eventPlace: "Messukeskus",
    eventType: "All Breed",
    accepted: true,
    issueCount: 0,
    itemCount: 1,
    registrationNo: "FI12345/24",
    dogName: "Kide",
    dogMatched: true,
    judge: "Judge",
    critiqueText: "Nice dog",
    classValue: "AVO",
    qualityValue: "ERI",
    resultItems: [{ code: "AVO", label: "Avoin" }],
    ...overrides,
  };
}

describe("checkExistingImportConflicts", () => {
  beforeEach(() => {
    listExistingShowImportKeysDbMock.mockReset();
  });

  it("returns early when nothing is accepted", async () => {
    const rows = [
      createRow({
        accepted: false,
      }),
    ];
    const issues: AdminShowWorkbookImportIssue[] = [];

    await checkExistingImportConflicts({ rows, issues });

    expect(listExistingShowImportKeysDbMock).not.toHaveBeenCalled();
    expect(rows[0]).toMatchObject({
      accepted: false,
      issueCount: 0,
      itemCount: 1,
      resultItems: [{ code: "AVO", label: "Avoin" }],
    });
    expect(issues).toEqual([]);
  });

  it("marks rows as rejected when the entry already exists", async () => {
    const row = createRow({});
    const issues: AdminShowWorkbookImportIssue[] = [];

    listExistingShowImportKeysDbMock.mockResolvedValue({
      events: [],
      entries: [
        {
          entryLookupKey: `${row.registrationNo}|${row.eventLookupKey}`,
        },
      ],
    });

    await checkExistingImportConflicts({ rows: [row], issues });

    expect(listExistingShowImportKeysDbMock).toHaveBeenCalledWith({
      eventLookupKeys: [row.eventLookupKey],
      entryLookupKeys: [`${row.registrationNo}|${row.eventLookupKey}`],
    });
    expect(row).toMatchObject({
      accepted: false,
      issueCount: 1,
      itemCount: 0,
      resultItems: [],
    });
    expect(issues).toEqual([
      expect.objectContaining({
        code: ISSUE_CODES.duplicateExistingEntry,
        columnName: "Rekisterinumero",
        rowNumber: 2,
        registrationNo: "FI12345/24",
        eventLookupKey: row.eventLookupKey,
      }),
    ]);
  });

  it("marks rows as rejected when existing event metadata conflicts", async () => {
    const row = createRow({
      eventCity: "Tampere",
      eventType: "Specialty",
    });
    const issues: AdminShowWorkbookImportIssue[] = [];

    listExistingShowImportKeysDbMock.mockResolvedValue({
      events: [
        {
          eventLookupKey: row.eventLookupKey,
          eventCity: "Helsinki",
          eventType: "All Breed",
        },
      ],
      entries: [],
    });

    await checkExistingImportConflicts({ rows: [row], issues });

    expect(row).toMatchObject({
      accepted: false,
      issueCount: 1,
      itemCount: 0,
      resultItems: [],
    });
    expect(issues).toEqual([
      expect.objectContaining({
        code: ISSUE_CODES.eventMetadataConflict,
        columnName: null,
        rowNumber: 2,
        message:
          'Event metadata conflicts with existing data for 2025-05-01|HELSINKI|MESSUKESKUS|ALL BREED: city differs (workbook "Tampere", existing "Helsinki"), type differs (workbook "Specialty", existing "All Breed").',
      }),
    ]);
  });

  it("leaves the row accepted when existing event metadata matches after normalization", async () => {
    const row = createRow({
      eventCity: "  helsinki  ",
      eventType: "all breed",
    });
    const issues: AdminShowWorkbookImportIssue[] = [];

    listExistingShowImportKeysDbMock.mockResolvedValue({
      events: [
        {
          eventLookupKey: row.eventLookupKey,
          eventCity: "Helsinki",
          eventType: "All Breed",
        },
      ],
      entries: [],
    });

    await checkExistingImportConflicts({ rows: [row], issues });

    expect(row).toMatchObject({
      accepted: true,
      issueCount: 0,
      itemCount: 1,
      resultItems: [{ code: "AVO", label: "Avoin" }],
    });
    expect(issues).toEqual([]);
  });
});
