import type {
  AdminTrialSearchRequest,
  AdminTrialSearchResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

function toQueryString(input: AdminTrialSearchRequest) {
  const params = new URLSearchParams();
  if (input.query) params.set("query", input.query);
  if (typeof input.page === "number") params.set("page", String(input.page));
  if (typeof input.pageSize === "number") {
    params.set("pageSize", String(input.pageSize));
  }
  if (input.sort) params.set("sort", input.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listAdminTrials(
  request: RequestFn,
  input: AdminTrialSearchRequest = {},
) {
  return request<AdminTrialSearchResponse>(
    `/api/admin/trials${toQueryString(input)}`,
    {
      method: "GET",
    },
  );
}
