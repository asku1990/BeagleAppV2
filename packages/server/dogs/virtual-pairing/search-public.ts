import type {
  DogStatus,
  VirtualPairingSearchRequest,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import type { ServiceResult } from "@server/core/result";
import { searchVirtualPairingDogs } from "./search";

const PUBLIC_DOG_STATUSES = ["NORMAL"] as const satisfies readonly DogStatus[];

export function searchPublicVirtualPairingDogs(
  input: VirtualPairingSearchRequest,
): Promise<ServiceResult<VirtualPairingSearchResponse>> {
  return searchVirtualPairingDogs(input, {
    allowedStatuses: PUBLIC_DOG_STATUSES,
  });
}
