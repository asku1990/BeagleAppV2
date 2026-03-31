import type {
  AdminShowSearchRequest,
  AdminShowSearchResponse,
} from "@beagle/contracts";
import type { RequestFn } from "../../core/request";

function toQueryString(input: AdminShowSearchRequest) {
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

export function listAdminShowEvents(
  request: RequestFn,
  input: AdminShowSearchRequest = {},
) {
  return request<AdminShowSearchResponse>(
    `/api/admin/shows${toQueryString(input)}`,
    {
      method: "GET",
    },
  );
}
