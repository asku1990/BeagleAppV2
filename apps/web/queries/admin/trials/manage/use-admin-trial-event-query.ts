"use client";

import type {
  AdminTrialEventDetailsRequest,
  AdminTrialEventDetailsResponse,
} from "@beagle/contracts";
import { createAdminTrialsApiClient } from "@beagle/api-client";
import { useQuery } from "@tanstack/react-query";
import { adminTrialEventQueryKey } from "./query-keys";

const adminTrialsApiClient = createAdminTrialsApiClient();

class AdminTrialEventQueryError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AdminTrialEventQueryError";
    this.errorCode = errorCode;
  }
}

type UseAdminTrialEventQueryInput = AdminTrialEventDetailsRequest & {
  enabled?: boolean;
};

export function useAdminTrialEventQuery(input: UseAdminTrialEventQueryInput) {
  const normalizedTrialEventId = input.trialEventId.trim();
  return useQuery<AdminTrialEventDetailsResponse>({
    queryKey: adminTrialEventQueryKey(normalizedTrialEventId),
    queryFn: async () => {
      const result = await adminTrialsApiClient.getAdminTrialEvent({
        trialEventId: normalizedTrialEventId,
      });
      if (!result.ok) {
        throw new AdminTrialEventQueryError(
          result.code === "FORBIDDEN"
            ? "Admin access required."
            : result.code === "UNAUTHENTICATED"
              ? "Sign in required."
              : result.code === "TRIAL_EVENT_NOT_FOUND"
                ? "Trial event not found."
                : "Failed to load admin trial event details.",
          result.code,
        );
      }

      return result.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: false,
    retryDelay: 300,
    enabled: input.enabled ?? normalizedTrialEventId.length > 0,
  });
}
