import { listAdminShowWorkbookSchemaRulesDb } from "@beagle/db";
import type { ListAdminShowWorkbookSchemaResponse } from "@beagle/contracts";
import type { ServiceResult } from "../../../core/result";

// Lists the active workbook schema rule set that future admin settings edit in
// place and the preview validator consumes directly.

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
