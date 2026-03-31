import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAdminShowEventMock,
  listAdminShowEventsMock,
  getSessionCurrentUserMock,
} = vi.hoisted(() => ({
  getAdminShowEventMock: vi.fn(),
  listAdminShowEventsMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  getAdminShowEvent: getAdminShowEventMock,
  listAdminShowEvents: listAdminShowEventsMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

describe("admin show api routes", () => {
  beforeEach(() => {
    getAdminShowEventMock.mockReset();
    listAdminShowEventsMock.mockReset();
    getSessionCurrentUserMock.mockReset();
  });

  it("returns admin show search results", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    listAdminShowEventsMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { items: [], total: 0, totalPages: 0, page: 1 } },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/shows?query=beagle&page=2&pageSize=10&sort=date-asc",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(listAdminShowEventsMock).toHaveBeenCalledWith(
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

  it("passes invalid sort through to the service for validation", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    listAdminShowEventsMock.mockResolvedValue({
      status: 400,
      body: { ok: false, error: "Invalid sort value.", code: "INVALID_SORT" },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/shows?sort=broken-sort",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    expect(listAdminShowEventsMock).toHaveBeenCalledWith(
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

  it("returns admin show details", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    getAdminShowEventMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { show: { showId: "show-1" } } },
    });

    const { GET } = await import("../[showId]/route");
    const request = new NextRequest("http://localhost/api/admin/shows/show-1", {
      headers: { origin: "http://localhost:3000" },
    });
    const response = await GET(request, {
      params: Promise.resolve({ showId: "show-1" }),
    });

    expect(response.status).toBe(200);
    expect(getAdminShowEventMock).toHaveBeenCalledWith(
      { showId: "show-1" },
      {
        id: "a1",
        email: "admin@example.com",
        username: "admin",
        role: "ADMIN",
      },
    );
  });
});
