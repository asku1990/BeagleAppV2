import { hashPassword, verifyPassword } from "@beagle/auth";
import {
  Role,
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  findUserBySessionToken,
  type User,
} from "@beagle/db";
import type {
  CurrentUserDto,
  LoginRequest,
  LogoutResponse,
  RegisterRequest,
} from "@beagle/contracts";
import type { ServiceResult } from "../shared/result";
import type { AuthSessionResult } from "../shared/types";
import { normalizeRole } from "../shared/types";

type AuthDependencies = {
  createSession: typeof createSession;
  createUser: typeof createUser;
  deleteSession: typeof deleteSession;
  findUserByEmail: typeof findUserByEmail;
  findUserBySessionToken: typeof findUserBySessionToken;
  hashPassword: typeof hashPassword;
  verifyPassword: typeof verifyPassword;
};

const defaultDependencies: AuthDependencies = {
  createSession,
  createUser,
  deleteSession,
  findUserByEmail,
  findUserBySessionToken,
  hashPassword,
  verifyPassword,
};

type PrismaUniqueError = {
  code?: string;
  meta?: {
    target?: string[] | string;
    constraint?: string;
  };
  message?: string;
};

function isPrismaUniqueError(error: unknown): error is PrismaUniqueError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function uniqueTargetIncludes(
  error: PrismaUniqueError,
  candidate: string,
): boolean {
  const loweredCandidate = candidate.toLowerCase();
  const target = error.meta?.target;
  if (Array.isArray(target)) {
    return target.some((entry) =>
      entry.toLowerCase().includes(loweredCandidate),
    );
  }
  if (
    typeof target === "string" &&
    target.toLowerCase().includes(loweredCandidate)
  ) {
    return true;
  }

  const constraint = error.meta?.constraint;
  if (constraint?.toLowerCase().includes(loweredCandidate)) {
    return true;
  }

  return error.message?.toLowerCase().includes(loweredCandidate) ?? false;
}

function toCurrentUserDto(
  user: Pick<User, "id" | "email" | "username" | "role">,
): CurrentUserDto {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: normalizeRole(user.role),
  };
}

export function createAuthService(
  deps: AuthDependencies = defaultDependencies,
) {
  return {
    async login(
      input: Partial<LoginRequest>,
    ): Promise<
      ServiceResult<CurrentUserDto> & { session?: AuthSessionResult["session"] }
    > {
      const email = input.email?.trim().toLowerCase();
      const password = input.password;

      if (!email || !password) {
        return {
          status: 400,
          body: { ok: false, error: "Email and password are required." },
        };
      }

      const user = await deps.findUserByEmail(email);
      if (!user) {
        return {
          status: 401,
          body: { ok: false, error: "Invalid credentials." },
        };
      }

      const validPassword = await deps.verifyPassword(
        user.passwordHash,
        password,
      );
      if (!validPassword) {
        return {
          status: 401,
          body: { ok: false, error: "Invalid credentials." },
        };
      }

      const session = await deps.createSession(user.id);
      return {
        status: 200,
        body: { ok: true, data: toCurrentUserDto(user) },
        session,
      };
    },

    async register(
      input: Partial<RegisterRequest>,
    ): Promise<ServiceResult<{ id: string; email: string; role: string }>> {
      const email = input.email?.trim().toLowerCase();
      const password = input.password;

      if (!email || !password) {
        return {
          status: 400,
          body: { ok: false, error: "Email and password are required." },
        };
      }

      const existing = await deps.findUserByEmail(email);
      if (existing) {
        return {
          status: 409,
          body: { ok: false, error: "Email already exists." },
        };
      }

      const passwordHash = await deps.hashPassword(password);
      const username = input.username?.trim() || undefined;
      let user: Awaited<ReturnType<AuthDependencies["createUser"]>>;
      try {
        user = await deps.createUser({
          email,
          username,
          passwordHash,
          role: Role.USER,
        });
      } catch (error) {
        if (isPrismaUniqueError(error)) {
          if (uniqueTargetIncludes(error, "username")) {
            return {
              status: 409,
              body: { ok: false, error: "Username already exists." },
            };
          }
          if (uniqueTargetIncludes(error, "email")) {
            return {
              status: 409,
              body: { ok: false, error: "Email already exists." },
            };
          }
          return {
            status: 409,
            body: { ok: false, error: "Account already exists." },
          };
        }
        throw error;
      }

      return {
        status: 201,
        body: {
          ok: true,
          data: {
            id: user.id,
            email: user.email,
            role: normalizeRole(user.role),
          },
        },
      };
    },

    async me(
      sessionToken: string | undefined,
    ): Promise<ServiceResult<CurrentUserDto>> {
      if (!sessionToken) {
        return {
          status: 401,
          body: { ok: false, error: "Not authenticated." },
        };
      }

      const user = await deps.findUserBySessionToken(sessionToken);
      if (!user) {
        return {
          status: 401,
          body: { ok: false, error: "Not authenticated." },
        };
      }

      return {
        status: 200,
        body: { ok: true, data: toCurrentUserDto(user) },
      };
    },

    async getUserFromSessionToken(
      sessionToken: string | undefined,
    ): Promise<CurrentUserDto | null> {
      if (!sessionToken) {
        return null;
      }
      const user = await deps.findUserBySessionToken(sessionToken);
      return user ? toCurrentUserDto(user) : null;
    },

    async logout(
      sessionToken: string | undefined,
    ): Promise<ServiceResult<LogoutResponse>> {
      if (!sessionToken) {
        return {
          status: 401,
          body: { ok: false, error: "Not authenticated." },
        };
      }

      const user = await deps.findUserBySessionToken(sessionToken);
      if (!user) {
        return {
          status: 401,
          body: { ok: false, error: "Not authenticated." },
        };
      }

      await deps.deleteSession(sessionToken);

      return {
        status: 200,
        body: { ok: true, data: { success: true } },
      };
    },
  };
}

export const authService = createAuthService();
