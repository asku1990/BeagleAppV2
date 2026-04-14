import type {
  AdminTrialDetailsRequest,
  AdminTrialDetailsResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

export function getAdminTrial(
  request: RequestFn,
  input: AdminTrialDetailsRequest,
) {
  return request<AdminTrialDetailsResponse>(
    `/api/admin/trials/${encodeURIComponent(input.trialId)}`,
    {
      method: "GET",
    },
  );
}
