import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminDogColorOptionsAction } from "../get-admin-dog-color-options";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  listAdminDogColorOptionsMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  listAdminDogColorOptionsMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  listAdminDogColorOptions: listAdminDogColorOptionsMock,
}));

describe("getAdminDogColorOptionsAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    listAdminDogColorOptionsMock.mockReset();
  });

  it("returns unauthenticated when admin access is denied with 401", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 401 });

    await expect(getAdminDogColorOptionsAction()).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
    });
  });

  it("returns unauthenticated when there is no current user", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue(null);

    await expect(getAdminDogColorOptionsAction()).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "UNAUTHENTICATED",
    });
  });

  it("returns color options when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    listAdminDogColorOptionsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [{ id: "dc_1", name: "Musta" }],
        },
      },
    });

    await expect(getAdminDogColorOptionsAction()).resolves.toEqual({
      data: {
        items: [{ id: "dc_1", name: "Musta" }],
      },
      hasError: false,
    });
  });

  it("returns service error code when lookup fails", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    listAdminDogColorOptionsMock.mockResolvedValue({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load color options.",
        code: "INTERNAL_ERROR",
      },
    });

    await expect(getAdminDogColorOptionsAction()).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INTERNAL_ERROR",
    });
  });
});
