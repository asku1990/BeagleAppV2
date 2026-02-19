type Role = "USER" | "ADMIN";

export type CreateAdminUserRequest = {
  email: string;
  name?: string | null;
  role?: Role;
  password: string;
};

export type CreateAdminUserResponse = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: "active" | "suspended";
  createdAt: string;
};
