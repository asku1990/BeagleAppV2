"use client";

import { createAdminDogsApiClient } from "@beagle/api-client";
import type {
  AdminDogDiseaseBrowseRequest,
  AdminDogDiseaseBrowseResponse,
} from "@beagle/contracts";
import { useQuery } from "@tanstack/react-query";
import { adminDogDiseasesQueryKey } from "./query-keys";

const adminDogsApiClient = createAdminDogsApiClient();

class AdminDogDiseasesQueryError extends Error {
  errorCode?: string;

  constructor(message: string, errorCode?: string) {
    super(message);
    this.name = "AdminDogDiseasesQueryError";
    this.errorCode = errorCode;
  }
}

type UseAdminDogDiseasesQueryInput = AdminDogDiseaseBrowseRequest & {
  initialData?: AdminDogDiseaseBrowseResponse | undefined;
};

export function useAdminDogDiseasesQuery(input: UseAdminDogDiseasesQueryInput) {
  return useQuery<AdminDogDiseaseBrowseResponse>({
    queryKey: adminDogDiseasesQueryKey(input),
    queryFn: async () => {
      const result = await adminDogsApiClient.listAdminDogDiseases({
        diseaseCode: input.diseaseCode,
        page: input.page,
      });

      if (!result.ok) {
        throw new AdminDogDiseasesQueryError(
          result.code === "FORBIDDEN"
            ? "Admin access required."
            : result.code === "UNAUTHENTICATED"
              ? "Sign in required."
              : "Failed to load admin dog diseases.",
          result.code,
        );
      }

      return result.data;
    },
    initialData: input.initialData,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: false,
  });
}
