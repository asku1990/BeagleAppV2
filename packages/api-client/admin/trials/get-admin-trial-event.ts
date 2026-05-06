import type {
  AdminTrialEventDetailsRequest,
  AdminTrialEventDetailsResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

export function getAdminTrialEvent(
  request: RequestFn,
  input: AdminTrialEventDetailsRequest,
) {
  return request<AdminTrialEventDetailsResponse>(
    `/api/admin/trials/events/${encodeURIComponent(input.trialEventId)}`,
    {
      method: "GET",
    },
  );
}
