import type { ImportRunResponse } from "@beagle/contracts";
import type { RequestFn } from "../core/request";

export function getImportRun(request: RequestFn, id: string) {
  return request<ImportRunResponse>(`/api/v1/imports/${id}`, {
    method: "GET",
  });
}
