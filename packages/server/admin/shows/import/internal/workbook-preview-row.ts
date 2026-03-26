import type { AdminShowWorkbookImportIssue } from "@beagle/contracts";
import {
  isWorkbookRegistrationNoValid,
  normalizeWorkbookDateIso,
  normalizeWorkbookRegistrationNo,
  normalizeWorkbookTextCell,
} from "./cell";
import { ISSUE_CODES } from "./workbook-preview-constants";
import {
  createIssue,
  buildEventLookupKey,
  buildMissingValueIssues,
} from "./workbook-preview-mappers";
import { getCell } from "./workbook-preview-io";
import { buildWorkbookPreviewItems } from "./workbook-preview-row-items";
import { createWorkbookRowParseResult } from "./workbook-preview-row-result";
import type {
  WorkbookColumnMap,
  WorkbookResolvedStructuralField,
  WorkbookRowLookupData,
  WorkbookRow,
  WorkbookRowParseResult,
  WorkbookStructuralFieldKey,
} from "./workbook-preview-types";

function getStructuralField(
  schema: WorkbookRowLookupData["schema"],
  key: WorkbookStructuralFieldKey,
): WorkbookResolvedStructuralField | null {
  return schema.structuralFields[key] ?? null;
}

function getStructuralCell(
  row: WorkbookRow,
  columnMap: WorkbookColumnMap,
  schema: WorkbookRowLookupData["schema"],
  key: WorkbookStructuralFieldKey,
) {
  const field = getStructuralField(schema, key);
  return field ? getCell(row, columnMap, field.headerName) : null;
}

function buildRejectedResult(
  issues: AdminShowWorkbookImportIssue[],
  overrides: Omit<
    WorkbookRowParseResult,
    "issues" | "accepted" | "itemCount" | "resultItems"
  >,
): WorkbookRowParseResult {
  return createWorkbookRowParseResult({
    issues,
    accepted: false,
    itemCount: 0,
    resultItems: [],
    ...overrides,
  });
}

export function parseWorkbookRow(
  row: WorkbookRow,
  columnMap: WorkbookColumnMap,
  rowNumber: number,
  options: WorkbookRowLookupData,
): WorkbookRowParseResult {
  const issues: AdminShowWorkbookImportIssue[] = [];
  const registrationField = getStructuralField(
    options.schema,
    "registrationNo",
  );
  const eventDateField = getStructuralField(options.schema, "eventDate");
  const eventCityField = getStructuralField(options.schema, "eventCity");
  const eventPlaceField = getStructuralField(options.schema, "eventPlace");
  const eventTypeField = getStructuralField(options.schema, "eventType");
  const dogNameField = getStructuralField(options.schema, "dogName");
  const classField = getStructuralField(options.schema, "classValue");
  const qualityField = getStructuralField(options.schema, "qualityValue");

  const registrationNo = normalizeWorkbookRegistrationNo(
    getStructuralCell(row, columnMap, options.schema, "registrationNo"),
  );
  if (!registrationNo) {
    issues.push(
      createIssue({
        rowNumber,
        columnName:
          registrationField?.headerName ??
          registrationField?.label ??
          "Rekisterinumero",
        severity: "ERROR",
        code: ISSUE_CODES.invalidRegistration,
        message: "Registration number is required.",
        registrationNo: null,
        eventLookupKey: null,
      }),
    );
    return buildRejectedResult(issues, {
      eventLookupKey: null,
      eventDateIso: null,
      eventCity: null,
      eventPlace: null,
      eventType: null,
      registrationNo: null,
      dogName: null,
      dogMatched: false,
      judge: null,
      critiqueText: null,
      classValue: null,
      qualityValue: null,
    });
  }

  if (!isWorkbookRegistrationNoValid(registrationNo)) {
    issues.push(
      createIssue({
        rowNumber,
        columnName:
          registrationField?.headerName ??
          registrationField?.label ??
          "Rekisterinumero",
        severity: "ERROR",
        code: ISSUE_CODES.invalidRegistration,
        message: "Registration number has an invalid format.",
        registrationNo,
        eventLookupKey: null,
      }),
    );
    return buildRejectedResult(issues, {
      eventLookupKey: null,
      eventDateIso: null,
      eventCity: null,
      eventPlace: null,
      eventType: null,
      registrationNo,
      dogName: null,
      dogMatched: false,
      judge: null,
      critiqueText: null,
      classValue: null,
      qualityValue: null,
    });
  }

  const eventDateIso = normalizeWorkbookDateIso(
    getStructuralCell(row, columnMap, options.schema, "eventDate"),
  );
  if (!eventDateIso) {
    issues.push(
      createIssue({
        rowNumber,
        columnName:
          eventDateField?.headerName ?? eventDateField?.label ?? "Aika",
        severity: "ERROR",
        code: ISSUE_CODES.invalidDate,
        message: "Event date is required and must be a valid date.",
        registrationNo,
        eventLookupKey: null,
      }),
    );
    return buildRejectedResult(issues, {
      eventLookupKey: null,
      eventDateIso: null,
      eventCity: null,
      eventPlace: null,
      eventType: null,
      registrationNo,
      dogName: null,
      dogMatched: false,
      judge: null,
      critiqueText: null,
      classValue: null,
      qualityValue: null,
    });
  }

  const eventCity = normalizeWorkbookTextCell(
    getStructuralCell(row, columnMap, options.schema, "eventCity"),
  );
  const eventPlace = normalizeWorkbookTextCell(
    getStructuralCell(row, columnMap, options.schema, "eventPlace"),
  );
  const eventType = normalizeWorkbookTextCell(
    getStructuralCell(row, columnMap, options.schema, "eventType"),
  );
  const dogName = normalizeWorkbookTextCell(
    getStructuralCell(row, columnMap, options.schema, "dogName"),
  );
  const classValue = normalizeWorkbookTextCell(
    getStructuralCell(row, columnMap, options.schema, "classValue"),
  );
  const qualityValue = normalizeWorkbookTextCell(
    getStructuralCell(row, columnMap, options.schema, "qualityValue"),
  );
  const judge = normalizeWorkbookTextCell(
    getStructuralCell(row, columnMap, options.schema, "judge"),
  );
  const critiqueText = normalizeWorkbookTextCell(
    getStructuralCell(row, columnMap, options.schema, "critiqueText"),
  );

  issues.push(
    ...buildMissingValueIssues(rowNumber, registrationNo, [
      [
        eventCityField?.headerName ?? eventCityField?.label ?? "Paikkakunta",
        eventCity,
      ],
      [
        eventPlaceField?.headerName ?? eventPlaceField?.label ?? "Paikka",
        eventPlace,
      ],
      [
        eventTypeField?.headerName ?? eventTypeField?.label ?? "Näyttelytyyppi",
        eventType,
      ],
      [dogNameField?.headerName ?? dogNameField?.label ?? "Nimi", dogName],
      [classField?.headerName ?? classField?.label ?? "Luokka", classValue],
      [
        qualityField?.headerName ?? qualityField?.label ?? "Laatuarvostelu",
        qualityValue,
      ],
    ]),
  );

  if (issues.some((issue) => issue.severity === "ERROR")) {
    return buildRejectedResult(issues, {
      eventLookupKey: null,
      eventDateIso,
      eventCity: eventCity ?? null,
      eventPlace: eventPlace ?? null,
      eventType: eventType ?? null,
      registrationNo,
      dogName: dogName ?? null,
      dogMatched: false,
      judge,
      critiqueText,
      classValue: classValue ?? null,
      qualityValue: qualityValue ?? null,
    });
  }

  const eventCityValue = eventCity ?? "";
  const eventPlaceValue = eventPlace ?? "";
  const eventTypeValue = eventType ?? "";
  const classValueText = classValue ?? "";
  const qualityValueText = qualityValue ?? "";
  const eventLookupKey = buildEventLookupKey({
    eventDateIso,
    eventCity: eventCityValue,
    eventPlace: eventPlaceValue,
    eventType: eventTypeValue,
  });
  const resultItems = buildWorkbookPreviewItems({
    row,
    columnMap,
    schema: options.schema,
    rowNumber,
    registrationNo,
    eventLookupKey,
    classValue: classValueText,
    qualityValue: qualityValueText,
    issues,
  });

  const dogMatched = options.dogIdByRegistration.has(registrationNo);
  if (!dogMatched) {
    issues.push(
      createIssue({
        rowNumber,
        columnName:
          registrationField?.headerName ??
          registrationField?.label ??
          "Rekisterinumero",
        severity: "WARNING",
        code: ISSUE_CODES.dogMissing,
        message: `No local dog found for registration number ${registrationNo}.`,
        registrationNo,
        eventLookupKey,
      }),
    );
  }

  const missingDefinitions = resultItems
    .map((item) => item.definitionCode)
    .filter(
      (definitionCode) => !options.enabledDefinitionCodes.has(definitionCode),
    );
  for (const missingDefinition of missingDefinitions) {
    issues.push(
      createIssue({
        rowNumber,
        columnName: null,
        severity: "ERROR",
        code: ISSUE_CODES.definitionMissing,
        message: `Show result definition is missing or disabled: ${missingDefinition}.`,
        registrationNo,
        eventLookupKey,
      }),
    );
  }

  if (issues.some((issue) => issue.severity === "ERROR")) {
    return buildRejectedResult(issues, {
      eventLookupKey,
      eventDateIso,
      eventCity: eventCityValue,
      eventPlace: eventPlaceValue,
      eventType: eventTypeValue,
      registrationNo,
      dogName: dogName ?? "",
      dogMatched,
      judge,
      critiqueText,
      classValue: classValueText,
      qualityValue: qualityValueText,
    });
  }

  return createWorkbookRowParseResult({
    issues,
    accepted: true,
    eventLookupKey,
    itemCount: resultItems.length,
    eventDateIso,
    eventCity: eventCityValue,
    eventPlace: eventPlaceValue,
    eventType: eventTypeValue,
    registrationNo,
    dogName: dogName ?? "",
    dogMatched,
    judge,
    critiqueText,
    classValue: classValueText,
    qualityValue: qualityValueText,
    resultItems,
  });
}
