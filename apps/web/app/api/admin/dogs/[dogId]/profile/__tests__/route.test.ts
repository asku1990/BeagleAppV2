import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAdminDogProfileMock, getSessionCurrentUserMock } = vi.hoisted(
  () => ({
    getAdminDogProfileMock: vi.fn(),
    getSessionCurrentUserMock: vi.fn(),
  }),
);

vi.mock("@beagle/server", () => ({
  getAdminDogProfile: getAdminDogProfileMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

describe("admin dog profile api route", () => {
  beforeEach(() => {
    getAdminDogProfileMock.mockReset();
    getSessionCurrentUserMock.mockReset();
  });

  it("passes the session user through and returns the service response", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "a1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: null,
    });
    getAdminDogProfileMock.mockResolvedValue({
      status: 200,
      body: { ok: true, data: { dog: { id: "dog-1" } } },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/dog-1/profile",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ dogId: "dog-1" }),
    });

    expect(response.status).toBe(200);
    expect(getAdminDogProfileMock).toHaveBeenCalledWith("dog-1", {
      id: "a1",
      email: "admin@example.com",
      username: "Admin",
      role: "ADMIN",
    });
  });

  it("returns unauthorized when there is no session user", async () => {
    getSessionCurrentUserMock.mockResolvedValue(null);
    getAdminDogProfileMock.mockResolvedValue({
      status: 401,
      body: {
        ok: false,
        error: "Not authenticated.",
        code: "UNAUTHENTICATED",
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/dog-1/profile",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ dogId: "dog-1" }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Not authenticated.",
      code: "UNAUTHENTICATED",
    });
  });
});
