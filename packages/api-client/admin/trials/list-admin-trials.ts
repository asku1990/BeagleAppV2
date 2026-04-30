import type {
  AdminTrialEventSearchRequest,
  AdminTrialEventSearchResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

function toQueryString(input: AdminTrialEventSearchRequest) {
  const params = new URLSearchParams();
  if (input.query) params.set("query", input.query);
  if (typeof input.year === "number") params.set("year", String(input.year));
  if (input.dateFrom) params.set("dateFrom", input.dateFrom);
  if (input.dateTo) params.set("dateTo", input.dateTo);
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
  input: AdminTrialEventSearchRequest = {},
) {
  return request<AdminTrialEventSearchResponse>(
    `/api/admin/trials${toQueryString(input)}`,
    {
      method: "GET",
    },
  );
}
