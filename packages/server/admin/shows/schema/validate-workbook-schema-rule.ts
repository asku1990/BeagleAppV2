import {
  listAdminShowWorkbookSchemaReferenceDataDb,
  listAdminShowWorkbookSchemaRulesDb,
} from "@beagle/db";
import type {
  ValidateAdminShowWorkbookSchemaRuleRequest,
  ValidateAdminShowWorkbookSchemaRuleResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../../../core/result";
import { validateAdminShowWorkbookSchemaRuleDraft } from "../core/workbook-schema-validation";

export async function validateAdminShowWorkbookSchemaRule(
  input: ValidateAdminShowWorkbookSchemaRuleRequest,
): Promise<ServiceResult<ValidateAdminShowWorkbookSchemaRuleResponse>> {
  const [references, rules] = await Promise.all([
    listAdminShowWorkbookSchemaReferenceDataDb(),
    listAdminShowWorkbookSchemaRulesDb(),
  ]);

  const errors = validateAdminShowWorkbookSchemaRuleDraft(
    input,
    references,
    rules,
  );

  return {
    status: 200,
    body: {
      ok: true,
      data: {
        valid: errors.length === 0,
        errors,
      },
    },
  };
}
