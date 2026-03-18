import { prisma, type LegacyShowResultRow } from "@beagle/db";
import {
  isValidRegistrationNo,
  normalizeNullable,
  normalizeRegistrationNo,
  parseLegacyDate,
} from "../core";
import { parseShowResultText } from "./show-result-parser";
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

// During the naming cutover, review raised the risk that enabled definition
// rows might still use pre-cutover codes in some environments. Phase3 should
// normally run only against a clean seeded catalog, but these aliases keep the
// lookup tolerant if definition naming drifts during the transition.
const LEGACY_DEFINITION_CODE_ALIASES: Record<string, string[]> = {
  varaSERT: ["VARASERT"],
  "NORD-SERT": ["NORD_SERT"],
  "NORD-varaSERT": ["NORD_VARASERT"],
  varaCACIB: ["VARACACIB"],
  "CACIB-J": ["CACIB_J"],
  "CACIB-V": ["CACIB_V"],
  "JUN-SERT": ["JUN_SERT"],
  "VET-SERT": ["VET_SERT"],
  "LEGACY-LAATUARVOSTELU": ["LAATU_NUMERO"],
};

function normalizeDefinitionLookupKey(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9ÅÄÖ]/g, "");
}

function definitionLookupCandidates(code: string): string[] {
  // Try the parser's canonical code first, then any explicit legacy aliases for
  // renamed definitions. Separator-insensitive matching below handles workbook
  // style variants like NORD-SERT vs NORD_SERT.
  const aliases = LEGACY_DEFINITION_CODE_ALIASES[code] ?? [];
  return [code, ...aliases];
}

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
  const definitionIdByCode = new Map(
    definitionRows.map((row) => [row.code, row.id]),
  );
  const definitionIdsByUpperCode = new Map<string, string[]>();
  const definitionIdsByNormalizedCode = new Map<string, string[]>();
  for (const row of definitionRows) {
    const upperCode = row.code.toUpperCase();
    const upperIds = definitionIdsByUpperCode.get(upperCode) ?? [];
    upperIds.push(row.id);
    definitionIdsByUpperCode.set(upperCode, upperIds);

    const normalizedCode = normalizeDefinitionLookupKey(row.code);
    const normalizedIds =
      definitionIdsByNormalizedCode.get(normalizedCode) ?? [];
    normalizedIds.push(row.id);
    definitionIdsByNormalizedCode.set(normalizedCode, normalizedIds);
  }

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
      // Definition rows are seeded data, so exact code matches should win.
      // Fallbacks are only here to avoid losing parsed items if the catalog
      // contains naming variants during the canonical code cutover.
      const lookupCandidates = definitionLookupCandidates(item.definitionCode);
      let definitionId: string | undefined;

      for (const candidate of lookupCandidates) {
        definitionId = definitionIdByCode.get(candidate);
        if (definitionId) break;

        const upperCodeMatches = definitionIdsByUpperCode.get(
          candidate.toUpperCase(),
        );
        if (upperCodeMatches?.length === 1) {
          definitionId = upperCodeMatches[0];
          break;
        }

        const normalizedCodeMatches = definitionIdsByNormalizedCode.get(
          normalizeDefinitionLookupKey(candidate),
        );
        if (normalizedCodeMatches?.length === 1) {
          definitionId = normalizedCodeMatches[0];
          break;
        }
      }

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
