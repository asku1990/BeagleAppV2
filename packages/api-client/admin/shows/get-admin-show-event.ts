import type {
  AdminShowDetailsRequest,
  AdminShowDetailsResponse,
} from "@beagle/contracts";
import type { RequestFn } from "../../core/request";

export function getAdminShowEvent(
  request: RequestFn,
  input: AdminShowDetailsRequest,
) {
  return request<AdminShowDetailsResponse>(
    `/api/admin/shows/${encodeURIComponent(input.showId)}`,
    {
      method: "GET",
    },
  );
}
