import "server-only";

const DEFAULT_BETTER_AUTH_URL = "http://localhost:3000";
const isProduction = process.env.NODE_ENV === "production";
const betterAuthSecret = process.env.BETTER_AUTH_SECRET?.trim();
const betterAuthUrl = process.env.BETTER_AUTH_URL?.trim();
const baseURL =
  betterAuthUrl ?? (isProduction ? undefined : DEFAULT_BETTER_AUTH_URL);
const trustedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

/**
 * Phase 1 foundation config for the upcoming Better Auth cutover.
 * Phase 2 wires this object into `betterAuth(...)` + Prisma adapter.
 *
 * Note: `modelName` values refer to Prisma model names (not DB table names).
 */
export const betterAuthFoundation = Object.freeze({
  ...(betterAuthSecret ? { secret: betterAuthSecret } : {}),
  ...(baseURL ? { baseURL } : {}),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
  },
  // When sign-up is later enabled (invite/allowlist), add sendVerificationEmail.
  emailVerification: {
    sendOnSignUp: true,
  },
  trustedOrigins,
  user: {
    modelName: "BetterAuthUser",
  },
  session: {
    modelName: "BetterAuthSession",
  },
  account: {
    modelName: "BetterAuthAccount",
  },
  verification: {
    modelName: "BetterAuthVerification",
  },
  admin: {
    defaultRole: "USER",
    adminRoles: ["ADMIN"],
  },
  advanced: {
    useSecureCookies: isProduction,
  },
});
