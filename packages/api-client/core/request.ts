import type { ApiResult } from "@beagle/contracts";
import type { ClientOptions } from "./client-options";
import { parseJson } from "./parse-json";

export type RequestFn = <T>(
  path: string,
  init?: RequestInit,
) => Promise<ApiResult<T>>;

export function createRequest(options: ClientOptions): RequestFn {
  const baseUrl = options.baseUrl ?? process.env.NEXT_PUBLIC_API_URL ?? "";
  const credentials = options.credentials ?? "include";

  return async function request<T>(
    path: string,
    init: RequestInit = {},
  ): Promise<ApiResult<T>> {
    const headers = new Headers(options.headers ?? {});
    if (init.headers) {
      new Headers(init.headers).forEach((value, key) =>
        headers.set(key, value),
      );
    }
    if (init.body != null && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      credentials,
      headers,
    });

    return parseJson<T>(response);
  };
}
