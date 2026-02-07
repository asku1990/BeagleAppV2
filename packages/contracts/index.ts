export type Role = "USER" | "ADMIN";

export type ApiSuccess<T> = { ok: true; data: T };

export type ApiError = {
  ok: false;
  error: string;
  code?: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export type CurrentUserDto = {
  id: string;
  email: string;
  username: string | null;
  role: Role;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  username?: string;
};

export type LogoutResponse = {
  success: true;
};

export type ImportStatusResponse = {
  info: string;
};
