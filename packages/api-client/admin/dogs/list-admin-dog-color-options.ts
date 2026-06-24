import type { AdminDogColorLookupResponse } from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

export function listAdminDogColorOptions(request: RequestFn) {
  return request<AdminDogColorLookupResponse>(
    "/api/admin/dogs/lookups/colors",
    {
      method: "GET",
    },
  );
}
