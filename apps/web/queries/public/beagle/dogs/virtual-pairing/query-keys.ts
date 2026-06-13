import type { VirtualPairingSearchRequest } from "@beagle/contracts";

export const publicVirtualPairingSearchQueryKeyRoot = [
  "public-dogs",
  "virtual-pairing",
  "search",
] as const;

export function publicVirtualPairingSearchQueryKey(
  filters: VirtualPairingSearchRequest,
) {
  return [
    ...publicVirtualPairingSearchQueryKeyRoot,
    filters.field,
    filters.query,
    filters.page ?? 1,
    filters.pageSize ?? 10,
  ] as const;
}
