import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import { listExistingShowImportKeysDb } from "@beagle/db";
import { normalizeWorkbookComparisonToken } from "../cell";
import { ISSUE_CODES } from "../workbook-preview-constants";
import { createIssue } from "../workbook-preview-mappers";
import type { WorkbookParsedRow } from "../workbook-preview-types";
import { rejectParsedRow } from "../runtime/reject-parsed-row";

// Applies persisted event and entry conflict checks to already parsed workbook rows.
function valuesConflict(left: string, right: string): boolean {
  return (
    normalizeWorkbookComparisonToken(left) !==
    normalizeWorkbookComparisonToken(right)
  );
}

function addEntryAlreadyExistsIssue(input: {
  issues: AdminShowWorkbookImportIssue[];
  row: WorkbookParsedRow;
}) {
  input.issues.push(
    createIssue({
      rowNumber: input.row.rowNumber,
      columnName: "Rekisterinumero",
      severity: "ERROR",
      code: ISSUE_CODES.duplicateExistingEntry,
      message: `Entry already exists for ${input.row.registrationNo} in event ${input.row.eventLookupKey}.`,
      registrationNo: input.row.registrationNo,
      eventLookupKey: input.row.eventLookupKey,
    }),
  );
}

function addEventConflictIssue(input: {
  issues: AdminShowWorkbookImportIssue[];
  row: WorkbookParsedRow;
  existingCity: string | null;
  existingType: string | null;
}) {
  const details: string[] = [];
  if (
    input.existingCity &&
    input.row.eventCity &&
    valuesConflict(input.existingCity, input.row.eventCity)
  ) {
    details.push(
      `city differs (workbook "${input.row.eventCity}", existing "${input.existingCity}")`,
    );
  }
  if (
    input.existingType &&
    input.row.eventType &&
    valuesConflict(input.existingType, input.row.eventType)
  ) {
    details.push(
      `type differs (workbook "${input.row.eventType}", existing "${input.existingType}")`,
    );
  }

  input.issues.push(
    createIssue({
      rowNumber: input.row.rowNumber,
      columnName: null,
      severity: "ERROR",
      code: ISSUE_CODES.eventMetadataConflict,
      message: `Event metadata conflicts with existing data for ${input.row.eventLookupKey}: ${details.join(", ")}.`,
      registrationNo: input.row.registrationNo,
      eventLookupKey: input.row.eventLookupKey,
    }),
  );
}

function hasEventMetadataConflict(
  row: WorkbookParsedRow,
  event: { eventCity: string | null; eventType: string | null },
): boolean {
  if (
    event.eventCity &&
    row.eventCity &&
    valuesConflict(event.eventCity, row.eventCity)
  ) {
    return true;
  }
  if (
    event.eventType &&
    row.eventType &&
    valuesConflict(event.eventType, row.eventType)
  ) {
    return true;
  }
  return false;
}

export async function checkExistingImportConflicts(input: {
  rows: WorkbookParsedRow[];
  issues: AdminShowWorkbookImportIssue[];
}) {
  const acceptedRows = input.rows.filter((row) => row.accepted);
  if (acceptedRows.length === 0) {
    return;
  }

  const eventKeys = [...new Set(acceptedRows.map((row) => row.eventLookupKey))];
  const entryKeys = [
    ...new Set(
      acceptedRows.map((row) => `${row.registrationNo}|${row.eventLookupKey}`),
    ),
  ];
  const { events: existingEvents, entries: existingEntries } =
    await listExistingShowImportKeysDb({
      eventLookupKeys: eventKeys,
      entryLookupKeys: entryKeys,
    });

  const existingEventsByKey = new Map(
    existingEvents.map((event) => [event.eventLookupKey, event]),
  );
  const existingEntryKeys = new Set(
    existingEntries.map((entry) => entry.entryLookupKey),
  );
  for (const row of input.rows) {
    if (!row.accepted) {
      continue;
    }

    const entryLookupKey = `${row.registrationNo}|${row.eventLookupKey}`;
    if (existingEntryKeys.has(entryLookupKey)) {
      rejectParsedRow(row);
      addEntryAlreadyExistsIssue({ issues: input.issues, row });
      continue;
    }

    const existingEvent = existingEventsByKey.get(row.eventLookupKey);
    if (!existingEvent || !hasEventMetadataConflict(row, existingEvent)) {
      continue;
    }

    rejectParsedRow(row);
    addEventConflictIssue({
      issues: input.issues,
      row,
      existingCity: existingEvent.eventCity,
      existingType: existingEvent.eventType,
    });
  }
}
