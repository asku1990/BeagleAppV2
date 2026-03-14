import { prisma, type LegacyShowResultRow } from "@beagle/db";
import { createHash } from "node:crypto";
import {
  isValidRegistrationNo,
  normalizeNullable,
  normalizeRegistrationNo,
  parseLegacyDate,
} from "../core";
import { normalizeShowResult } from "../../shows/core";
import { toEventSourceDatePart } from "./date-key";

type ShowSourceTagValue =
  | "LEGACY_NAY9599"
  | "LEGACY_BEANAY"
  | "LEGACY_BEANAY_TEXT"
  | "WORKBOOK_KENNELLIITTO"
  | "MANUAL_ADMIN";

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

const REQUIRED_SHOW_DEFINITION_CODES = [
  "ERI",
  "EH",
  "H",
  "T",
  "EVA",
  "HYL",
  "PUPN",
  "SIJOITUS",
  "ROP",
  "VSP",
  "SA",
  "KP",
  "SERT",
  "VARASERT",
  "CACIB",
  "VARACACIB",
] as const;

export async function getMissingRequiredShowDefinitionCodes(): Promise<
  string[]
> {
  const requiredCodes = [...REQUIRED_SHOW_DEFINITION_CODES];
  const existing = await prisma.showResultDefinition.findMany({
    where: { code: { in: requiredCodes }, isEnabled: true },
    select: { code: true },
  });
  const existingCodes = new Set(existing.map((row) => row.code));
  return requiredCodes.filter((code) => !existingCodes.has(code));
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
    definitionRows.map((row) => [row.code.toUpperCase(), row.id]),
  );

  const CLASS_CODES = new Set([
    "BAB",
    "PEN",
    "JUN",
    "NUO",
    "AVO",
    "KÄY",
    "KAY",
    "VAL",
    "VET",
  ]);
  const QUALITY_CODES = new Set(["ERI", "EH", "H", "T", "EVA", "HYL"]);
  const FLAG_TOKEN_CODES = new Set([
    "ROP",
    "VSP",
    "SA",
    "KP",
    "SERT",
    "VARASERT",
    "CACIB",
    "VARACACIB",
    "NORD_SERT",
    "NORD_VARASERT",
    "JUN_SERT",
    "VET_SERT",
    "CACIB_J",
    "CACIB_V",
    "JUN_ROP",
    "JUN_VSP",
    "VET_ROP",
    "VET_VSP",
    "MVA",
    "JMVA",
    "VMVA",
  ]);

  const normalizePlaceKey = (value: string) =>
    value.normalize("NFKC").trim().replace(/\s+/g, " ").toUpperCase();
  const toSourceTag = (
    table: LegacyShowResultRow["sourceTable"],
  ): ShowSourceTagValue =>
    table === "beanay"
      ? "LEGACY_BEANAY"
      : table === "nay9599_rd_ud"
        ? "LEGACY_NAY9599"
        : "LEGACY_NAY9599";
  const tokenToDefinitionCode = (token: string): string | null => {
    const normalized = token.toUpperCase();
    if (FLAG_TOKEN_CODES.has(normalized)) return normalized;
    if (QUALITY_CODES.has(normalized)) return normalized;
    if (/^(PU|PN)\d+$/.test(normalized)) return "PUPN";
    return null;
  };
  const tokenizeResult = (value: string): string[] =>
    value
      .replace(/[;]+/g, ",")
      .split(",")
      .flatMap((segment) => segment.split(/\s+/))
      .map((token) =>
        token.trim().replace(/^[^A-Za-zÅÄÖ0-9]+|[^A-Za-zÅÄÖ0-9]+$/g, ""),
      )
      .filter((token) => token.length > 0);
  const sourceHash = (value: string) =>
    createHash("sha256").update(value, "utf8").digest("hex");

  const total = rows.length;
  let upserted = 0;
  let errors = 0;
  let processed = 0;
  const issues: Array<{
    code: string;
    message: string;
    registrationNo: string | null;
    sourceTable: string;
    payloadJson: string;
  }> = [];

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
      if (processed % 1000 === 0) {
        options?.onProgress?.(processed, total);
      }
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
      if (processed % 1000 === 0) {
        options?.onProgress?.(processed, total);
      }
      continue;
    }

    const normalizedEventDate = toEventSourceDatePart(eventDate);
    const normalizedEventPlaceKey = normalizePlaceKey(eventPlace);
    const sourceTag = toSourceTag(row.sourceTable);
    const eventLookupKey = `${normalizedEventDate}|${normalizedEventPlaceKey}`;
    const entryLookupKey = `${registrationNo}|${eventLookupKey}`;
    const sourceRef = `${registrationNo}|${normalizedEventDate}|${eventPlace}`;
    const rawResultText = normalizeNullable(row.resultText);
    const normalizedResultText = normalizeShowResult(
      rawResultText,
      normalizedEventDate,
    );
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
        sourceTag,
        eventDate,
        eventPlace,
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
      select: { id: true },
    });

    const classAndQualityMatch = normalizedResultText
      ? normalizedResultText.match(/\b([A-ZÅÄÖ]{3})-(ERI|EH|H|T|EVA|HYL)\b/)
      : null;
    const className = classAndQualityMatch?.[1]?.toUpperCase() ?? null;
    const qualityGrade = classAndQualityMatch?.[2]?.toUpperCase() ?? null;

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
        className,
        qualityGrade,
        placement: null,
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
          resultTextNormalized: normalizedResultText,
          critiqueText: row.critiqueText,
        }),
      },
      update: {
        showEventId: showEvent.id,
        dogId,
        sourceTag,
        dogNameSnapshot: normalizeNullable(row.dogName) ?? registrationNo,
        className,
        qualityGrade,
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
          resultTextNormalized: normalizedResultText,
          critiqueText: row.critiqueText,
        }),
      },
      select: { id: true },
    });

    const tokens = normalizedResultText
      ? tokenizeResult(normalizedResultText)
      : [];
    let itemIndex = 0;
    for (const token of tokens) {
      const upperToken = token.toUpperCase();
      if (CLASS_CODES.has(upperToken)) {
        continue;
      }
      const hyphenMatch = upperToken.match(
        /^([A-ZÅÄÖ]{3})-(ERI|EH|H|T|EVA|HYL)$/,
      );
      const candidate = hyphenMatch ? hyphenMatch[2] : upperToken;
      const definitionCode = tokenToDefinitionCode(candidate);
      if (!definitionCode) {
        continue;
      }
      const definitionId = definitionIdByCode.get(definitionCode);
      if (!definitionId) {
        errors += 1;
        issues.push({
          code: "SHOW_RESULT_DEFINITION_NOT_FOUND",
          message: `No ShowResultDefinition found for code=${definitionCode}.`,
          registrationNo,
          sourceTable: row.sourceTable,
          payloadJson: JSON.stringify({
            token: upperToken,
            definitionCode,
            entryLookupKey,
          }),
        });
        continue;
      }
      itemIndex += 1;
      const valueCode = definitionCode === "PUPN" ? upperToken : null;
      const itemLookupKey = `${entryLookupKey}|${definitionCode}|${valueCode ?? "flag"}|${itemIndex}`;
      await prisma.showResultItem.upsert({
        where: { itemLookupKey },
        create: {
          itemLookupKey,
          sourceRowHash: sourceHash(`${rowFingerprint}|${itemLookupKey}`),
          showEntryId: showEntry.id,
          definitionId,
          sourceTag,
          valueCode,
          valueText: null,
          valueNumeric: null,
          valueDate: null,
          isAwarded: definitionCode === "PUPN" ? null : true,
          importRunId: options?.importRunId ?? null,
          sourceTable: row.sourceTable,
          sourceRef,
          rawPayloadJson: JSON.stringify({
            token: upperToken,
            definitionCode,
            resultTextRaw: rawResultText,
            resultTextNormalized: normalizedResultText,
          }),
        },
        update: {
          definitionId,
          sourceTag,
          valueCode,
          isAwarded: definitionCode === "PUPN" ? null : true,
          importRunId: options?.importRunId ?? null,
          sourceTable: row.sourceTable,
          sourceRef,
          rawPayloadJson: JSON.stringify({
            token: upperToken,
            definitionCode,
            resultTextRaw: rawResultText,
            resultTextNormalized: normalizedResultText,
          }),
        },
      });
    }

    upserted += 1;
    if (processed % 1000 === 0) {
      options?.onProgress?.(processed, total);
    }
  }

  options?.onProgress?.(processed, total);
  return { upserted, errors, issues };
}
