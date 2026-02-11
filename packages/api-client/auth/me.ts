import type { CurrentUserDto } from "@beagle/contracts";
import type { RequestFn } from "../core/request";

export function me(request: RequestFn) {
  return request<CurrentUserDto>("/api/auth/me", { method: "GET" });
}
