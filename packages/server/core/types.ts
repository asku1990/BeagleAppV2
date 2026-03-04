import type { CurrentUserDto, Role } from "@beagle/contracts";

export type SessionInfo = {
  sessionToken: string;
  expires: Date;
};

export type AuthSessionResult = {
  user: CurrentUserDto;
  session: SessionInfo;
};

export type CurrentUser = CurrentUserDto | null;

export function hasAdminRole(user: CurrentUserDto | null): boolean {
  return user?.role === "ADMIN";
}

export function normalizeRole(role: Role | string): Role {
  return role === "ADMIN" ? "ADMIN" : "USER";
}
