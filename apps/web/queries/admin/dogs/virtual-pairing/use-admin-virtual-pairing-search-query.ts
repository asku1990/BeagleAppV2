"use client";

import type {
  VirtualPairingSearchRequest,
  VirtualPairingSearchResponse,
} from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { AdminMutationError } from "@/queries/admin/mutation-error";
import { adminVirtualPairingSearchQueryKey } from "./query-keys";

type AdminVirtualPairingSearchRouteResponse =
  | {
      ok: true;
      data: VirtualPairingSearchResponse;
    }
  | {
      ok: false;
      error: string;
      code?: string;
    };

function buildSearchUrl(filters: VirtualPairingSearchRequest): string {
  const params = new URLSearchParams();
  params.set("field", filters.field);
  params.set("query", filters.query);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 10));
  return `/api/admin/dogs/virtual-pairing?${params.toString()}`;
}

export function useAdminVirtualPairingSearchQuery(
  filters: VirtualPairingSearchRequest,
  enabled: boolean,
) {
  return useQuery<VirtualPairingSearchResponse>({
    queryKey: adminVirtualPairingSearchQueryKey(filters),
    enabled,
    queryFn: async () => {
      let response: Response;
      try {
        response = await fetch(buildSearchUrl(filters), {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });
      } catch {
        throw new AdminMutationError(
          "Failed to load virtual pairing search results.",
          "INTERNAL_ERROR",
        );
      }

      let payload: AdminVirtualPairingSearchRouteResponse;
      try {
        payload =
          (await response.json()) as AdminVirtualPairingSearchRouteResponse;
      } catch {
        throw new AdminMutationError(
          "Failed to load virtual pairing search results.",
          "INTERNAL_ERROR",
        );
      }

      if (!response.ok || !payload.ok) {
        throw new AdminMutationError(
          !payload.ok && payload.error
            ? payload.error
            : "Failed to load virtual pairing search results.",
          !payload.ok ? payload.code : undefined,
        );
      }

      return payload.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
