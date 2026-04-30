"use client";

import type {
  AdminTrialEventSearchRequest,
  AdminTrialEventSearchResponse,
} from "@beagle/contracts";
import { createAdminTrialsApiClient } from "@beagle/api-client";
import { useQuery } from "@tanstack/react-query";
import { adminTrialEventsQueryKey } from "./query-keys";

const adminTrialsApiClient = createAdminTrialsApiClient();

class AdminTrialEventsQueryError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AdminTrialEventsQueryError";
    this.errorCode = errorCode;
  }
}

export function useAdminTrialEventsQuery(
  input: AdminTrialEventSearchRequest = {},
) {
  return useQuery<AdminTrialEventSearchResponse>({
    queryKey: adminTrialEventsQueryKey(input),
    queryFn: async () => {
      const result = await adminTrialsApiClient.listAdminTrials(input);
      if (!result.ok) {
        throw new AdminTrialEventsQueryError(
          result.code === "FORBIDDEN"
            ? "Admin access required."
            : result.code === "UNAUTHENTICATED"
              ? "Sign in required."
              : "Failed to load admin trial events.",
          result.code,
        );
      }

      return result.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
