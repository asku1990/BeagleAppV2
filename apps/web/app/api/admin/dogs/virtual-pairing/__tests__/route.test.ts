import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { searchAdminVirtualPairingMock, getSessionCurrentUserMock } = vi.hoisted(
  () => ({
    searchAdminVirtualPairingMock: vi.fn(),
    getSessionCurrentUserMock: vi.fn(),
  }),
);

vi.mock("@beagle/server", () => ({
  searchAdminVirtualPairing: searchAdminVirtualPairingMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

describe("admin virtual pairing api route", () => {
  beforeEach(() => {
    searchAdminVirtualPairingMock.mockReset();
    getSessionCurrentUserMock.mockReset();
  });

  it("returns search results for admins", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    searchAdminVirtualPairingMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          field: "name",
          query: "Kide",
          total: 1,
          totalPages: 1,
          page: 1,
          isLimited: false,
          candidateLimit: null,
          items: [],
        },
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/virtual-pairing?field=name&query=Kide&page=2&pageSize=10",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(searchAdminVirtualPairingMock).toHaveBeenCalledWith(
      {
        field: "name",
        query: "Kide",
        page: 2,
        pageSize: 10,
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
    searchAdminVirtualPairingMock.mockRejectedValue(new Error("boom"));

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/virtual-pairing?field=name&query=Kide",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Failed to load virtual pairing search results.",
      code: "INTERNAL_ERROR",
    });
  });
});
