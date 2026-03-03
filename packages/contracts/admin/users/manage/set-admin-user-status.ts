export type AdminUserStatus = "active" | "suspended";

export type SetAdminUserStatusRequest = {
  userId: string;
  status: AdminUserStatus;
};

export type SetAdminUserStatusResponse = {
  userId: string;
  status: AdminUserStatus;
};
