import type { VirtualPairingSearchRequest } from "@beagle/contracts";

export const adminVirtualPairingSearchQueryKeyRoot = [
  "admin-dogs",
  "virtual-pairing",
  "search",
] as const;

export function adminVirtualPairingSearchQueryKey(
  filters: VirtualPairingSearchRequest,
) {
  return [
    ...adminVirtualPairingSearchQueryKeyRoot,
    filters.field,
    filters.query,
    filters.page ?? 1,
    filters.pageSize ?? 10,
  ] as const;
}
