import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminParentOptionsAction } from "../get-admin-parent-options";

const {
  requireAdminLayoutAccessMock,
  getSessionCurrentUserMock,
  listAdminDogParentOptionsMock,
} = vi.hoisted(() => ({
  requireAdminLayoutAccessMock: vi.fn(),
  getSessionCurrentUserMock: vi.fn(),
  listAdminDogParentOptionsMock: vi.fn(),
}));

vi.mock("@/lib/server/admin-guard", () => ({
  requireAdminLayoutAccess: requireAdminLayoutAccessMock,
}));

vi.mock("@/lib/server/current-user", () => ({
  getSessionCurrentUser: getSessionCurrentUserMock,
}));

vi.mock("@beagle/server", () => ({
  listAdminDogParentOptions: listAdminDogParentOptionsMock,
}));

describe("getAdminParentOptionsAction", () => {
  beforeEach(() => {
    requireAdminLayoutAccessMock.mockReset();
    getSessionCurrentUserMock.mockReset();
    listAdminDogParentOptionsMock.mockReset();
  });

  it("returns forbidden when user is not admin", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: false, status: 403 });

    await expect(getAdminParentOptionsAction({})).resolves.toEqual({
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
    listAdminDogParentOptionsMock.mockResolvedValue({
      status: 500,
      body: {
        ok: false,
        error: "Failed to load parent options.",
        code: "INTERNAL_ERROR",
      },
    });

    await expect(getAdminParentOptionsAction({})).resolves.toEqual({
      data: null,
      hasError: true,
      errorCode: "INTERNAL_ERROR",
    });
  });

  it("returns parent options when service succeeds", async () => {
    requireAdminLayoutAccessMock.mockResolvedValue({ ok: true });
    getSessionCurrentUserMock.mockResolvedValue({
      id: "u_1",
      email: "admin@example.com",
      name: "Admin",
      role: "ADMIN",
      createdAt: null,
      sessionId: "s_1",
    });
    listAdminDogParentOptionsMock.mockResolvedValue({
      status: 200,
      body: {
        ok: true,
        data: {
          items: [
            {
              id: "dog_1",
              name: "Korven Aatos",
              sex: "MALE",
              registrationNo: "FI54321/20",
            },
          ],
        },
      },
    });

    await expect(
      getAdminParentOptionsAction({ query: "korven", limit: 20 }),
    ).resolves.toEqual({
      data: {
        items: [
          {
            id: "dog_1",
            name: "Korven Aatos",
            sex: "MALE",
            registrationNo: "FI54321/20",
          },
        ],
      },
      hasError: false,
    });
  });
});
