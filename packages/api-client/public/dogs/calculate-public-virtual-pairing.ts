import type {
  CalculatePublicVirtualPairingRequest,
  CalculatePublicVirtualPairingResponse,
} from "@beagle/contracts";
import type { RequestFn } from "@api-client/core/request";

function toQueryString(input: CalculatePublicVirtualPairingRequest) {
  const params = new URLSearchParams();
  params.set("sireRegistrationNo", input.sireRegistrationNo);
  params.set("damRegistrationNo", input.damRegistrationNo);
  if (
    typeof input.generationDepth === "number" &&
    Number.isFinite(input.generationDepth)
  ) {
    params.set("generationDepth", String(input.generationDepth));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function calculatePublicVirtualPairing(
  request: RequestFn,
  input: CalculatePublicVirtualPairingRequest,
) {
  return request<CalculatePublicVirtualPairingResponse>(
    `/api/beagle/dogs/virtual-pairing/calculate${toQueryString(input)}`,
    {
      method: "GET",
    },
  );
}
