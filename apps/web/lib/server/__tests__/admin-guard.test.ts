import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAdminAccess, requireAdminLayoutAccess } from "../admin-guard";

const { getSessionMock, requireAdminMock, headersMock, jsonResponseMock } =
  vi.hoisted(() => ({
    getSessionMock: vi.fn(),
    requireAdminMock: vi.fn(),
    headersMock: vi.fn(),
    jsonResponseMock: vi.fn(),
  }));

vi.mock("@beagle/server", () => ({
  betterAuth: {
    api: {
      getSession: getSessionMock,
    },
  },
  requireAdmin: requireAdminMock,
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/server/cors", () => ({
  jsonResponse: jsonResponseMock,
}));

describe("admin-guard", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    requireAdminMock.mockReset();
    headersMock.mockReset();
    jsonResponseMock.mockReset();
    headersMock.mockResolvedValue(new Headers());
    jsonResponseMock.mockReturnValue(
      new Response("forbidden", { status: 403 }),
    );
  });

  it("requireAdminAccess returns ok=true when admin check passes", async () => {
    getSessionMock.mockResolvedValue({
      user: {
        id: "u_1",
        email: "admin@example.com",
        name: "Admin",
        role: "ADMIN",
      },
    });
    requireAdminMock.mockReturnValue({ status: 200, body: { ok: true } });

    const request = {
      headers: new Headers({ origin: "http://localhost:3000" }),
    } as never;

    await expect(requireAdminAccess(request, "GET")).resolves.toEqual({
      ok: true,
    });
    expect(jsonResponseMock).not.toHaveBeenCalled();
  });

  it("requireAdminAccess maps failed admin check to json response", async () => {
    getSessionMock.mockResolvedValue(null);
    requireAdminMock.mockReturnValue({
      status: 403,
      body: { ok: false, code: "FORBIDDEN", error: "Admin access required." },
    });

    const request = {
      headers: new Headers({ origin: "http://localhost:3000" }),
    } as never;

    const result = await requireAdminAccess(request, "GET,OPTIONS");

    expect(result.ok).toBe(false);
    expect(jsonResponseMock).toHaveBeenCalledWith(
      { ok: false, code: "FORBIDDEN", error: "Admin access required." },
      {
        status: 403,
        methods: "GET,OPTIONS",
        origin: "http://localhost:3000",
      },
    );
  });

  it("requireAdminLayoutAccess returns ok=true when admin check passes", async () => {
    headersMock.mockResolvedValue(new Headers({ "next-url": "/admin/users" }));
    getSessionMock.mockResolvedValue({
      user: { id: "u_1", email: "admin@example.com", role: "ADMIN" },
    });
    requireAdminMock.mockReturnValue({ status: 200, body: { ok: true } });

    await expect(requireAdminLayoutAccess()).resolves.toEqual({ ok: true });
  });

  it("uses next-url for returnTo when it is an admin path", async () => {
    headersMock.mockResolvedValue(
      new Headers({ "next-url": "/admin/users?tab=all" }),
    );
    getSessionMock.mockResolvedValue(null);
    requireAdminMock.mockReturnValue({
      status: 401,
      body: {
        ok: false,
        code: "UNAUTHENTICATED",
        error: "Authentication required.",
      },
    });

    await expect(requireAdminLayoutAccess()).resolves.toEqual({
      ok: false,
      status: 401,
      returnTo: "/admin/users?tab=all",
    });
  });

  it("uses admin referer path when next-url is missing", async () => {
    headersMock.mockResolvedValue(
      new Headers({
        referer: "https://example.com/admin/users?filter=active",
      }),
    );
    getSessionMock.mockResolvedValue(null);
    requireAdminMock.mockReturnValue({
      status: 403,
      body: { ok: false, code: "FORBIDDEN", error: "Admin access required." },
    });

    await expect(requireAdminLayoutAccess()).resolves.toEqual({
      ok: false,
      status: 403,
      returnTo: "/admin/users?filter=active",
    });
  });

  it("falls back to /admin when headers do not contain admin path", async () => {
    headersMock.mockResolvedValue(
      new Headers({
        "next-url": "/profile",
        referer: "https://example.com/dashboard",
      }),
    );
    getSessionMock.mockResolvedValue(null);
    requireAdminMock.mockReturnValue({
      status: 403,
      body: { ok: false, code: "FORBIDDEN", error: "Admin access required." },
    });

    await expect(requireAdminLayoutAccess()).resolves.toEqual({
      ok: false,
      status: 403,
      returnTo: "/admin",
    });
  });
});
