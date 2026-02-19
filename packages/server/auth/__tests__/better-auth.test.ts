import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_ENV = { ...process.env };

const createBetterAuthMock = vi.fn();
const prismaAdapterMock = vi.fn();
const nextCookiesMock = vi.fn();
const adminPluginMock = vi.fn();

vi.mock("better-auth", () => ({
  betterAuth: createBetterAuthMock,
}));

vi.mock("better-auth/adapters/prisma", () => ({
  prismaAdapter: prismaAdapterMock,
}));

vi.mock("better-auth/next-js", () => ({
  nextCookies: nextCookiesMock,
}));

vi.mock("better-auth/plugins/admin", () => ({
  admin: adminPluginMock,
}));

vi.mock("@beagle/db", () => ({
  prisma: { __tag: "prisma-client" },
}));

describe("betterAuth config", () => {
  afterEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env = { ...ORIGINAL_ENV };
  });

  it("throws when BETTER_AUTH_SECRET is missing", async () => {
    delete process.env.BETTER_AUTH_SECRET;

    await expect(import("../better-auth")).rejects.toThrow(
      "BETTER_AUTH_SECRET is required.",
    );
  });

  it("throws when BETTER_AUTH_SECRET is too short", async () => {
    process.env.BETTER_AUTH_SECRET = "short";

    await expect(import("../better-auth")).rejects.toThrow(
      "BETTER_AUTH_SECRET must be at least 32 characters.",
    );
  });

  it("throws when session expires config is invalid", async () => {
    process.env.BETTER_AUTH_SECRET = "a".repeat(32);
    process.env.BETTER_AUTH_SESSION_EXPIRES_IN = "0";

    await expect(import("../better-auth")).rejects.toThrow(
      "BETTER_AUTH_SESSION_EXPIRES_IN must be a positive number of seconds.",
    );
  });

  it("throws when session update age config is invalid", async () => {
    process.env.BETTER_AUTH_SECRET = "a".repeat(32);
    process.env.BETTER_AUTH_SESSION_UPDATE_AGE = "0";

    await expect(import("../better-auth")).rejects.toThrow(
      "BETTER_AUTH_SESSION_UPDATE_AGE must be a positive number of seconds.",
    );
  });

  it("throws in production when BETTER_AUTH_URL is missing", async () => {
    process.env.BETTER_AUTH_SECRET = "a".repeat(32);
    process.env.NODE_ENV = "production";
    delete process.env.BETTER_AUTH_URL;

    await expect(import("../better-auth")).rejects.toThrow(
      "BETTER_AUTH_URL is required in production.",
    );
  });

  it("builds better-auth config in development", async () => {
    process.env.NODE_ENV = "development";
    process.env.BETTER_AUTH_SECRET = "b".repeat(32);
    process.env.CORS_ORIGINS = " http://localhost:3000, http://admin.local ,";
    process.env.BETTER_AUTH_SESSION_EXPIRES_IN = "3600";
    process.env.BETTER_AUTH_SESSION_UPDATE_AGE = "600";

    createBetterAuthMock.mockReturnValue({ handler: {} });
    prismaAdapterMock.mockReturnValue({ adapter: true });
    nextCookiesMock.mockReturnValue({ nextCookies: true });
    adminPluginMock.mockReturnValue({ adminPlugin: true });

    const betterAuthModule = await import("../better-auth");

    expect(betterAuthModule.betterAuth).toEqual({ handler: {} });
    expect(prismaAdapterMock).toHaveBeenCalledWith(
      { __tag: "prisma-client" },
      { provider: "postgresql" },
    );
    expect(adminPluginMock).toHaveBeenCalledWith({
      defaultRole: "USER",
      adminRoles: ["ADMIN"],
    });
    expect(createBetterAuthMock).toHaveBeenCalledTimes(1);

    const config = createBetterAuthMock.mock.calls[0]?.[0];
    expect(config.secret).toBe("b".repeat(32));
    expect(config.baseURL).toBe("http://localhost:3000");
    expect(config.trustedOrigins).toEqual([
      "http://localhost:3000",
      "http://admin.local",
    ]);
    expect(config.session).toMatchObject({
      expiresIn: 3600,
      updateAge: 600,
    });
    expect(config.advanced).toEqual({ useSecureCookies: false });
  });
});
