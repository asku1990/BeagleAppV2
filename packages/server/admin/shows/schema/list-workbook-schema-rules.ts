import { listAdminShowWorkbookSchemaRulesDb } from "@beagle/db";
import type { ListAdminShowWorkbookSchemaResponse } from "@beagle/contracts";
import type { ServiceResult } from "../../../core/result";

export async function listAdminShowWorkbookSchemaRules(): Promise<
  ServiceResult<ListAdminShowWorkbookSchemaResponse>
> {
  const rules = await listAdminShowWorkbookSchemaRulesDb();
  return {
    status: 200,
    body: {
      ok: true,
      data: { rules },
    },
  };
}
