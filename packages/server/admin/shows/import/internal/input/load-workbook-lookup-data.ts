import { loadAdminShowWorkbookImportLookupDataDb } from "@beagle/db";
import { mapTargetFieldToWorkbookStructuralFieldKey } from "../workbook-preview-target-fields";
import type {
  WorkbookColumnRuleMeta,
  WorkbookLookupData,
} from "../workbook-preview-types";

// Loads and normalizes all DB-backed workbook lookup metadata in one boundary call.
export async function loadWorkbookLookupData(input?: {
  registrationNos?: string[];
}): Promise<WorkbookLookupData> {
  const lookupData = await loadAdminShowWorkbookImportLookupDataDb({
    registrationNos: input?.registrationNos,
  });
  const registrations = lookupData.dogRegistrations;
  const definitions = lookupData.definitions;
  const categories = lookupData.categories;
  const columnRules = lookupData.columnRules;

  const definitionsByCode = new Map(
    definitions.map((definition) => [
      definition.code,
      {
        id: definition.id,
        code: definition.code,
        isEnabled: definition.isEnabled,
        valueType: definition.valueType,
        categoryCode: definition.categoryCode,
      },
    ]),
  );

  const normalizedColumnRules: WorkbookColumnRuleMeta[] = columnRules.map(
    (rule) => ({
      code: rule.code,
      headerName: rule.headerName,
      policy: rule.policy,
      destinationKind: rule.destinationKind,
      targetField: mapTargetFieldToWorkbookStructuralFieldKey(rule.targetField),
      parseMode: rule.parseMode,
      fixedDefinitionCode: rule.fixedDefinitionCode,
      allowedDefinitionCategoryCode: rule.allowedDefinitionCategoryCode,
      headerRequired: rule.headerRequired,
      rowValueRequired: rule.rowValueRequired,
      sortOrder: rule.sortOrder,
      isEnabled: rule.isEnabled,
      valueMaps: rule.valueMaps.map((valueMap) => ({
        workbookValue: valueMap.workbookValue,
        definitionCode: valueMap.definitionCode,
        sortOrder: valueMap.sortOrder,
      })),
    }),
  );

  return {
    dogIdByRegistration: new Map(
      registrations.map((registration) => [
        registration.registrationNo,
        registration.dogId,
      ]),
    ),
    enabledDefinitionCodes: new Set(
      definitions
        .filter((definition) => definition.isEnabled)
        .map((definition) => definition.code),
    ),
    definitionsByCode,
    definitionCategories: categories,
    definitionCount: definitions.length,
    columnRules: normalizedColumnRules,
    columnRuleCount: normalizedColumnRules.length,
  };
}
