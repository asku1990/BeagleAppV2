import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminOwnerOptionsAction } from "../get-admin-owner-options";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  listAdminOwnerOptionsMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  listAdminOwnerOptionsMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  listAdminOwnerOptions: listAdminOwnerOptionsMock,
}));

describe("getAdminOwnerOptionsAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    listAdminOwnerOptionsMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(getAdminOwnerOptionsAction({})).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "FORBIDDEN",
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
    listAdminOwnerOptionsMock.mockResolvedValue({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load owner options.",
        code: "INTERNAL_ERROR",
      },
    });

    await expect(getAdminOwnerOptionsAction({})).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INTERNAL_ERROR",
    });
  });

  it("returns owner options when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    listAdminOwnerOptionsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [{ id: "ow_1", name: "Aalto Esa" }],
        },
      },
    });

    await expect(
      getAdminOwnerOptionsAction({ query: "esa", limit: 20 }),
    ).resolves.toEqual({
      data: {
        items: [{ id: "ow_1", name: "Aalto Esa" }],
      },
      hasError: false,
    });
  });
});
