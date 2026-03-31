"use client";

import type {
  AdminShowDetailsRequest,
  AdminShowDetailsResponse,
} from "@beagle/contracts";
import { createAdminShowsApiClient } from "@beagle/api-client";
import { useQuery } from "@tanstack/react-query";
import { adminShowEventQueryKey } from "./query-keys";

const adminShowsApiClient = createAdminShowsApiClient();

class AdminShowEventQueryError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AdminShowEventQueryError";
    this.errorCode = errorCode;
  }
}

export function useAdminShowEventQuery(input: AdminShowDetailsRequest) {
  return useQuery<AdminShowDetailsResponse>({
    queryKey: adminShowEventQueryKey(input.showId),
    queryFn: async () => {
      const result = await adminShowsApiClient.getAdminShowEvent(input);
      if (!result.ok) {
        throw new AdminShowEventQueryError(
          result.code === "FORBIDDEN"
            ? "Admin access required."
            : result.code === "UNAUTHENTICATED"
              ? "Sign in required."
              : result.code === "SHOW_NOT_FOUND"
                ? "Show not found."
                : "Failed to load admin show details.",
          result.code,
        );
      }

      return result.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
