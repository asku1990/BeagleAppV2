"use client";

import type {
  AdminShowSearchRequest,
  AdminShowSearchResponse,
} from "@beagle/contracts";
import { createAdminShowsApiClient } from "@beagle/api-client";
import { useQuery } from "@tanstack/react-query";
import { adminShowEventsQueryKey } from "./query-keys";

const adminShowsApiClient = createAdminShowsApiClient();

class AdminShowEventsQueryError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AdminShowEventsQueryError";
    this.errorCode = errorCode;
  }
}

export function useAdminShowEventsQuery(input: AdminShowSearchRequest = {}) {
  return useQuery<AdminShowSearchResponse>({
    queryKey: adminShowEventsQueryKey(input),
    queryFn: async () => {
      const result = await adminShowsApiClient.listAdminShowEvents(input);
      if (!result.ok) {
        throw new AdminShowEventsQueryError(
          result.code === "FORBIDDEN"
            ? "Admin access required."
            : result.code === "UNAUTHENTICATED"
              ? "Sign in required."
              : "Failed to load admin show events.",
          result.code,
        );
      }

      return result.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
