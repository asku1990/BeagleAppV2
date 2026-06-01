import type {
  AdminDogProfileRequest,
  AdminDogProfileResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

export function getAdminDogProfile(
  request: RequestFn,
  input: AdminDogProfileRequest,
) {
  return request<AdminDogProfileResponse>(
    `/api/admin/dogs/${encodeURIComponent(input.dogId)}/profile`,
    {
      method: "GET",
    },
  );
}
