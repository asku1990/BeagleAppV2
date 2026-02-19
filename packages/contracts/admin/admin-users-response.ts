export type AdminUserListItem = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER";
  status: "active" | "suspended";
  createdAt: string;
  lastSignInAt: string | null;
};

export type AdminUsersResponse = {
  items: AdminUserListItem[];
};
