import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminBreederOptionsAction } from "../get-admin-breeder-options";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  listAdminBreederOptionsMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  listAdminBreederOptionsMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  listAdminBreederOptions: listAdminBreederOptionsMock,
}));

describe("getAdminBreederOptionsAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    listAdminBreederOptionsMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(getAdminBreederOptionsAction({})).resolves.toEqual({
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
    listAdminBreederOptionsMock.mockResolvedValue({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load breeder options.",
        code: "INTERNAL_ERROR",
      },
    });

    await expect(getAdminBreederOptionsAction({})).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INTERNAL_ERROR",
    });
  });

  it("returns breeder options when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    listAdminBreederOptionsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [{ id: "br_1", name: "Metsapolun" }],
        },
      },
    });

    await expect(
      getAdminBreederOptionsAction({ query: "metsa", limit: 20 }),
    ).resolves.toEqual({
      data: {
        items: [{ id: "br_1", name: "Metsapolun" }],
      },
      hasError: false,
    });
  });
});
