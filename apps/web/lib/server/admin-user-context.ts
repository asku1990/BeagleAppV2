import type { SessionCurrentUser } from "@/lib/server/current-user";

export type AdminUserContext = {
  id: string;
  email: string;
  username: string | null;
  role: "ADMIN" | "USER";
};

// Maps session user data into the admin API actor shape.
export function toAdminUserContext(
  currentUser: SessionCurrentUser | null,
): AdminUserContext | null {
  if (!currentUser) {
    return null;
  }

  return {
    id: currentUser.id,
    email: currentUser.email,
    username: currentUser.name,
    role: currentUser.role,
  };
}
