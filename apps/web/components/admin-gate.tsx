"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/lib/hooks/use-auth";

export function AdminGate({ children }: { children: ReactNode }) {
  const query = useCurrentUser();

  if (query.isLoading) {
    return <p className="text-sm text-zinc-500">Checking access...</p>;
  }

  if (query.isError) {
    return (
      <p className="text-sm text-red-600">Unable to verify admin access.</p>
    );
  }

  if (!query.data) {
    return (
      <p className="text-sm text-zinc-700">
        You must be signed in as admin.{" "}
        <Link className="underline" href="/login">
          Sign in
        </Link>
      </p>
    );
  }

  if (query.data.role !== "ADMIN") {
    return <p className="text-sm text-zinc-700">Admin access is required.</p>;
  }

  return <>{children}</>;
}
