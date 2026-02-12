import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { loginMock, logoutMock, meMock, registerMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  logoutMock: vi.fn(),
  meMock: vi.fn(),
  registerMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  authService: {
    login: loginMock,
    register: registerMock,
    me: meMock,
    logout: logoutMock,
  },
}));

describe("auth routes", () => {
  beforeEach(() => {
    loginMock.mockReset();
    registerMock.mockReset();
    meMock.mockReset();
    logoutMock.mockReset();
  });

  it("login returns 400 for invalid JSON body", async () => {
    const { POST } = await import("../login/route");
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: "{",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid JSON body.",
    });
  });

  it("login returns 401 without setting session cookie for invalid creds", async () => {
    loginMock.mockResolvedValue({
      status: 401,
      body: { ok: false, error: "Invalid credentials." },
    });

    const { POST } = await import("../login/route");
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ email: "x@example.com", password: "bad" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("login sets secure session cookie flags on success", async () => {
    loginMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: { id: "u1", email: "x@example.com", username: "x", role: "USER" },
      },
      session: {
        sessionToken: "session-token",
        expires: new Date("2030-01-01T00:00:00.000Z"),
      },
    });

    const { POST } = await import("../login/route");
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ email: "x@example.com", password: "good" }),
    });
    const response = await POST(request);

    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("beagle_session=session-token");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("SameSite=lax");
  });

  it("register returns 400 for invalid JSON body", async () => {
    const { POST } = await import("../register/route");
    const request = new Request("http://localhost/api/auth/register", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: "{",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Invalid JSON body.",
    });
  });

  it("me returns 401 when session is missing", async () => {
    meMock.mockResolvedValue({
      status: 401,
      body: { ok: false, error: "Not authenticated." },
    });

    const { GET } = await import("../me/route");
    const request = new NextRequest("http://localhost/api/auth/me", {
      headers: { origin: "http://localhost:3000" },
    });
    const response = await GET(request);

    expect(meMock).toHaveBeenCalledWith(undefined);
    expect(response.status).toBe(401);
  });

  it("me returns 200 for valid session", async () => {
    meMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: { id: "u1", email: "x@example.com", username: "x", role: "USER" },
      },
    });

    const { GET } = await import("../me/route");
    const request = new NextRequest("http://localhost/api/auth/me", {
      headers: {
        cookie: "beagle_session=valid-token",
        origin: "http://localhost:3000",
      },
    });
    const response = await GET(request);

    expect(meMock).toHaveBeenCalledWith("valid-token");
    expect(response.status).toBe(200);
  });

  it("logout clears session cookie", async () => {
    logoutMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { success: true } },
    });

    const { POST } = await import("../logout/route");
    const request = new NextRequest("http://localhost/api/auth/logout", {
      method: "POST",
      headers: {
        cookie: "beagle_session=valid-token",
        origin: "http://localhost:3000",
      },
    });
    const response = await POST(request);

    expect(logoutMock).toHaveBeenCalledWith("valid-token");
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("beagle_session=");
    expect(cookie).toContain("Expires=Thu, 01 Jan 1970");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Path=/");
  });
});
