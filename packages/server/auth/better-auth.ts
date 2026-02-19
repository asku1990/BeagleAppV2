import { prisma } from "@beagle/db";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@beagle/contracts";
import { betterAuth as createBetterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins/admin";

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
const sessionExpiresIn = Number(
  process.env.BETTER_AUTH_SESSION_EXPIRES_IN ?? 60 * 60 * 24 * 14,
);
const sessionUpdateAge = Number(
  process.env.BETTER_AUTH_SESSION_UPDATE_AGE ?? 60 * 60 * 24,
);

if (!betterAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET is required.");
}

if (betterAuthSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must be at least 32 characters.");
}

if (!Number.isFinite(sessionExpiresIn) || sessionExpiresIn <= 0) {
  throw new Error(
    "BETTER_AUTH_SESSION_EXPIRES_IN must be a positive number of seconds.",
  );
}

if (!Number.isFinite(sessionUpdateAge) || sessionUpdateAge <= 0) {
  throw new Error(
    "BETTER_AUTH_SESSION_UPDATE_AGE must be a positive number of seconds.",
  );
}

if (isProduction && !betterAuthUrl) {
  throw new Error("BETTER_AUTH_URL is required in production.");
}

export const betterAuth = createBetterAuth({
  secret: betterAuthSecret,
  ...(baseURL ? { baseURL } : {}),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
  },
  session: {
    modelName: "betterAuthSession",
    expiresIn: sessionExpiresIn,
    updateAge: sessionUpdateAge,
  },
  trustedOrigins,
  user: {
    modelName: "betterAuthUser",
  },
  account: {
    modelName: "betterAuthAccount",
  },
  verification: {
    modelName: "betterAuthVerification",
  },
  plugins: [
    nextCookies(),
    admin({
      defaultRole: "USER",
      adminRoles: ["ADMIN"],
    }),
  ],
  advanced: {
    useSecureCookies: isProduction,
  },
});
