import {
  listAdminShowWorkbookSchemaReferenceDataDb,
  listAdminShowWorkbookSchemaRulesDb,
  updateAdminShowWorkbookSchemaRuleDb,
} from "@beagle/db";
import type {
  UpdateAdminShowWorkbookSchemaRuleRequest,
  UpdateAdminShowWorkbookSchemaRuleResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "../../../core/result";
import { validateAdminShowWorkbookSchemaRuleDraft } from "../core/workbook-schema-validation";

export async function updateAdminShowWorkbookSchemaRule(
  input: UpdateAdminShowWorkbookSchemaRuleRequest,
): Promise<ServiceResult<UpdateAdminShowWorkbookSchemaRuleResponse>> {
  const [references, rules] = await Promise.all([
    listAdminShowWorkbookSchemaReferenceDataDb(),
    listAdminShowWorkbookSchemaRulesDb(),
  ]);

  const errors = validateAdminShowWorkbookSchemaRuleDraft(
    { code: input.code, ...input.rule },
    references,
    rules,
  );

  if (errors.length > 0) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Workbook schema rule is invalid.",
        code: "INVALID_SHOW_WORKBOOK_SCHEMA_RULE",
      },
    };
  }

  const rule = await updateAdminShowWorkbookSchemaRuleDb({
    code: input.code,
    ...input.rule,
  });

  return {
    status: 200,
    body: {
      ok: true,
      data: { rule },
    },
  };
}
