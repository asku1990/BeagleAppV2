import type { AdminShowWorkbookImportPreviewEvent } from "@beagle/contracts";
import type { WorkbookParsedRow } from "../workbook-preview-types";

// Groups parsed rows into event cards for the admin preview response.
function buildGroupLabel(row: WorkbookParsedRow): string {
  const parts = [row.eventCity, row.eventPlace].filter(Boolean);
  if (parts.length > 0) {
    return parts.join(", ");
  }

  return `Rivi ${row.rowNumber}`;
}

export function buildPreviewEvents(
  rows: WorkbookParsedRow[],
): AdminShowWorkbookImportPreviewEvent[] {
  const events = new Map<string, AdminShowWorkbookImportPreviewEvent>();

  for (const row of rows) {
    const existingEvent = events.get(row.eventLookupKey);
    if (existingEvent) {
      if (
        !existingEvent.eventDateIso &&
        row.eventDateIso &&
        row.eventCity &&
        row.eventPlace &&
        row.eventType
      ) {
        existingEvent.eventDateIso = row.eventDateIso;
        existingEvent.eventCity = row.eventCity;
        existingEvent.eventPlace = row.eventPlace;
        existingEvent.eventType = row.eventType;
        existingEvent.groupLabel = buildGroupLabel(row);
      }

      existingEvent.entries.push({
        rowNumber: row.rowNumber,
        registrationNo: row.registrationNo,
        dogName: row.dogName,
        dogMatched: row.dogMatched,
        status: row.accepted ? "ACCEPTED" : "REJECTED",
        issueCount: row.issueCount,
        judge: row.judge,
        critiqueText: row.critiqueText,
        classValue: row.classValue,
        qualityValue: row.qualityValue,
        resultItems: row.resultItems,
      });
      continue;
    }

    events.set(row.eventLookupKey, {
      eventLookupKey: row.eventLookupKey,
      groupLabel: buildGroupLabel(row),
      eventDateIso: row.eventDateIso,
      eventCity: row.eventCity,
      eventPlace: row.eventPlace,
      eventType: row.eventType,
      entries: [
        {
          rowNumber: row.rowNumber,
          registrationNo: row.registrationNo,
          dogName: row.dogName,
          dogMatched: row.dogMatched,
          status: row.accepted ? "ACCEPTED" : "REJECTED",
          issueCount: row.issueCount,
          judge: row.judge,
          critiqueText: row.critiqueText,
          classValue: row.classValue,
          qualityValue: row.qualityValue,
          resultItems: row.resultItems,
        },
      ],
    });
  }

  return Array.from(events.values());
}
