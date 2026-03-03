export type SetAdminUserPasswordRequest = {
  userId: string;
  newPassword: string;
};

export type SetAdminUserPasswordResponse = {
  userId: string;
};
