"use client";

import type {
  AdminTrialDetailsRequest,
  AdminTrialDetailsResponse,
} from "@beagle/contracts";
import { createAdminTrialsApiClient } from "@beagle/api-client";
import { useQuery } from "@tanstack/react-query";
import { adminTrialQueryKey } from "./query-keys";

const adminTrialsApiClient = createAdminTrialsApiClient();

export class AdminTrialQueryError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AdminTrialQueryError";
    this.errorCode = errorCode;
  }
}

export function isAdminTrialQueryError(
  error: unknown,
): error is AdminTrialQueryError {
  return error instanceof AdminTrialQueryError;
}

type UseAdminTrialQueryInput = AdminTrialDetailsRequest & {
  enabled?: boolean;
};

export function useAdminTrialQuery(input: UseAdminTrialQueryInput) {
  const normalizedTrialId = input.trialId.trim();

  return useQuery<AdminTrialDetailsResponse>({
    queryKey: adminTrialQueryKey(normalizedTrialId),
    queryFn: async () => {
      const result = await adminTrialsApiClient.getAdminTrial({
        trialId: normalizedTrialId,
      });
      if (!result.ok) {
        throw new AdminTrialQueryError(
          result.code === "FORBIDDEN"
            ? "Admin access required."
            : result.code === "UNAUTHENTICATED"
              ? "Sign in required."
              : result.code === "TRIAL_NOT_FOUND"
                ? "Trial not found."
                : "Failed to load admin trial details.",
          result.code,
        );
      }

      return result.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: false,
    retryDelay: 300,
    enabled: input.enabled ?? normalizedTrialId.length > 0,
  });
}
