import type { ApiResult } from "@beagle/contracts";

export async function parseJson<T>(response: Response): Promise<ApiResult<T>> {
  const payload = (await response.json()) as ApiResult<T>;
  if (!response.ok && payload.ok) {
    return { ok: false, error: "Unexpected response payload." };
  }
  return payload;
}
