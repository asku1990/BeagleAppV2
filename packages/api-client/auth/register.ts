import type { RegisterRequest } from "@beagle/contracts";
import type { RequestFn } from "../core/request";

export function register(request: RequestFn, input: RegisterRequest) {
  return request<{ id: string; email: string; role: string }>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}
