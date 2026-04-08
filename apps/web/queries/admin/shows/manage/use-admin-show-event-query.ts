"use client";

import type {
  AdminShowDetailsRequest,
  AdminShowDetailsResponse,
} from "@beagle/contracts";
import { createAdminShowsApiClient } from "@beagle/api-client";
import { useQuery } from "@tanstack/react-query";
import { adminShowEventQueryKey } from "./query-keys";

const adminShowsApiClient = createAdminShowsApiClient();
const SHOW_NOT_FOUND_RETRY_LIMIT = 4;

class AdminShowEventQueryError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AdminShowEventQueryError";
    this.errorCode = errorCode;
  }
}

type UseAdminShowEventQueryInput = AdminShowDetailsRequest & {
  enabled?: boolean;
};

export function useAdminShowEventQuery(input: UseAdminShowEventQueryInput) {
  const normalizedShowId = input.showId.trim();
  return useQuery<AdminShowDetailsResponse>({
    queryKey: adminShowEventQueryKey(normalizedShowId),
    queryFn: async () => {
      const result = await adminShowsApiClient.getAdminShowEvent({
        showId: normalizedShowId,
      });
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
    retry: (failureCount, error) =>
      error instanceof AdminShowEventQueryError &&
      error.errorCode === "SHOW_NOT_FOUND" &&
      failureCount <= SHOW_NOT_FOUND_RETRY_LIMIT,
    retryDelay: 300,
    enabled: input.enabled ?? normalizedShowId.length > 0,
  });
}
