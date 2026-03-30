import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AdminShowWorkbookImportIssue,
  AdminShowWorkbookImportPreviewItem,
} from "@beagle/contracts";
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
  const resultItems: AdminShowWorkbookImportPreviewItem[] = [
    {
      columnName: "Luokka",
      definitionCode: "AVO",
      valueCode: "AVO",
      valueNumeric: null,
    },
  ];

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
    resultItems,
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
      resultItems: [
        {
          columnName: "Luokka",
          definitionCode: "AVO",
          valueCode: "AVO",
          valueNumeric: null,
        },
      ],
    });
    expect(issues).toEqual([]);
  });

  it("marks rows as rejected when the entry already exists", async () => {
    const row = createRow({});
    const issues: AdminShowWorkbookImportIssue[] = [];

    listExistingShowImportKeysDbMock.mockResolvedValue({
      events: [],
      sameDayEvents: [],
      entries: [
        {
          entryLookupKey: `${row.registrationNo}|${row.eventLookupKey}`,
        },
      ],
    });

    await checkExistingImportConflicts({ rows: [row], issues });

    expect(listExistingShowImportKeysDbMock).toHaveBeenCalledWith({
      eventLookupKeys: [row.eventLookupKey],
      eventDateIsos: [row.eventDateIso],
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
      sameDayEvents: [],
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
      sameDayEvents: [],
      entries: [],
    });

    await checkExistingImportConflicts({ rows: [row], issues });

    expect(row).toMatchObject({
      accepted: true,
      issueCount: 0,
      itemCount: 1,
      resultItems: [
        {
          columnName: "Luokka",
          definitionCode: "AVO",
          valueCode: "AVO",
          valueNumeric: null,
        },
      ],
    });
    expect(issues).toEqual([]);
  });

  it("adds a warning per accepted imported event when same-day events already exist", async () => {
    const rowA1 = createRow({
      rowNumber: 2,
      registrationNo: "FI12345/24",
      eventLookupKey: "2025-05-01|HELSINKI|MESSUKESKUS|ALL BREED",
      eventDateIso: "2025-05-01",
    });
    const rowA2 = createRow({
      rowNumber: 3,
      registrationNo: "FI54321/24",
      eventLookupKey: "2025-05-01|HELSINKI|MESSUKESKUS|ALL BREED",
      eventDateIso: "2025-05-01",
    });
    const rowB = createRow({
      rowNumber: 4,
      registrationNo: "FI99999/24",
      eventLookupKey: "2025-05-01|TAMPERE|HALLI|SPECIALTY",
      eventDateIso: "2025-05-01",
      eventCity: "Tampere",
      eventPlace: "Halli",
      eventType: "Specialty",
    });
    const issues: AdminShowWorkbookImportIssue[] = [];

    listExistingShowImportKeysDbMock.mockResolvedValue({
      events: [],
      sameDayEvents: [
        {
          eventLookupKey: "2025-05-01|OULU|ARENA|SPECIALTY",
          eventDate: new Date("2025-05-01T00:00:00.000Z"),
        },
      ],
      entries: [],
    });

    await checkExistingImportConflicts({ rows: [rowA1, rowA2, rowB], issues });

    expect(rowA1).toMatchObject({
      accepted: true,
      issueCount: 0,
      itemCount: 1,
    });
    expect(rowA2).toMatchObject({
      accepted: true,
      issueCount: 0,
      itemCount: 1,
    });
    expect(rowB).toMatchObject({
      accepted: true,
      issueCount: 0,
      itemCount: 1,
    });
    const sameDayIssues = issues.filter(
      (issue) => issue.code === ISSUE_CODES.sameDayEventExists,
    );
    expect(sameDayIssues).toHaveLength(2);
    expect(sameDayIssues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: "WARNING",
          rowNumber: 2,
          columnName: "Aika",
          eventLookupKey: rowA1.eventLookupKey,
        }),
        expect.objectContaining({
          severity: "WARNING",
          rowNumber: 4,
          columnName: "Aika",
          eventLookupKey: rowB.eventLookupKey,
        }),
      ]),
    );
  });
});
