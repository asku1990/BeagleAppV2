import { prisma, type LegacyShowResultRow } from "@beagle/db";
import {
  isValidRegistrationNo,
  normalizeNullable,
  normalizeRegistrationNo,
  parseLegacyDate,
} from "../core";
import { parseShowResultText } from "./show-result-parser";
import { buildDefinitionLookup } from "./show-result-definition-lookup";
import { toEventSourceDatePart } from "./date-key";
import {
  normalizePlaceKey,
  sourceHash,
  toSourceTag,
} from "./show-import-helpers";

// Persists canonical show rows for the phase3 initial-load flow.
// Reruns are intentionally blocked upstream in runLegacyPhase3, so this path
// targets a clean canonical schema rather than ongoing mixed old/new imports.
type EventUpsertResult = {
  upserted: number;
  errors: number;
  issues: Array<{
    code: string;
    message: string;
    registrationNo: string | null;
    sourceTable: string;
    payloadJson: string;
  }>;
};

export async function upsertShowRows(
  rows: LegacyShowResultRow[],
  dogIdByRegistration: Map<string, string>,
  options?: {
    onProgress?: (processed: number, total: number) => void;
    importRunId?: string;
  },
): Promise<EventUpsertResult> {
  const definitionRows = await prisma.showResultDefinition.findMany({
    where: { isEnabled: true },
    select: { id: true, code: true },
  });
  const definitionLookup = buildDefinitionLookup(definitionRows);

  const total = rows.length;
  let upserted = 0;
  let errors = 0;
  let processed = 0;
  const issues: EventUpsertResult["issues"] = [];

  for (const row of rows) {
    processed += 1;
    const registrationNo = normalizeRegistrationNo(row.registrationNo);
    if (registrationNo && !isValidRegistrationNo(registrationNo)) {
      errors += 1;
      issues.push({
        code: "SHOW_REGISTRATION_INVALID_FORMAT",
        message: "Show row has invalid registration format.",
        registrationNo,
        sourceTable: row.sourceTable,
        payloadJson: JSON.stringify({
          registrationNo: row.registrationNo,
          eventPlace: row.eventPlace,
          eventDateRaw: row.eventDateRaw,
        }),
      });
      if (processed % 1000 === 0) options?.onProgress?.(processed, total);
      continue;
    }

    const dogId = registrationNo
      ? (dogIdByRegistration.get(registrationNo) ?? null)
      : null;
    const eventDate = parseLegacyDate(row.eventDateRaw);
    const eventPlace = normalizeNullable(row.eventPlace);
    if (!eventDate || !eventPlace || !registrationNo) {
      errors += 1;
      issues.push({
        code: "SHOW_EVENT_MISSING_REQUIRED_FIELDS",
        message: "Show row missing registration, event date, or event place.",
        registrationNo,
        sourceTable: row.sourceTable,
        payloadJson: JSON.stringify({
          registrationNo: row.registrationNo,
          eventPlace: row.eventPlace,
          eventDateRaw: row.eventDateRaw,
        }),
      });
      if (processed % 1000 === 0) options?.onProgress?.(processed, total);
      continue;
    }

    const normalizedEventDate = toEventSourceDatePart(eventDate);
    const sourceTag = toSourceTag(row.sourceTable);
    const eventLookupKey = `${normalizedEventDate}|${normalizePlaceKey(eventPlace)}`;
    const entryLookupKey = `${registrationNo}|${eventLookupKey}`;
    const sourceRef = `${registrationNo}|${normalizedEventDate}|${eventPlace}`;
    const rawResultText = normalizeNullable(row.resultText);
    const parsed = parseShowResultText(rawResultText, normalizedEventDate);
    const rowFingerprint = sourceHash(
      JSON.stringify({
        sourceTable: row.sourceTable,
        registrationNo,
        eventDate: normalizedEventDate,
        eventPlace,
        resultText: rawResultText,
        heightText: row.heightText,
        judge: row.judge,
      }),
    );

    const showEvent = await prisma.showEvent.upsert({
      where: { eventLookupKey },
      create: {
        eventLookupKey,
        sourceRowHash: sourceHash(`${row.sourceTable}|${eventLookupKey}`),
        sourceTag,
        eventDate,
        eventName: null,
        eventCity: null,
        eventPlace,
        eventType: null,
        organizer: null,
        importRunId: options?.importRunId ?? null,
        sourceTable: row.sourceTable,
        sourceRef,
        rawPayloadJson: JSON.stringify({
          sourceTable: row.sourceTable,
          registrationNo,
          eventDateRaw: row.eventDateRaw,
          eventPlace: row.eventPlace,
        }),
      },
      update: {
        eventDate,
        eventPlace,
        importRunId: options?.importRunId ?? null,
      },
      select: { id: true },
    });

    const showEntry = await prisma.showEntry.upsert({
      where: { entryLookupKey },
      create: {
        entryLookupKey,
        sourceRowHash: rowFingerprint,
        showEventId: showEvent.id,
        dogId,
        sourceTag,
        registrationNoSnapshot: registrationNo,
        dogNameSnapshot: normalizeNullable(row.dogName) ?? registrationNo,
        judge: normalizeNullable(row.judge),
        heightText: normalizeNullable(row.heightText),
        critiqueText: normalizeNullable(row.critiqueText),
        importRunId: options?.importRunId ?? null,
        sourceTable: row.sourceTable,
        sourceRef,
        legacyFlag: normalizeNullable(row.legacyFlag),
        rawPayloadJson: JSON.stringify({
          sourceTable: row.sourceTable,
          registrationNo,
          eventDateRaw: row.eventDateRaw,
          eventPlace: row.eventPlace,
          resultTextRaw: rawResultText,
          resultTextNormalized: parsed.normalizedResultText,
          critiqueText: row.critiqueText,
        }),
      },
      update: {
        showEventId: showEvent.id,
        dogId,
        sourceTag,
        dogNameSnapshot: normalizeNullable(row.dogName) ?? registrationNo,
        judge: normalizeNullable(row.judge),
        heightText: normalizeNullable(row.heightText),
        critiqueText: normalizeNullable(row.critiqueText),
        importRunId: options?.importRunId ?? null,
        sourceTable: row.sourceTable,
        sourceRef,
        legacyFlag: normalizeNullable(row.legacyFlag),
        rawPayloadJson: JSON.stringify({
          sourceTable: row.sourceTable,
          registrationNo,
          eventDateRaw: row.eventDateRaw,
          eventPlace: row.eventPlace,
          resultTextRaw: rawResultText,
          resultTextNormalized: parsed.normalizedResultText,
          critiqueText: row.critiqueText,
        }),
      },
      select: { id: true },
    });

    for (const token of parsed.unmappedTokens) {
      errors += 1;
      issues.push({
        code: "SHOW_RESULT_TOKEN_UNMAPPED",
        message: `Unmapped show result token=${token}.`,
        registrationNo,
        sourceTable: row.sourceTable,
        payloadJson: JSON.stringify({
          token,
          entryLookupKey,
          resultTextRaw: rawResultText,
          resultTextNormalized: parsed.normalizedResultText,
        }),
      });
    }

    let itemIndex = 0;
    for (const item of parsed.items) {
      const definitionId = definitionLookup.findDefinitionId(
        item.definitionCode,
      );

      if (!definitionId) {
        errors += 1;
        issues.push({
          code: "SHOW_RESULT_DEFINITION_NOT_FOUND",
          message: `No ShowResultDefinition found for code=${item.definitionCode}.`,
          registrationNo,
          sourceTable: row.sourceTable,
          payloadJson: JSON.stringify({
            token: item.token,
            definitionCode: item.definitionCode,
            entryLookupKey,
          }),
        });
        continue;
      }

      itemIndex += 1;
      const itemValueKey =
        item.valueCode ??
        (item.valueNumeric !== null ? `num:${item.valueNumeric}` : "flag");
      const itemLookupKey = `${entryLookupKey}|${item.definitionCode}|${itemValueKey}|${itemIndex}`;

      await prisma.showResultItem.upsert({
        where: { itemLookupKey },
        create: {
          itemLookupKey,
          sourceRowHash: sourceHash(`${rowFingerprint}|${itemLookupKey}`),
          showEntryId: showEntry.id,
          definitionId,
          sourceTag,
          valueCode: item.valueCode,
          valueText: null,
          valueNumeric: item.valueNumeric,
          valueDate: null,
          isAwarded: item.isAwarded,
          importRunId: options?.importRunId ?? null,
          sourceTable: row.sourceTable,
          sourceRef,
          rawPayloadJson: JSON.stringify({
            token: item.token,
            definitionCode: item.definitionCode,
            resultTextRaw: rawResultText,
            resultTextNormalized: parsed.normalizedResultText,
          }),
        },
        update: {
          definitionId,
          sourceTag,
          valueCode: item.valueCode,
          valueNumeric: item.valueNumeric,
          isAwarded: item.isAwarded,
          importRunId: options?.importRunId ?? null,
          sourceTable: row.sourceTable,
          sourceRef,
          rawPayloadJson: JSON.stringify({
            token: item.token,
            definitionCode: item.definitionCode,
            resultTextRaw: rawResultText,
            resultTextNormalized: parsed.normalizedResultText,
          }),
        },
      });
    }

    upserted += 1;
    if (processed % 1000 === 0) options?.onProgress?.(processed, total);
  }

  options?.onProgress?.(processed, total);
  return { upserted, errors, issues };
}
