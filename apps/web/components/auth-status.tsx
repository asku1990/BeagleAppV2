"use client";

import { Button } from "@beagle/ui";
import Link from "next/link";
import { useCurrentUser, useLogout } from "@/lib/hooks/use-auth";

export function AuthStatus() {
  const query = useCurrentUser();
  const logout = useLogout();
  const logoutError =
    logout.error instanceof Error ? logout.error.message : null;

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
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <p className="text-sm text-zinc-700">
          Logged in as <span className="font-medium">{query.data.email}</span> (
          {query.data.role})
        </p>
        <Button
          variant="secondary"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
      {logoutError ? (
        <p className="text-sm text-red-600">{logoutError}</p>
      ) : null}
    </div>
  );
}
