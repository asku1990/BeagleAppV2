import type { CurrentUserDto, LoginRequest } from "@beagle/contracts";
import type { RequestFn } from "../core/request";

export function login(request: RequestFn, input: LoginRequest) {
  return request<CurrentUserDto>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
