import type {
  AdminShowWorkbookSchemaRule,
  AdminShowWorkbookSchemaRuleDraft,
  AdminShowWorkbookSchemaValidationError,
} from "@beagle/contracts";
import { normalizeWorkbookComparisonToken } from "../import/internal/cell";

// Validates admin-managed workbook schema rules before they are persisted or
// used by the workbook preview parser.

type DefinitionRef = {
  code: string;
  isEnabled: boolean;
  categoryCode: string;
  valueType: "FLAG" | "CODE" | "TEXT" | "NUMERIC" | "DATE";
};

type CategoryRef = {
  code: string;
  isEnabled: boolean;
};

type RuleDraft = AdminShowWorkbookSchemaRuleDraft & {
  code?: string;
};

const LOOKUP_KEY_TARGET_FIELDS = new Set<
  NonNullable<AdminShowWorkbookSchemaRuleDraft["targetField"]>
>(["REGISTRATION_NO", "EVENT_DATE", "EVENT_CITY", "EVENT_PLACE", "EVENT_TYPE"]);
const DEFINITION_FROM_CELL_TARGET_FIELDS = new Set<
  NonNullable<AdminShowWorkbookSchemaRuleDraft["targetField"]>
>(["CLASS_VALUE", "QUALITY_VALUE"]);

function addError(
  errors: AdminShowWorkbookSchemaValidationError[],
  field: AdminShowWorkbookSchemaValidationError["field"],
  code: string,
  message: string,
) {
  errors.push({ field, code, message });
}

function supportsImportValueType(
  valueType: DefinitionRef["valueType"],
): boolean {
  return (
    valueType === "FLAG" || valueType === "CODE" || valueType === "NUMERIC"
  );
}

export function validateAdminShowWorkbookSchemaRuleDraft(
  input: RuleDraft,
  references: {
    definitions: DefinitionRef[];
    categories: CategoryRef[];
  },
  existingRules: AdminShowWorkbookSchemaRule[] = [],
): AdminShowWorkbookSchemaValidationError[] {
  const errors: AdminShowWorkbookSchemaValidationError[] = [];
  const headerName = input.headerName.trim();
  const normalizedHeader = normalizeWorkbookComparisonToken(headerName);

  if (!headerName) {
    addError(errors, "headerName", "REQUIRED", "Header name is required.");
  }

  const conflictingRule = existingRules.find(
    (rule) =>
      rule.code !== input.code &&
      normalizeWorkbookComparisonToken(rule.headerName) === normalizedHeader,
  );
  if (conflictingRule) {
    addError(
      errors,
      "headerName",
      "DUPLICATE_HEADER_NAME",
      `Header ${headerName} conflicts with existing rule ${conflictingRule.code}.`,
    );
  }

  const definitionsByCode = new Map(
    references.definitions.map((definition) => [definition.code, definition]),
  );
  const categoriesByCode = new Map(
    references.categories.map((category) => [category.code, category]),
  );

  if (input.policy === "IMPORT" && !input.destinationKind) {
    addError(
      errors,
      "destinationKind",
      "DESTINATION_REQUIRED",
      "Imported workbook rules must define a destination kind.",
    );
  }

  if (input.policy === "IGNORE") {
    if (input.destinationKind || input.targetField) {
      addError(
        errors,
        "destinationKind",
        "IGNORE_DESTINATION_FORBIDDEN",
        "Ignored workbook rules cannot define a destination.",
      );
    }
    if (input.fixedDefinitionCode || input.allowedDefinitionCategoryCode) {
      addError(
        errors,
        "fixedDefinitionCode",
        "IGNORE_DEFINITION_FORBIDDEN",
        "Ignored workbook rules cannot reference definitions or categories.",
      );
    }
    if (input.valueMaps.length > 0) {
      addError(
        errors,
        "valueMaps",
        "IGNORE_VALUE_MAPS_FORBIDDEN",
        "Ignored workbook rules cannot define value maps.",
      );
    }
  }

  if (
    input.targetField &&
    LOOKUP_KEY_TARGET_FIELDS.has(input.targetField) &&
    (!input.headerRequired || !input.rowValueRequired)
  ) {
    addError(
      errors,
      "rowValueRequired",
      "LOOKUP_KEY_FIELD_REQUIRED",
      `Lookup-key field ${input.targetField} must stay required in workbook metadata.`,
    );
  }

  if (
    input.targetField &&
    LOOKUP_KEY_TARGET_FIELDS.has(input.targetField) &&
    input.policy !== "IMPORT"
  ) {
    addError(
      errors,
      "policy",
      "LOOKUP_KEY_FIELD_IMPORT_REQUIRED",
      `Lookup-key field ${input.targetField} must stay imported in workbook metadata.`,
    );
  }

  if (
    input.targetField &&
    LOOKUP_KEY_TARGET_FIELDS.has(input.targetField) &&
    !input.isEnabled
  ) {
    addError(
      errors,
      "policy",
      "LOOKUP_KEY_FIELD_ENABLED_REQUIRED",
      `Lookup-key field ${input.targetField} must stay enabled in workbook metadata.`,
    );
  }

  if (input.parseMode === "VALUE_MAP") {
    if (input.valueMaps.length === 0) {
      addError(
        errors,
        "valueMaps",
        "VALUE_MAPS_REQUIRED",
        "VALUE_MAP rules must define at least one workbook value mapping.",
      );
    }
    if (input.fixedDefinitionCode) {
      addError(
        errors,
        "fixedDefinitionCode",
        "FIXED_DEFINITION_FORBIDDEN",
        "VALUE_MAP rules cannot define a fixed definition code.",
      );
    }
    if (input.destinationKind !== "SHOW_RESULT_ITEM") {
      addError(
        errors,
        "destinationKind",
        "RESULT_ITEM_DESTINATION_REQUIRED",
        "VALUE_MAP rules must target show result items.",
      );
    }
    if (input.targetField) {
      addError(
        errors,
        "targetField",
        "TARGET_FIELD_NOT_ALLOWED",
        "VALUE_MAP rules cannot define a target field.",
      );
    }
  } else if (input.valueMaps.length > 0) {
    addError(
      errors,
      "valueMaps",
      "VALUE_MAPS_NOT_ALLOWED",
      "Only VALUE_MAP rules can define workbook value maps.",
    );
  }

  if (
    input.parseMode === "FIXED_FLAG" ||
    input.parseMode === "FIXED_NUMERIC" ||
    input.parseMode === "FIXED_CODE"
  ) {
    if (!input.fixedDefinitionCode) {
      addError(
        errors,
        "fixedDefinitionCode",
        "FIXED_DEFINITION_REQUIRED",
        `${input.parseMode} rules must reference a fixed definition code.`,
      );
    }
    if (input.destinationKind !== "SHOW_RESULT_ITEM") {
      addError(
        errors,
        "destinationKind",
        "RESULT_ITEM_DESTINATION_REQUIRED",
        `${input.parseMode} rules must target show result items.`,
      );
    }
    if (input.targetField) {
      addError(
        errors,
        "targetField",
        "TARGET_FIELD_NOT_ALLOWED",
        `${input.parseMode} rules cannot define a target field.`,
      );
    }
  }

  if (
    input.parseMode === "TEXT" ||
    input.parseMode === "DATE" ||
    input.parseMode === "DEFINITION_FROM_CELL"
  ) {
    if (!input.targetField && input.policy === "IMPORT") {
      addError(
        errors,
        "targetField",
        "TARGET_FIELD_REQUIRED",
        `${input.parseMode} rules must define a target field.`,
      );
    }
  }

  if (
    input.parseMode !== "DEFINITION_FROM_CELL" &&
    input.targetField &&
    DEFINITION_FROM_CELL_TARGET_FIELDS.has(input.targetField)
  ) {
    addError(
      errors,
      "targetField",
      "TARGET_FIELD_PARSE_MODE_MISMATCH",
      `${input.targetField} must use DEFINITION_FROM_CELL parse mode.`,
    );
  }

  if (input.parseMode === "DEFINITION_FROM_CELL") {
    if (!input.allowedDefinitionCategoryCode) {
      addError(
        errors,
        "allowedDefinitionCategoryCode",
        "CATEGORY_REQUIRED",
        "DEFINITION_FROM_CELL rules must define an allowed definition category.",
      );
    }
    if (input.destinationKind !== "SHOW_RESULT_ITEM") {
      addError(
        errors,
        "destinationKind",
        "RESULT_ITEM_DESTINATION_REQUIRED",
        "DEFINITION_FROM_CELL rules must target show result items.",
      );
    }
    if (
      input.targetField &&
      !DEFINITION_FROM_CELL_TARGET_FIELDS.has(input.targetField)
    ) {
      addError(
        errors,
        "targetField",
        "TARGET_FIELD_PARSE_MODE_MISMATCH",
        "DEFINITION_FROM_CELL rules must target CLASS_VALUE or QUALITY_VALUE.",
      );
    }
  } else if (input.allowedDefinitionCategoryCode) {
    addError(
      errors,
      "allowedDefinitionCategoryCode",
      "CATEGORY_NOT_ALLOWED",
      `${input.parseMode} rules cannot define an allowed definition category.`,
    );
  }

  if (input.fixedDefinitionCode) {
    const definition = definitionsByCode.get(input.fixedDefinitionCode);
    if (!definition) {
      addError(
        errors,
        "fixedDefinitionCode",
        "DEFINITION_NOT_FOUND",
        `Definition ${input.fixedDefinitionCode} does not exist.`,
      );
    } else if (!definition.isEnabled) {
      addError(
        errors,
        "fixedDefinitionCode",
        "DEFINITION_DISABLED",
        `Definition ${input.fixedDefinitionCode} is disabled.`,
      );
    } else if (!supportsImportValueType(definition.valueType)) {
      addError(
        errors,
        "fixedDefinitionCode",
        "UNSUPPORTED_VALUE_TYPE",
        `Definition ${input.fixedDefinitionCode} uses unsupported value type ${definition.valueType}.`,
      );
    } else if (
      input.parseMode === "FIXED_FLAG" &&
      definition.valueType !== "FLAG"
    ) {
      addError(
        errors,
        "fixedDefinitionCode",
        "INVALID_VALUE_TYPE",
        `Definition ${input.fixedDefinitionCode} must use FLAG value type for FIXED_FLAG.`,
      );
    } else if (
      input.parseMode === "FIXED_NUMERIC" &&
      definition.valueType !== "NUMERIC"
    ) {
      addError(
        errors,
        "fixedDefinitionCode",
        "INVALID_VALUE_TYPE",
        `Definition ${input.fixedDefinitionCode} must use NUMERIC value type for FIXED_NUMERIC.`,
      );
    } else if (
      input.parseMode === "FIXED_CODE" &&
      definition.valueType !== "CODE"
    ) {
      addError(
        errors,
        "fixedDefinitionCode",
        "INVALID_VALUE_TYPE",
        `Definition ${input.fixedDefinitionCode} must use CODE value type for FIXED_CODE.`,
      );
    }
  }

  if (input.allowedDefinitionCategoryCode) {
    const category = categoriesByCode.get(input.allowedDefinitionCategoryCode);
    if (!category) {
      addError(
        errors,
        "allowedDefinitionCategoryCode",
        "CATEGORY_NOT_FOUND",
        `Category ${input.allowedDefinitionCategoryCode} does not exist.`,
      );
    } else if (!category.isEnabled) {
      addError(
        errors,
        "allowedDefinitionCategoryCode",
        "CATEGORY_DISABLED",
        `Category ${input.allowedDefinitionCategoryCode} is disabled.`,
      );
    }
  }

  const seenWorkbookValues = new Set<string>();
  for (const valueMap of input.valueMaps) {
    const workbookValue = valueMap.workbookValue.trim();
    if (!workbookValue) {
      addError(
        errors,
        "valueMaps",
        "EMPTY_WORKBOOK_VALUE",
        "Value map workbook values cannot be empty.",
      );
      continue;
    }

    const normalizedWorkbookValue =
      normalizeWorkbookComparisonToken(workbookValue);
    if (seenWorkbookValues.has(normalizedWorkbookValue)) {
      addError(
        errors,
        "valueMaps",
        "DUPLICATE_WORKBOOK_VALUE",
        `Duplicate workbook value mapping for ${workbookValue}.`,
      );
      continue;
    }
    seenWorkbookValues.add(normalizedWorkbookValue);

    const definition = definitionsByCode.get(valueMap.definitionCode);
    if (!definition) {
      addError(
        errors,
        "valueMaps",
        "DEFINITION_NOT_FOUND",
        `Definition ${valueMap.definitionCode} does not exist.`,
      );
      continue;
    }
    if (!definition.isEnabled) {
      addError(
        errors,
        "valueMaps",
        "DEFINITION_DISABLED",
        `Definition ${valueMap.definitionCode} is disabled.`,
      );
      continue;
    }
    if (!supportsImportValueType(definition.valueType)) {
      addError(
        errors,
        "valueMaps",
        "UNSUPPORTED_VALUE_TYPE",
        `Definition ${valueMap.definitionCode} uses unsupported value type ${definition.valueType}.`,
      );
      continue;
    }
    if (input.parseMode === "VALUE_MAP" && definition.valueType !== "FLAG") {
      addError(
        errors,
        "valueMaps",
        "INVALID_VALUE_TYPE",
        `Definition ${valueMap.definitionCode} must use FLAG value type for VALUE_MAP.`,
      );
    }
  }

  return errors;
}

export function validateAdminShowWorkbookSchemaRules(
  rules: AdminShowWorkbookSchemaRule[],
  references: {
    definitions: DefinitionRef[];
    categories: CategoryRef[];
  },
): AdminShowWorkbookSchemaValidationError[] {
  return rules.flatMap((rule) =>
    validateAdminShowWorkbookSchemaRuleDraft(rule, references, rules),
  );
}
