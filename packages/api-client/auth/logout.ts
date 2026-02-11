import type { LogoutResponse } from "@beagle/contracts";
import type { RequestFn } from "../core/request";

export function logout(request: RequestFn) {
  return request<LogoutResponse>("/api/auth/logout", { method: "POST" });
}
