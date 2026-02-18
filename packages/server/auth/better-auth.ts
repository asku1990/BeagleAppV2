import { prisma } from "@beagle/db";
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

if (isProduction && !betterAuthSecret) {
  throw new Error("BETTER_AUTH_SECRET is required in production.");
}

if (isProduction && !betterAuthUrl) {
  throw new Error("BETTER_AUTH_URL is required in production.");
}

export const betterAuth = createBetterAuth({
  ...(betterAuthSecret
    ? { secret: betterAuthSecret }
    : { secret: "replace-in-development" }),
  ...(baseURL ? { baseURL } : {}),
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    resetPasswordTokenExpiresIn: 60 * 30,
    revokeSessionsOnPasswordReset: true,
  },
  trustedOrigins,
  user: {
    modelName: "betterAuthUser",
  },
  session: {
    modelName: "betterAuthSession",
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
