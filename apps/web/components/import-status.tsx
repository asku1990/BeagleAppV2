"use client";

import { useQuery } from "@tanstack/react-query";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function fetchStatus() {
  const response = await fetch(`${apiBaseUrl}/api/import/example`);
  if (!response.ok) {
    throw new Error("Failed to fetch import status");
  }
  return response.json() as Promise<{ ok: boolean; data: { info: string } }>;
}

export function ImportStatus() {
  const query = useQuery({ queryKey: ["import-status"], queryFn: fetchStatus });

  if (query.isLoading)
    return <p className="text-sm text-zinc-500">Loading import status...</p>;
  if (query.isError)
    return <p className="text-sm text-red-600">Import status unavailable.</p>;

  return <p className="text-sm text-zinc-700">{query.data?.data.info}</p>;
}
