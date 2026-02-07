"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@beagle/ui";
import Link from "next/link";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type CurrentUser = {
  id: string;
  email: string;
  username: string | null;
  role: "USER" | "ADMIN";
};

async function fetchCurrentUser() {
  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load auth state.");
  }

  const payload = (await response.json()) as {
    ok?: boolean;
    data?: CurrentUser;
  };
  return payload.ok ? (payload.data ?? null) : null;
}

export function AuthStatus() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
  });

  async function onLogout() {
    await fetch(`${apiBaseUrl}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    await queryClient.invalidateQueries({ queryKey: ["current-user"] });
  }

  if (query.isLoading) {
    return <p className="text-sm text-zinc-500">Checking auth...</p>;
  }

  if (query.isError) {
    return <p className="text-sm text-red-600">Auth status unavailable.</p>;
  }

  if (!query.data) {
    return (
      <p className="text-sm text-zinc-700">
        Not logged in.{" "}
        <Link className="underline" href="/login">
          Sign in
        </Link>
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <p className="text-sm text-zinc-700">
        Logged in as <span className="font-medium">{query.data.email}</span> (
        {query.data.role})
      </p>
      <Button variant="secondary" onClick={onLogout}>
        Logout
      </Button>
    </div>
  );
}
