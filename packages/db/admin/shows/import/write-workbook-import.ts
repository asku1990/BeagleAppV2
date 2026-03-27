import { prisma } from "../../../core/prisma";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";

// Persists accepted workbook rows with create-only semantics in one transaction.
export type AdminShowWorkbookImportWriteRowDb = {
  rowNumber: number;
  eventLookupKey: string;
  eventDateIso: string;
  eventCity: string;
  eventPlace: string;
  eventType: string;
  registrationNo: string;
  dogName: string;
  judge: string | null;
  critiqueText: string | null;
  resultItems: Array<{
    columnName: string;
    definitionCode: string;
    valueCode: string | null;
    valueNumeric: number | null;
  }>;
};

function toDateValue(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

export async function writeAdminShowWorkbookImportDb(input: {
  fileName: string;
  rows: AdminShowWorkbookImportWriteRowDb[];
}): Promise<{
  eventsCreated: number;
  entriesCreated: number;
  itemsCreated: number;
}> {
  let eventsCreated = 0;
  let entriesCreated = 0;
  let itemsCreated = 0;

  await prisma.$transaction(async (tx) => {
    const eventKeys = [...new Set(input.rows.map((row) => row.eventLookupKey))];
    const registrationNos = [
      ...new Set(input.rows.map((row) => row.registrationNo)),
    ];
    const definitionCodes = [
      ...new Set(
        input.rows.flatMap((row) =>
          row.resultItems.map((item) => item.definitionCode),
        ),
      ),
    ];

    const [existingEvents, dogRegistrations, definitions] = await Promise.all([
      tx.showEvent.findMany({
        where: { eventLookupKey: { in: eventKeys } },
        select: { id: true, eventLookupKey: true },
      }),
      tx.dogRegistration.findMany({
        where: { registrationNo: { in: registrationNos } },
        select: { registrationNo: true, dogId: true },
      }),
      tx.showResultDefinition.findMany({
        where: { code: { in: definitionCodes } },
        select: { id: true, code: true },
      }),
    ]);

    const eventsByKey = new Map(
      existingEvents.map((event) => [event.eventLookupKey, event.id]),
    );
    const dogIdByRegistrationNo = new Map(
      dogRegistrations.map((registration) => [
        registration.registrationNo,
        registration.dogId,
      ]),
    );
    const definitionIdByCode = new Map(
      definitions.map((definition) => [definition.code, definition.id]),
    );

    const eventsToCreate: Prisma.ShowEventCreateManyInput[] = [];
    for (const row of input.rows) {
      if (eventsByKey.has(row.eventLookupKey)) {
        continue;
      }
      const id = randomUUID();
      eventsByKey.set(row.eventLookupKey, id);
      eventsToCreate.push({
        id,
        eventLookupKey: row.eventLookupKey,
        sourceTag: "WORKBOOK_KENNELLIITTO",
        eventDate: toDateValue(row.eventDateIso),
        eventCity: row.eventCity || null,
        eventPlace: row.eventPlace,
        eventType: row.eventType || null,
        importRunId: null,
        sourceRef: `workbook:${input.fileName}:row:${row.rowNumber}`,
        rawPayloadJson: JSON.stringify({
          fileName: input.fileName,
          rowNumber: row.rowNumber,
          eventDateIso: row.eventDateIso,
          eventCity: row.eventCity,
          eventPlace: row.eventPlace,
          eventType: row.eventType,
        }),
      });
    }
    if (eventsToCreate.length > 0) {
      await tx.showEvent.createMany({ data: eventsToCreate });
      eventsCreated += eventsToCreate.length;
    }

    const entriesToCreate: Array<{
      id: string;
      row: AdminShowWorkbookImportWriteRowDb;
      entryLookupKey: string;
    }> = [];
    for (const row of input.rows) {
      const showEventId = eventsByKey.get(row.eventLookupKey);
      if (!showEventId) {
        throw new Error(`Missing showEventId for ${row.eventLookupKey}`);
      }

      const entryLookupKey = `${row.registrationNo}|${row.eventLookupKey}`;
      const entryId = randomUUID();
      entriesToCreate.push({
        id: entryId,
        row,
        entryLookupKey,
      });
    }
    if (entriesToCreate.length > 0) {
      await tx.showEntry.createMany({
        data: entriesToCreate.map((entry) => ({
          id: entry.id,
          entryLookupKey: entry.entryLookupKey,
          showEventId: eventsByKey.get(entry.row.eventLookupKey) ?? "",
          dogId: dogIdByRegistrationNo.get(entry.row.registrationNo) ?? null,
          sourceTag: "WORKBOOK_KENNELLIITTO" as const,
          registrationNoSnapshot: entry.row.registrationNo,
          dogNameSnapshot: entry.row.dogName,
          judge: entry.row.judge,
          critiqueText: entry.row.critiqueText,
          importRunId: null,
          sourceRef: `workbook:${input.fileName}:row:${entry.row.rowNumber}`,
          rawPayloadJson: JSON.stringify({
            fileName: input.fileName,
            rowNumber: entry.row.rowNumber,
            registrationNo: entry.row.registrationNo,
            dogName: entry.row.dogName,
            judge: entry.row.judge,
            critiqueText: entry.row.critiqueText,
          }),
        })),
      });
      entriesCreated += entriesToCreate.length;
    }

    const itemsToCreate: Prisma.ShowResultItemCreateManyInput[] = [];
    for (const entry of entriesToCreate) {
      for (const [index, item] of entry.row.resultItems.entries()) {
        const definitionId = definitionIdByCode.get(item.definitionCode);
        if (!definitionId) {
          throw new Error(`Missing definition for ${item.definitionCode}`);
        }
        const valueDiscriminator =
          item.valueCode ?? item.valueNumeric?.toString() ?? "FLAG";
        itemsToCreate.push({
          id: randomUUID(),
          itemLookupKey: `${entry.entryLookupKey}|${item.definitionCode}|${valueDiscriminator}|${index}`,
          showEntryId: entry.id,
          definitionId,
          sourceTag: "WORKBOOK_KENNELLIITTO",
          valueCode: item.valueCode,
          valueNumeric: item.valueNumeric,
          isAwarded:
            item.valueCode === null && item.valueNumeric === null ? true : null,
          importRunId: null,
          sourceRef: `workbook:${input.fileName}:row:${entry.row.rowNumber}`,
          rawPayloadJson: JSON.stringify({
            fileName: input.fileName,
            rowNumber: entry.row.rowNumber,
            columnName: item.columnName,
            definitionCode: item.definitionCode,
            valueCode: item.valueCode,
            valueNumeric: item.valueNumeric,
          }),
        });
      }
    }
    if (itemsToCreate.length > 0) {
      await tx.showResultItem.createMany({ data: itemsToCreate });
      itemsCreated += itemsToCreate.length;
    }
  });

  return { eventsCreated, entriesCreated, itemsCreated };
}
