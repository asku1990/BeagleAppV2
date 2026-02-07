"use client";

import { createApiClient } from "@beagle/api-client";
import type {
  CurrentUserDto,
  LoginRequest,
  RegisterRequest,
} from "@beagle/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const apiClient = createApiClient();

export const currentUserQueryKey = ["current-user"] as const;

async function fetchCurrentUser(): Promise<CurrentUserDto | null> {
  const result = await apiClient.me();
  if (!result.ok) {
    if (result.error === "Not authenticated.") {
      return null;
    }
    throw new Error(result.error);
  }

  return result.data;
}

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: LoginRequest) => {
      const result = await apiClient.login(input);
      if (!result.ok) {
        throw new Error(result.error || "Login failed.");
      }
      return result.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (input: RegisterRequest) => {
      const result = await apiClient.register(input);
      if (!result.ok) {
        throw new Error(result.error || "Registration failed.");
      }
      return result.data;
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await apiClient.logout();
      if (!result.ok) {
        throw new Error(result.error || "Logout failed.");
      }
      return result.data;
    },
    onSuccess: async () => {
      queryClient.setQueryData(currentUserQueryKey, null);
      await queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
    },
  });
}
