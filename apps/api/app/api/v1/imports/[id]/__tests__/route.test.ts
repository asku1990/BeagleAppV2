import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getImportRunIssuesMock,
  getImportRunMock,
  getUserFromSessionTokenMock,
  requireAdminMock,
} = vi.hoisted(() => ({
  getImportRunMock: vi.fn(),
  getImportRunIssuesMock: vi.fn(),
  getUserFromSessionTokenMock: vi.fn(),
  requireAdminMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  authService: {
    getUserFromSessionToken: getUserFromSessionTokenMock,
  },
  importsService: {
    getImportRun: getImportRunMock,
    getImportRunIssues: getImportRunIssuesMock,
  },
  requireAdmin: requireAdminMock,
}));

describe("import admin routes", () => {
  beforeEach(() => {
    getImportRunMock.mockReset();
    getImportRunIssuesMock.mockReset();
    getUserFromSessionTokenMock.mockReset();
    requireAdminMock.mockReset();
  });

  it("returns 401 for import run endpoint when session is missing", async () => {
    getUserFromSessionTokenMock.mockResolvedValue(null);
    requireAdminMock.mockReturnValue({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest("http://localhost/api/v1/imports/run-1", {
      headers: { origin: "http://localhost:3000" },
    });
    const response = await GET(request, {
      params: Promise.resolve({ id: "run-1" }),
    });

    expect(getUserFromSessionTokenMock).toHaveBeenCalledWith(undefined);
    expect(response.status).toBe(401);
  });

  it("returns 403 for import run endpoint when user is not admin", async () => {
    getUserFromSessionTokenMock.mockResolvedValue({
      id: "u1",
      role: "USER",
      email: "user@example.com",
      username: "user",
    });
    requireAdminMock.mockReturnValue({
      status: 403,
      body: {
        ok: false,
        error: "Admin role required.",
        code: "FORBIDDEN",
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest("http://localhost/api/v1/imports/run-1", {
      headers: {
        cookie: "beagle_session=token",
        origin: "http://localhost:3000",
      },
    });
    const response = await GET(request, {
      params: Promise.resolve({ id: "run-1" }),
    });

    expect(response.status).toBe(403);
  });

  it("returns 200 for import run endpoint when user is admin", async () => {
    getUserFromSessionTokenMock.mockResolvedValue({
      id: "a1",
      role: "ADMIN",
      email: "admin@example.com",
      username: "admin",
    });
    requireAdminMock.mockReturnValue({
      status: 200,
      body: { ok: true, data: { authorized: true } },
    });
    getImportRunMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { id: "run-1" } },
    });

    const { GET } = await import("../route");
    const request = new NextRequest("http://localhost/api/v1/imports/run-1", {
      headers: {
        cookie: "beagle_session=token",
        origin: "http://localhost:3000",
      },
    });
    const response = await GET(request, {
      params: Promise.resolve({ id: "run-1" }),
    });

    expect(response.status).toBe(200);
    expect(getImportRunMock).toHaveBeenCalledWith("run-1");
  });

  it("returns 401 for import issues endpoint when session is missing", async () => {
    getUserFromSessionTokenMock.mockResolvedValue(null);
    requireAdminMock.mockReturnValue({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    const { GET } = await import("../issues/route");
    const request = new NextRequest(
      "http://localhost/api/v1/imports/run-1/issues",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "run-1" }),
    });

    expect(response.status).toBe(401);
  });

  it("returns 403 for import issues endpoint when user is not admin", async () => {
    getUserFromSessionTokenMock.mockResolvedValue({
      id: "u1",
      role: "USER",
      email: "user@example.com",
      username: "user",
    });
    requireAdminMock.mockReturnValue({
      status: 403,
      body: {
        ok: false,
        error: "Admin role required.",
        code: "FORBIDDEN",
      },
    });

    const { GET } = await import("../issues/route");
    const request = new NextRequest(
      "http://localhost/api/v1/imports/run-1/issues",
      {
        headers: {
          cookie: "beagle_session=token",
          origin: "http://localhost:3000",
        },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "run-1" }),
    });

    expect(response.status).toBe(403);
  });

  it("returns 200 for import issues endpoint when user is admin", async () => {
    getUserFromSessionTokenMock.mockResolvedValue({
      id: "a1",
      role: "ADMIN",
      email: "admin@example.com",
      username: "admin",
    });
    requireAdminMock.mockReturnValue({
      status: 200,
      body: { ok: true, data: { authorized: true } },
    });
    getImportRunIssuesMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { items: [], page: { hasMore: false } } },
    });

    const { GET } = await import("../issues/route");
    const request = new NextRequest(
      "http://localhost/api/v1/imports/run-1/issues?limit=20",
      {
        headers: {
          cookie: "beagle_session=token",
          origin: "http://localhost:3000",
        },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "run-1" }),
    });

    expect(response.status).toBe(200);
    expect(getImportRunIssuesMock).toHaveBeenCalledWith("run-1", {
      stage: undefined,
      code: undefined,
      severity: undefined,
      cursor: undefined,
      limit: 20,
    });
  });
});
