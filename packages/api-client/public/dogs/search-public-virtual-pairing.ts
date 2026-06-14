import type {
  VirtualPairingSearchRequest,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

function toQueryString(input: VirtualPairingSearchRequest) {
  const params = new URLSearchParams();
  params.set("field", input.field);
  params.set("query", input.query);
  if (typeof input.page === "number") params.set("page", String(input.page));
  if (typeof input.pageSize === "number") {
    params.set("pageSize", String(input.pageSize));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function searchPublicVirtualPairing(
  request: RequestFn,
  input: VirtualPairingSearchRequest,
) {
  return request<VirtualPairingSearchResponse>(
    `/api/beagle/dogs/virtual-pairing${toQueryString(input)}`,
    {
      method: "GET",
    },
  );
}
