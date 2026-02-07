"use client";

import { useQuery } from "@tanstack/react-query";
import { createApiClient } from "@beagle/api-client";

const apiClient = createApiClient();

async function fetchStatus() {
  const result = await apiClient.getImportStatus();
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result.data;
}

export function ImportStatus() {
  const query = useQuery({ queryKey: ["import-status"], queryFn: fetchStatus });

  if (query.isLoading)
    return <p className="text-sm text-zinc-500">Loading import status...</p>;
  if (query.isError)
    return <p className="text-sm text-red-600">Import status unavailable.</p>;

  return <p className="text-sm text-zinc-700">{query.data?.info}</p>;
}
