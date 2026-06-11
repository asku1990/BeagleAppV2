"use client";

import { createAdminDogsApiClient } from "@beagle/api-client";
import type {
  AdminDogProfileRequest,
  AdminDogProfileResponse,
} from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { adminDogProfileQueryKey } from "./query-keys";

const adminDogsApiClient = createAdminDogsApiClient();

class AdminDogProfileQueryError extends Error {
  errorCode?: string;
  status: number;

  constructor(message: string, status: number, errorCode?: string) {
    super(message);
    this.name = "AdminDogProfileQueryError";
    this.status = status;
    this.errorCode = errorCode;
  }
}

type UseAdminDogProfileQueryInput = AdminDogProfileRequest & {
  enabled?: boolean;
};

export function useAdminDogProfileQuery(input: UseAdminDogProfileQueryInput) {
  const normalizedDogId = input.dogId.trim();

  return useQuery<AdminDogProfileResponse>({
    queryKey: adminDogProfileQueryKey(normalizedDogId),
    queryFn: async () => {
      const result = await adminDogsApiClient.getAdminDogProfile({
        dogId: normalizedDogId,
      });

      if (!result.ok) {
        const status =
          result.code === "FORBIDDEN"
            ? 403
            : result.code === "UNAUTHENTICATED"
              ? 401
              : result.code === "DOG_NOT_FOUND"
                ? 404
                : 500;

        throw new AdminDogProfileQueryError(
          result.code === "FORBIDDEN"
            ? "Admin access required."
            : result.code === "UNAUTHENTICATED"
              ? "Sign in required."
              : result.code === "DOG_NOT_FOUND"
                ? "Dog profile not found."
                : "Failed to load admin dog profile.",
          status,
          result.code,
        );
      }

      return result.data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    retry: false,
    retryDelay: 300,
    enabled: input.enabled ?? normalizedDogId.length > 0,
  });
}
