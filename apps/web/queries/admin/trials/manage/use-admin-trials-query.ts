"use client";

import type {
  AdminTrialSearchRequest,
  AdminTrialSearchResponse,
} from "@beagle/contracts";
import { createAdminTrialsApiClient } from "@beagle/api-client";
import { useQuery } from "@tanstack/react-query";
import { adminTrialsQueryKey } from "./query-keys";

const adminTrialsApiClient = createAdminTrialsApiClient();

class AdminTrialsQueryError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AdminTrialsQueryError";
    this.errorCode = errorCode;
  }
}

export function useAdminTrialsQuery(input: AdminTrialSearchRequest = {}) {
  return useQuery<AdminTrialSearchResponse>({
    queryKey: adminTrialsQueryKey(input),
    queryFn: async () => {
      const result = await adminTrialsApiClient.listAdminTrials(input);
      if (!result.ok) {
        throw new AdminTrialsQueryError(
          result.code === "FORBIDDEN"
            ? "Admin access required."
            : result.code === "UNAUTHENTICATED"
              ? "Sign in required."
              : "Failed to load admin trials.",
          result.code,
        );
      }

      return result.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
