import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { listAdminTrialsMock, getSessionCurrentUserMock } = vi.hoisted(() => ({
  listAdminTrialsMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  listAdminTrials: listAdminTrialsMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@/lib/server/admin-user-context", () => ({
  toAdminUserContext: (
    currentUser: {
      id: string;
      email: string;
      name: string | null;
      role: "ADMIN" | "USER";
    } | null,
  ) =>
    currentUser
      ? {
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.name,
          role: currentUser.role,
        }
      : null,
}));

vi.mock("@/lib/server/cors", () => ({
  jsonResponse: (body: unknown, init: { status?: number } = {}) =>
    new Response(JSON.stringify(body), {
      status: init.status ?? 200,
      headers: { "Content-Type": "application/json" },
    }),
  optionsResponse: () => new Response(null, { status: 204 }),
}));

describe("admin trials api route", () => {
  beforeEach(() => {
    listAdminTrialsMock.mockReset();
    getSessionCurrentUserMock.mockReset();
  });

  it("returns admin trial search results", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    listAdminTrialsMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { items: [], total: 0, totalPages: 0, page: 1 } },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/trials?query=beagle&page=2&pageSize=10&sort=date-asc",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(listAdminTrialsMock).toHaveBeenCalledWith(
      {
        query: "beagle",
        page: 2,
        pageSize: 10,
        sort: "date-asc",
      },
      {
        id: "a1",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      },
    );
  });

  it("returns structured errors when the service throws", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    listAdminTrialsMock.mockRejectedValue(new Error("boom"));

    const { GET } = await import("../route");
    const request = new NextRequest("http://localhost/api/admin/trials", {
      headers: { origin: "http://localhost:3000" },
    });
    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Failed to load admin trials.",
      code: "INTERNAL_ERROR",
    });
  });

  it("passes invalid sort through to the service for validation", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    listAdminTrialsMock.mockResolvedValue({
      status: 400,
      body: { ok: false, error: "Invalid sort value.", code: "INVALID_SORT" },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/trials?sort=broken-sort",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(listAdminTrialsMock).toHaveBeenCalledWith(
      {
        query: undefined,
        page: undefined,
        pageSize: undefined,
        sort: "broken-sort",
      },
      {
        id: "a1",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      },
    );
  });
});
