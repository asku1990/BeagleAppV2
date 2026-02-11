import type { ImportStatusResponse } from "@beagle/contracts";
import type { RequestFn } from "../core/request";

export function getImportStatus(request: RequestFn) {
  return request<ImportStatusResponse>("/api/import/example", {
    method: "GET",
  });
}
