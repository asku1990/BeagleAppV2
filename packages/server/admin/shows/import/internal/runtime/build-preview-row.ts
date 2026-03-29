import { buildEventLookupKey } from "../workbook-preview-mappers";
import { getCell } from "../input/get-cell";
import { normalizeWorkbookRegistrationNo } from "../cell";
import type {
  WorkbookColumnMap,
  WorkbookParsedRow,
  WorkbookResolvedSchema,
  WorkbookRow,
  WorkbookRowParseResult,
} from "../workbook-preview-types";

function resolveEventLookupKey(input: {
  parsed: WorkbookRowParseResult;
  rowNumber: number;
}): string {
  const { parsed, rowNumber } = input;
  if (parsed.eventLookupKey) {
    return parsed.eventLookupKey;
  }

  if (
    parsed.eventDateIso &&
    parsed.eventCity &&
    parsed.eventPlace &&
    parsed.eventType
  ) {
    return buildEventLookupKey({
      eventDateIso: parsed.eventDateIso,
      eventCity: parsed.eventCity,
      eventPlace: parsed.eventPlace,
      eventType: parsed.eventType,
    });
  }

  return `row-${rowNumber}`;
}

function resolveRegistrationNo(input: {
  parsed: WorkbookRowParseResult;
  row: WorkbookRow;
  columnMap: WorkbookColumnMap;
  schema: WorkbookResolvedSchema;
}): string {
  if (input.parsed.registrationNo) {
    return input.parsed.registrationNo;
  }

  const registrationColumn =
    input.schema.structuralFields.registrationNo?.headerName ??
    "Rekisterinumero";
  return (
    normalizeWorkbookRegistrationNo(
      getCell(input.row, input.columnMap, registrationColumn),
    ) ?? ""
  );
}

// Converts a row parse result into the preview/apply row shape shared by later runtime stages.
export function buildPreviewRow(input: {
  parsed: WorkbookRowParseResult;
  row: WorkbookRow;
  rowNumber: number;
  columnMap: WorkbookColumnMap;
  schema: WorkbookResolvedSchema;
}): { previewRow: WorkbookParsedRow; entryLookupKey: string } {
  const eventLookupKey = resolveEventLookupKey(input);
  const registrationNo = resolveRegistrationNo(input);
  const previewRow: WorkbookParsedRow = {
    rowNumber: input.rowNumber,
    eventLookupKey,
    eventDateIso: input.parsed.eventDateIso ?? "",
    eventCity: input.parsed.eventCity ?? "",
    eventPlace: input.parsed.eventPlace ?? "",
    eventType: input.parsed.eventType ?? "",
    accepted: input.parsed.accepted,
    issueCount: input.parsed.issues.length,
    itemCount: input.parsed.accepted ? input.parsed.itemCount : 0,
    registrationNo: input.parsed.registrationNo ?? "",
    dogName: input.parsed.dogName ?? "",
    dogMatched: input.parsed.dogMatched,
    judge: input.parsed.judge,
    critiqueText: input.parsed.critiqueText,
    classValue: input.parsed.classValue ?? "",
    qualityValue: input.parsed.qualityValue ?? "",
    resultItems: input.parsed.accepted ? input.parsed.resultItems : [],
  };

  return {
    previewRow,
    entryLookupKey: `${registrationNo}|${eventLookupKey}`,
  };
}
