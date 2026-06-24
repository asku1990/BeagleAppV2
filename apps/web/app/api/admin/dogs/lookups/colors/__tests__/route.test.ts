import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  listAdminDogColorOptionsMock,
  getSessionCurrentUserMock,
  toAdminUserContextMock,
} = vi.hoisted(() => ({
  listAdminDogColorOptionsMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  toAdminUserContextMock: vi.fn(),
}));

vi.mock("@beagle/server", () => ({
  listAdminDogColorOptions: listAdminDogColorOptionsMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@/lib/server/admin-user-context", () => ({
  toAdminUserContext: toAdminUserContextMock,
}));

describe("admin dog color lookup api route", () => {
  beforeEach(() => {
    listAdminDogColorOptionsMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    toAdminUserContextMock.mockReset();
  });

  it("returns CORS preflight responses", async () => {
    const { OPTIONS } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/lookups/colors",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );

    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
  });

  it("returns color options for admins", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    toAdminUserContextMock.mockReturnValue({
      id: "u_1",
      email: "admin@example.com",
      username: "admin",
      role: "ADMIN",
    });
    listAdminDogColorOptionsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [
            {
              code: 121,
              nameFi: "Kolmivärinen",
              nameSv: "Trefärgad",
              nameEn: null,
              status: "SELECTABLE",
            },
          ],
        },
      },
    });

    const { GET } = await import("../route");
    const request = new NextRequest(
      "http://localhost/api/admin/dogs/lookups/colors",
      {
        headers: { origin: "http://localhost:3000" },
      },
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      data: {
        items: [
          {
            code: 121,
            nameFi: "Kolmivärinen",
            nameSv: "Trefärgad",
            nameEn: null,
            status: "SELECTABLE",
          },
        ],
      },
    });
    expect(listAdminDogColorOptionsMock).toHaveBeenCalledWith({
      id: "u_1",
      email: "admin@example.com",
      username: "admin",
      role: "ADMIN",
    });
  });

  it("returns structured errors when the server use case fails", async () => {
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_2",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
    });
    toAdminUserContextMock.mockReturnValue({
      id: "u_2",
      email: "admin@example.com",
      username: "admin",
      role: "ADMIN",
    });
    listAdminDogColorOptionsMock.mockResolvedValue({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load dog color options.",
        code: "INTERNAL_ERROR",
      },
    });

    const { GET } = await import("../route");
    const response = await GET(
      new NextRequest("http://localhost/api/admin/dogs/lookups/colors", {
        headers: { origin: "http://localhost:3000" },
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Failed to load dog color options.",
      code: "INTERNAL_ERROR",
    });
  });
});
